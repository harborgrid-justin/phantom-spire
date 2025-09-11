//! Playbook Engine
//! 
//! Automated playbook execution engine for NIST SP 800-61r2 compliant incident response
//! Orchestrates response actions, manages step dependencies, and provides execution tracking

use crate::playbook_models::*;
use crate::incident_models::*;
use crate::response_actions::*;
use crate::data_stores::*;
use crate::config::Config;

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock, Semaphore};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use async_trait::async_trait;

/// Playbook execution engine
pub struct PlaybookEngine {
    data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
    config: Config,
    active_executions: Arc<RwLock<HashMap<String, PlaybookExecution>>>,
    execution_semaphore: Arc<Semaphore>,
    approval_queue: Arc<RwLock<Vec<PendingApproval>>>,
}

/// Playbook execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookExecutionResult {
    pub execution_id: String,
    pub playbook_id: String,
    pub incident_id: String,
    pub status: PlaybookStatus,
    pub started_at: i64,
    pub completed_at: Option<i64>,
    pub steps_executed: u32,
    pub steps_failed: u32,
    pub steps_skipped: u32,
    pub output: HashMap<String, String>,
    pub errors: Vec<String>,
}

/// Step execution context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepExecutionContext {
    pub incident: Incident,
    pub playbook: ResponsePlaybook,
    pub execution: PlaybookExecution,
    pub step: PlaybookStep,
    pub variables: HashMap<String, String>,
    pub tenant_context: TenantContext,
}

/// Pending approval for execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PendingApproval {
    pub id: String,
    pub execution_id: String,
    pub step_id: String,
    pub action_type: String,
    pub description: String,
    pub requested_by: String,
    pub requested_at: i64,
    pub approvers: Vec<String>,
    pub timeout_at: i64,
    pub context: HashMap<String, String>,
}

/// Approval decision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalDecision {
    pub approval_id: String,
    pub decision: ApprovalResult,
    pub approver: String,
    pub approved_at: i64,
    pub comments: String,
}

/// Approval result
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ApprovalResult {
    Approved,
    Rejected,
    Timeout,
}

/// Step execution trait for pluggable actions
#[async_trait]
pub trait StepExecutor: Send + Sync {
    async fn execute(&self, context: &StepExecutionContext) -> Result<StepExecutionResult, Box<dyn std::error::Error + Send + Sync>>;
    fn get_action_type(&self) -> String;
    fn requires_approval(&self) -> bool;
    fn get_timeout_seconds(&self) -> u32;
}

/// Step execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepExecutionResult {
    pub success: bool,
    pub output: HashMap<String, String>,
    pub artifacts: Vec<String>,
    pub next_steps: Vec<String>,
    pub errors: Vec<String>,
    pub duration_seconds: u32,
}

impl PlaybookEngine {
    /// Create new playbook engine
    pub fn new(
        data_store: Arc<dyn ComprehensiveIncidentResponseStore + Send + Sync>,
        config: Config,
    ) -> Self {
        let max_executions = config.playbooks.max_concurrent_executions as usize;
        
        Self {
            data_store,
            config,
            active_executions: Arc::new(RwLock::new(HashMap::new())),
            execution_semaphore: Arc::new(Semaphore::new(max_executions)),
            approval_queue: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// Execute playbook for incident
    pub async fn execute_playbook(
        &self,
        playbook_id: &str,
        incident_id: &str,
        executor: &str,
        tenant_context: &TenantContext,
    ) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
        // Acquire execution permit
        let _permit = self.execution_semaphore.acquire().await?;

        // Load playbook and incident
        let playbook = self.data_store.get_playbook(playbook_id, tenant_context).await?
            .ok_or("Playbook not found")?;
            
        let incident = self.data_store.get_incident(incident_id, tenant_context).await?
            .ok_or("Incident not found")?;

        // Validate playbook applicability
        self.validate_playbook_applicability(&playbook, &incident)?;

        // Create execution record
        let execution_id = Uuid::new_v4().to_string();
        let mut execution = PlaybookExecution {
            id: execution_id.clone(),
            incident_id: incident_id.to_string(),
            playbook_id: playbook_id.to_string(),
            started_by: executor.to_string(),
            started_at: Utc::now().timestamp(),
            completed_at: None,
            status: PlaybookStatus::InProgress,
            step_executions: vec![],
            notes: String::new(),
        };

        // Store execution
        self.data_store.store_playbook_execution(&execution, tenant_context).await?;

        // Add to active executions
        {
            let mut active = self.active_executions.write().await;
            active.insert(execution_id.clone(), execution.clone());
        }

        // Start execution in background
        let engine_clone = Arc::new(self.clone());
        let execution_id_clone = execution_id.clone();
        let tenant_context_clone = tenant_context.clone();
        
        tokio::spawn(async move {
            let result = engine_clone.execute_playbook_steps(
                &execution_id_clone,
                &tenant_context_clone,
            ).await;

            if let Err(e) = result {
                eprintln!("Playbook execution failed: {}", e);
            }
        });

        Ok(execution_id)
    }

    /// Execute all playbook steps
    async fn execute_playbook_steps(
        &self,
        execution_id: &str,
        tenant_context: &TenantContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut execution = {
            let active = self.active_executions.read().await;
            active.get(execution_id).ok_or("Execution not found")?.clone()
        };

        let playbook = self.data_store.get_playbook(&execution.playbook_id, tenant_context).await?
            .ok_or("Playbook not found")?;

        let incident = self.data_store.get_incident(&execution.incident_id, tenant_context).await?
            .ok_or("Incident not found")?;

        // Sort steps by step number
        let mut steps = playbook.steps.clone();
        steps.sort_by_key(|s| s.step_number);

        // Execute steps sequentially
        for step in steps {
            // Check dependencies
            if !self.check_step_dependencies(&step, &execution).await? {
                self.skip_step(&mut execution, &step, "Dependencies not met").await?;
                continue;
            }

            // Execute step
            match self.execute_single_step(&step, &execution, &incident, &playbook, tenant_context).await {
                Ok(result) => {
                    self.record_step_success(&mut execution, &step, result).await?;
                }
                Err(e) => {
                    self.record_step_failure(&mut execution, &step, e.to_string()).await?;
                    
                    // Check if this is a critical step
                    if step.verification_criteria.contains(&"critical".to_string()) {
                        execution.status = PlaybookStatus::Failed;
                        break;
                    }
                }
            }

            // Update execution progress
            self.update_execution_progress(&mut execution, tenant_context).await?;
        }

        // Finalize execution
        execution.completed_at = Some(Utc::now().timestamp());
        if execution.status == PlaybookStatus::InProgress {
            execution.status = PlaybookStatus::Completed;
        }

        // Store final execution state
        self.data_store.update_playbook_execution(&execution, tenant_context).await?;

        // Remove from active executions
        {
            let mut active = self.active_executions.write().await;
            active.remove(execution_id);
        }

        Ok(())
    }

    /// Execute a single playbook step
    async fn execute_single_step(
        &self,
        step: &PlaybookStep,
        execution: &PlaybookExecution,
        incident: &Incident,
        playbook: &ResponsePlaybook,
        tenant_context: &TenantContext,
    ) -> Result<StepExecutionResult, Box<dyn std::error::Error + Send + Sync>> {
        let context = StepExecutionContext {
            incident: incident.clone(),
            playbook: playbook.clone(),
            execution: execution.clone(),
            step: step.clone(),
            variables: HashMap::new(),
            tenant_context: tenant_context.clone(),
        };

        // Check if approval is required
        if self.requires_approval(step) {
            self.request_approval(&context).await?;
            self.wait_for_approval(&context).await?;
        }

        // Get appropriate executor
        let executor = self.get_step_executor(step)?;

        // Execute with timeout
        let timeout_duration = std::time::Duration::from_secs(
            self.config.playbooks.step_timeout_minutes as u64 * 60
        );

        let result = tokio::time::timeout(
            timeout_duration,
            executor.execute(&context)
        ).await??;

        Ok(result)
    }

    /// Check if step requires approval
    fn requires_approval(&self, step: &PlaybookStep) -> bool {
        if let Some(automation_script) = &step.automation_script {
            return self.config.playbooks.approval_required.iter()
                .any(|action| automation_script.contains(action));
        }
        false
    }

    /// Request approval for step execution
    async fn request_approval(
        &self,
        context: &StepExecutionContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let approval_id = Uuid::new_v4().to_string();
        let timeout_minutes = self.config.playbooks.step_timeout_minutes;
        
        let pending_approval = PendingApproval {
            id: approval_id.clone(),
            execution_id: context.execution.id.clone(),
            step_id: context.step.id.clone(),
            action_type: context.step.title.clone(),
            description: context.step.description.clone(),
            requested_by: context.execution.started_by.clone(),
            requested_at: Utc::now().timestamp(),
            approvers: self.get_required_approvers(&context.step),
            timeout_at: Utc::now().timestamp() + (timeout_minutes as i64 * 60),
            context: HashMap::new(),
        };

        // Add to approval queue
        {
            let mut queue = self.approval_queue.write().await;
            queue.push(pending_approval);
        }

        // Send notifications to approvers
        self.notify_approvers(&approval_id).await?;

        Ok(())
    }

    /// Wait for approval decision
    async fn wait_for_approval(
        &self,
        context: &StepExecutionContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let timeout_duration = std::time::Duration::from_secs(
            self.config.playbooks.step_timeout_minutes as u64 * 60
        );

        let start_time = std::time::Instant::now();
        
        loop {
            // Check if approval is complete
            let approval_status = self.check_approval_status(&context.execution.id, &context.step.id).await?;
            
            match approval_status {
                Some(ApprovalResult::Approved) => return Ok(()),
                Some(ApprovalResult::Rejected) => return Err("Step execution rejected by approver".into()),
                Some(ApprovalResult::Timeout) => return Err("Approval request timed out".into()),
                None => {
                    // Still pending, check timeout
                    if start_time.elapsed() > timeout_duration {
                        return Err("Approval request timed out".into());
                    }
                    
                    // Wait before checking again
                    tokio::time::sleep(std::time::Duration::from_secs(30)).await;
                }
            }
        }
    }

    /// Get step executor based on a step type
    fn get_step_executor(&self, step: &PlaybookStep) -> Result<Box<dyn StepExecutor>, Box<dyn std::error::Error + Send + Sync>> {
        // This would be expanded with actual executor implementations
        Ok(Box::new(DefaultStepExecutor::new(step.clone())))
    }

    /// Check step dependencies
    async fn check_step_dependencies(
        &self,
        step: &PlaybookStep,
        execution: &PlaybookExecution,
    ) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        for dependency in &step.dependencies {
            let dependency_completed = execution.step_executions.iter()
                .any(|se| se.step_id == *dependency && se.status == PlaybookStatus::Completed);
                
            if !dependency_completed {
                return Ok(false);
            }
        }
        Ok(true)
    }

    /// Skip step execution
    async fn skip_step(
        &self,
        execution: &mut PlaybookExecution,
        step: &PlaybookStep,
        reason: &str,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let step_execution = StepExecution {
            step_id: step.id.clone(),
            executed_by: "system".to_string(),
            started_at: Utc::now().timestamp(),
            completed_at: Some(Utc::now().timestamp()),
            status: PlaybookStatus::Skipped,
            notes: reason.to_string(),
            output: HashMap::new(),
        };

        execution.step_executions.push(step_execution);
        Ok(())
    }

    /// Record successful step execution
    async fn record_step_success(
        &self,
        execution: &mut PlaybookExecution,
        step: &PlaybookStep,
        result: StepExecutionResult,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let step_execution = StepExecution {
            step_id: step.id.clone(),
            executed_by: execution.started_by.clone(),
            started_at: Utc::now().timestamp() - result.duration_seconds as i64,
            completed_at: Some(Utc::now().timestamp()),
            status: PlaybookStatus::Completed,
            notes: "Executed successfully".to_string(),
            output: result.output,
        };

        execution.step_executions.push(step_execution);
        Ok(())
    }

    /// Record failed step execution
    async fn record_step_failure(
        &self,
        execution: &mut PlaybookExecution,
        step: &PlaybookStep,
        error: String,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let step_execution = StepExecution {
            step_id: step.id.clone(),
            executed_by: execution.started_by.clone(),
            started_at: Utc::now().timestamp(),
            completed_at: Some(Utc::now().timestamp()),
            status: PlaybookStatus::Failed,
            notes: error,
            output: HashMap::new(),
        };

        execution.step_executions.push(step_execution);
        Ok(())
    }

    /// Update execution progress
    async fn update_execution_progress(
        &self,
        execution: &mut PlaybookExecution,
        tenant_context: &TenantContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Update in the data store
        self.data_store.update_playbook_execution(execution, tenant_context).await?;

        // Update in active executions
        {
            let mut active = self.active_executions.write().await;
            active.insert(execution.id.clone(), execution.clone());
        }

        Ok(())
    }

    /// Validate playbook applicability to incident
    fn validate_playbook_applicability(
        &self,
        playbook: &ResponsePlaybook,
        incident: &Incident,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Check category match
        if playbook.category != incident.category {
            return Err(format!("Playbook category {} does not match incident category {:?}", 
                             playbook.category as u8, incident.category).into());
        }

        // Check severity threshold
        // This would need more sophisticated severity comparison logic
        
        Ok(())
    }

    /// Get required approvers for step
    fn get_required_approvers(&self, step: &PlaybookStep) -> Vec<String> {
        // This would be implemented based on step requirements and configuration
        vec!["incident_commander".to_string()]
    }

    /// Notify approvers
    async fn notify_approvers(&self, approval_id: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Implementation would send notifications to approvers
        Ok(())
    }

    /// Check approval status
    async fn check_approval_status(
        &self,
        execution_id: &str,
        step_id: &str,
    ) -> Result<Option<ApprovalResult>, Box<dyn std::error::Error + Send + Sync>> {
        let queue = self.approval_queue.read().await;
        
        for approval in queue.iter() {
            if approval.execution_id == execution_id && approval.step_id == step_id {
                // Check if timed out
                if Utc::now().timestamp() > approval.timeout_at {
                    return Ok(Some(ApprovalResult::Timeout));
                }
                
                // Check for approval decision (this would be stored elsewhere in practice)
                // For now, return None (still pending)
                return Ok(None);
            }
        }
        
        Ok(None)
    }

    /// Process approval decision
    pub async fn process_approval(
        &self,
        decision: ApprovalDecision,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Remove from approval queue and record decision
        {
            let mut queue = self.approval_queue.write().await;
            queue.retain(|a| a.id != decision.approval_id);
        }

        // Store decision for step execution to pick up
        // Implementation would store this in a way that check_approval_status can access
        
        Ok(())
    }

    /// Get active executions
    pub async fn get_active_executions(&self) -> Vec<PlaybookExecution> {
        let active = self.active_executions.read().await;
        active.values().cloned().collect()
    }

    /// Stop playbook execution
    pub async fn stop_execution(
        &self,
        execution_id: &str,
        reason: &str,
        tenant_context: &TenantContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut execution = {
            let mut active = self.active_executions.write().await;
            active.remove(execution_id).ok_or("Execution not found")?
        };

        execution.status = PlaybookStatus::Failed;
        execution.completed_at = Some(Utc::now().timestamp());
        execution.notes = format!("Stopped: {}", reason);

        self.data_store.update_playbook_execution(&execution, tenant_context).await?;

        Ok(())
    }
}

// Clone implementation for PlaybookEngine
impl Clone for PlaybookEngine {
    fn clone(&self) -> Self {
        Self {
            data_store: Arc::clone(&self.data_store),
            config: self.config.clone(),
            active_executions: Arc::clone(&self.active_executions),
            execution_semaphore: Arc::clone(&self.execution_semaphore),
            approval_queue: Arc::clone(&self.approval_queue),
        }
    }
}

/// Default step executor implementation
pub struct DefaultStepExecutor {
    step: PlaybookStep,
}

impl DefaultStepExecutor {
    pub fn new(step: PlaybookStep) -> Self {
        Self { step }
    }
}

#[async_trait]
impl StepExecutor for DefaultStepExecutor {
    async fn execute(&self, context: &StepExecutionContext) -> Result<StepExecutionResult, Box<dyn std::error::Error + Send + Sync>> {
        let start_time = std::time::Instant::now();
        
        // Execute automation script if present
        if let Some(script) = &self.step.automation_script {
            self.execute_automation_script(script, context).await?;
        }

        // Record execution time
        let duration = start_time.elapsed().as_secs() as u32;

        Ok(StepExecutionResult {
            success: true,
            output: HashMap::from([
                ("step_id".to_string(), self.step.id.clone()),
                ("execution_time".to_string(), duration.to_string()),
            ]),
            artifacts: vec![],
            next_steps: vec![],
            errors: vec![],
            duration_seconds: duration,
        })
    }

    fn get_action_type(&self) -> String {
        self.step.title.clone()
    }

    fn requires_approval(&self) -> bool {
        self.step.automation_script.as_ref()
            .map(|script| script.contains("system_shutdown") || script.contains("network_isolation"))
            .unwrap_or(false)
    }

    fn get_timeout_seconds(&self) -> u32 {
        self.step.estimated_duration * 60 // Convert minutes to seconds
    }
}

impl DefaultStepExecutor {
    async fn execute_automation_script(
        &self,
        script: &str,
        _context: &StepExecutionContext,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // This would contain the actual script execution logic
        // For now, just simulate execution
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
        println!("Executing script: {}", script);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_playbook_engine_creation() {
        // Test playbook engine initialization
    }

    #[tokio::test]
    async fn test_playbook_execution() {
        // Test playbook execution flow
    }

    #[tokio::test]
    async fn test_step_dependency_checking() {
        // Test step dependency validation
    }

    #[tokio::test]
    async fn test_approval_workflow() {
        // Test approval request and processing
    }
}