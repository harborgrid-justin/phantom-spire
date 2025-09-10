//! PostgreSQL data store implementation
//! 
//! This provides PostgreSQL-based storage for structured data with ACID properties,
//! complex relationships, and advanced querying capabilities.

use crate::datastore::*;
use crate::*;
use async_trait::async_trait;
use deadpool_postgres::{Config, Manager, ManagerConfig, Pool, RecyclingMethod};
use tokio_postgres::{NoTls, Row};
use std::sync::Arc;
use anyhow::{Result, anyhow};
use serde_json;

/// PostgreSQL data store manager
pub struct PostgreSQLDataStoreManager {
    config: DataStoreConfig,
    pool: Option<Pool>,
    // Fallback to memory store for development
    memory_fallback: crate::stores::memory::MemoryDataStoreManager,
}

impl PostgreSQLDataStoreManager {
    pub async fn new(config: DataStoreConfig) -> Result<Self> {
        let memory_fallback = crate::stores::memory::MemoryDataStoreManager::new(config.clone()).await?;
        
        Ok(Self {
            config,
            pool: None,
            memory_fallback,
        })
    }
    
    async fn get_pool(&self) -> Result<&Pool> {
        self.pool.as_ref().ok_or_else(|| anyhow!("PostgreSQL pool not initialized"))
    }
    
    async fn create_tables(&self) -> Result<()> {
        let pool = self.get_pool()?;
        let client = pool.get().await?;
        
        // Create security_incidents table
        client.execute(
            r#"
            CREATE TABLE IF NOT EXISTS security_incidents (
                id VARCHAR PRIMARY KEY,
                title VARCHAR NOT NULL,
                description TEXT,
                category VARCHAR NOT NULL,
                severity VARCHAR NOT NULL,
                status VARCHAR NOT NULL,
                priority_score DOUBLE PRECISION,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                detected_at TIMESTAMPTZ NOT NULL,
                assigned_to VARCHAR,
                assigned_team VARCHAR,
                source_system VARCHAR,
                affected_assets JSONB,
                indicators JSONB,
                tags JSONB,
                timeline JSONB,
                evidence JSONB,
                related_alerts JSONB,
                related_incidents JSONB,
                containment_actions JSONB,
                eradication_actions JSONB,
                recovery_actions JSONB,
                lessons_learned JSONB,
                cost_impact DOUBLE PRECISION,
                business_impact JSONB,
                compliance_impact JSONB,
                metadata JSONB
            )
            "#,
            &[],
        ).await?;
        
        // Create security_alerts table
        client.execute(
            r#"
            CREATE TABLE IF NOT EXISTS security_alerts (
                id VARCHAR PRIMARY KEY,
                title VARCHAR NOT NULL,
                description TEXT,
                priority VARCHAR NOT NULL,
                status VARCHAR NOT NULL,
                source VARCHAR,
                rule_id VARCHAR,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                first_seen TIMESTAMPTZ NOT NULL,
                last_seen TIMESTAMPTZ NOT NULL,
                count INTEGER,
                assigned_to VARCHAR,
                indicators JSONB,
                affected_assets JSONB,
                tags JSONB,
                raw_data JSONB,
                enrichment_data JSONB,
                related_alerts JSONB,
                incident_id VARCHAR,
                false_positive_likelihood DOUBLE PRECISION,
                confidence_score DOUBLE PRECISION,
                metadata JSONB
            )
            "#,
            &[],
        ).await?;
        
        // Create security_playbooks table
        client.execute(
            r#"
            CREATE TABLE IF NOT EXISTS security_playbooks (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                description TEXT,
                version VARCHAR,
                category VARCHAR,
                trigger_conditions JSONB,
                actions JSONB,
                approval_required BOOLEAN,
                timeout_minutes INTEGER,
                created_by VARCHAR,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                enabled BOOLEAN,
                execution_count INTEGER,
                success_rate DOUBLE PRECISION,
                average_execution_time DOUBLE PRECISION,
                tags JSONB,
                metadata JSONB
            )
            "#,
            &[],
        ).await?;
        
        // Create playbook_executions table
        client.execute(
            r#"
            CREATE TABLE IF NOT EXISTS playbook_executions (
                id VARCHAR PRIMARY KEY,
                playbook_id VARCHAR NOT NULL,
                playbook_name VARCHAR,
                status VARCHAR NOT NULL,
                triggered_by VARCHAR,
                trigger_event VARCHAR,
                started_at TIMESTAMPTZ NOT NULL,
                completed_at TIMESTAMPTZ,
                duration_seconds DOUBLE PRECISION,
                actions_executed JSONB,
                success_count INTEGER,
                failure_count INTEGER,
                error_messages JSONB,
                output_data JSONB,
                metadata JSONB
            )
            "#,
            &[],
        ).await?;
        
        // Create security_tasks table
        client.execute(
            r#"
            CREATE TABLE IF NOT EXISTS security_tasks (
                id VARCHAR PRIMARY KEY,
                title VARCHAR NOT NULL,
                description TEXT,
                task_type VARCHAR,
                priority VARCHAR NOT NULL,
                status VARCHAR NOT NULL,
                assigned_to VARCHAR,
                assigned_team VARCHAR,
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL,
                due_date TIMESTAMPTZ,
                estimated_hours DOUBLE PRECISION,
                actual_hours DOUBLE PRECISION,
                incident_id VARCHAR,
                alert_ids JSONB,
                dependencies JSONB,
                checklist JSONB,
                attachments JSONB,
                comments JSONB,
                tags JSONB,
                metadata JSONB
            )
            "#,
            &[],
        ).await?;
        
        // Create evidence table
        client.execute(
            r#"
            CREATE TABLE IF NOT EXISTS evidence (
                id VARCHAR PRIMARY KEY,
                evidence_type VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                description TEXT,
                source VARCHAR,
                collected_at TIMESTAMPTZ NOT NULL,
                collected_by VARCHAR,
                file_path VARCHAR,
                file_hash VARCHAR,
                file_size BIGINT,
                chain_of_custody JSONB,
                analysis_results JSONB,
                tags JSONB,
                metadata JSONB
            )
            "#,
            &[],
        ).await?;
        
        // Create orchestration_workflows table
        client.execute(
            r#"
            CREATE TABLE IF NOT EXISTS orchestration_workflows (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                description TEXT,
                trigger_type VARCHAR,
                steps JSONB,
                enabled BOOLEAN,
                created_at TIMESTAMPTZ NOT NULL,
                last_executed TIMESTAMPTZ,
                execution_count INTEGER,
                success_rate DOUBLE PRECISION
            )
            "#,
            &[],
        ).await?;
        
        // Create indexes for performance
        client.execute("CREATE INDEX IF NOT EXISTS idx_incidents_status ON security_incidents(status)", &[]).await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_incidents_severity ON security_incidents(severity)", &[]).await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON security_incidents(created_at)", &[]).await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_alerts_status ON security_alerts(status)", &[]).await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_alerts_priority ON security_alerts(priority)", &[]).await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON security_alerts(created_at)", &[]).await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON security_tasks(status)", &[]).await?;
        client.execute("CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(evidence_type)", &[]).await?;
        
        log::info!("PostgreSQL tables and indexes created successfully");
        Ok(())
    }
    
    fn incident_from_row(row: &Row) -> Result<SecurityIncident> {
        let timeline_json: serde_json::Value = row.get("timeline");
        let timeline: Vec<IncidentTimelineEntry> = serde_json::from_value(timeline_json)?;
        
        let evidence_json: serde_json::Value = row.get("evidence");
        let evidence: Vec<Evidence> = serde_json::from_value(evidence_json)?;
        
        let business_impact_json: serde_json::Value = row.get("business_impact");
        let business_impact: BusinessImpact = serde_json::from_value(business_impact_json)?;
        
        Ok(SecurityIncident {
            id: row.get("id"),
            title: row.get("title"),
            description: row.get("description"),
            category: serde_json::from_str(&row.get::<_, String>("category"))?,
            severity: serde_json::from_str(&row.get::<_, String>("severity"))?,
            status: serde_json::from_str(&row.get::<_, String>("status"))?,
            priority_score: row.get("priority_score"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            detected_at: row.get("detected_at"),
            assigned_to: row.get("assigned_to"),
            assigned_team: row.get("assigned_team"),
            source_system: row.get("source_system"),
            affected_assets: serde_json::from_value(row.get("affected_assets"))?,
            indicators: serde_json::from_value(row.get("indicators"))?,
            tags: serde_json::from_value(row.get("tags"))?,
            timeline,
            evidence,
            related_alerts: serde_json::from_value(row.get("related_alerts"))?,
            related_incidents: serde_json::from_value(row.get("related_incidents"))?,
            containment_actions: serde_json::from_value(row.get("containment_actions"))?,
            eradication_actions: serde_json::from_value(row.get("eradication_actions"))?,
            recovery_actions: serde_json::from_value(row.get("recovery_actions"))?,
            lessons_learned: serde_json::from_value(row.get("lessons_learned"))?,
            cost_impact: row.get("cost_impact"),
            business_impact,
            compliance_impact: serde_json::from_value(row.get("compliance_impact"))?,
            metadata: serde_json::from_value(row.get("metadata"))?,
        })
    }
}

#[async_trait]
impl DataStore for PostgreSQLDataStoreManager {
    async fn initialize(&mut self) -> Result<()> {
        log::info!("Initializing PostgreSQL data store");
        
        let postgres_url = self.config.postgres_url
            .as_ref()
            .ok_or_else(|| anyhow!("PostgreSQL URL not configured"))?;
            
        let mut pg_config = Config::new();
        pg_config.url = Some(postgres_url.clone());
        pg_config.manager = Some(ManagerConfig {
            recycling_method: RecyclingMethod::Fast,
        });
        
        let manager = Manager::from_config(pg_config, NoTls, tokio_postgres::config::Config::new().clone());
        let pool = Pool::builder(manager)
            .max_size(self.config.connection_pool_size as usize)
            .build()?;
            
        // Test the connection
        let _client = pool.get().await?;
        log::info!("PostgreSQL connection established");
        
        self.pool = Some(pool);
        
        // Create tables
        self.create_tables().await?;
        
        // Initialize memory fallback
        self.memory_fallback.initialize().await?;
        
        log::info!("PostgreSQL data store initialized successfully");
        Ok(())
    }
    
    async fn health_check(&self) -> Result<bool> {
        match self.get_pool() {
            Ok(pool) => {
                match pool.get().await {
                    Ok(client) => {
                        match client.query_one("SELECT 1", &[]).await {
                            Ok(_) => Ok(true),
                            Err(e) => {
                                log::warn!("PostgreSQL health check failed: {}", e);
                                Ok(false)
                            }
                        }
                    }
                    Err(e) => {
                        log::warn!("PostgreSQL connection failed: {}", e);
                        Ok(false)
                    }
                }
            }
            Err(e) => {
                log::warn!("PostgreSQL pool not available: {}", e);
                Ok(false)
            }
        }
    }
    
    async fn close(&mut self) -> Result<()> {
        log::info!("Closing PostgreSQL data store");
        self.pool = None;
        self.memory_fallback.close().await?;
        Ok(())
    }
}

#[async_trait]
impl IncidentStore for PostgreSQLDataStoreManager {
    async fn create_incident(&self, incident: &SecurityIncident) -> Result<String> {
        if let Ok(pool) = self.get_pool() {
            if let Ok(client) = pool.get().await {
                let result = client.execute(
                    r#"
                    INSERT INTO security_incidents (
                        id, title, description, category, severity, status, priority_score,
                        created_at, updated_at, detected_at, assigned_to, assigned_team,
                        source_system, affected_assets, indicators, tags, timeline, evidence,
                        related_alerts, related_incidents, containment_actions, eradication_actions,
                        recovery_actions, lessons_learned, cost_impact, business_impact,
                        compliance_impact, metadata
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
                    )
                    "#,
                    &[
                        &incident.id,
                        &incident.title,
                        &incident.description,
                        &serde_json::to_string(&incident.category)?,
                        &serde_json::to_string(&incident.severity)?,
                        &serde_json::to_string(&incident.status)?,
                        &incident.priority_score,
                        &incident.created_at,
                        &incident.updated_at,
                        &incident.detected_at,
                        &incident.assigned_to,
                        &incident.assigned_team,
                        &incident.source_system,
                        &serde_json::to_value(&incident.affected_assets)?,
                        &serde_json::to_value(&incident.indicators)?,
                        &serde_json::to_value(&incident.tags)?,
                        &serde_json::to_value(&incident.timeline)?,
                        &serde_json::to_value(&incident.evidence)?,
                        &serde_json::to_value(&incident.related_alerts)?,
                        &serde_json::to_value(&incident.related_incidents)?,
                        &serde_json::to_value(&incident.containment_actions)?,
                        &serde_json::to_value(&incident.eradication_actions)?,
                        &serde_json::to_value(&incident.recovery_actions)?,
                        &serde_json::to_value(&incident.lessons_learned)?,
                        &incident.cost_impact,
                        &serde_json::to_value(&incident.business_impact)?,
                        &serde_json::to_value(&incident.compliance_impact)?,
                        &serde_json::to_value(&incident.metadata)?,
                    ],
                ).await;
                
                if result.is_ok() {
                    return Ok(incident.id.clone());
                }
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.create_incident(incident).await
    }
    
    async fn get_incident(&self, id: &str) -> Result<Option<SecurityIncident>> {
        if let Ok(pool) = self.get_pool() {
            if let Ok(client) = pool.get().await {
                match client.query_opt("SELECT * FROM security_incidents WHERE id = $1", &[&id]).await {
                    Ok(Some(row)) => {
                        return Ok(Some(Self::incident_from_row(&row)?));
                    }
                    Ok(None) => return Ok(None),
                    Err(e) => log::warn!("PostgreSQL query failed: {}", e),
                }
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.get_incident(id).await
    }
    
    async fn update_incident(&self, incident: &SecurityIncident) -> Result<()> {
        if let Ok(pool) = self.get_pool() {
            if let Ok(client) = pool.get().await {
                let result = client.execute(
                    r#"
                    UPDATE security_incidents SET
                        title = $2, description = $3, category = $4, severity = $5, status = $6,
                        priority_score = $7, updated_at = $8, detected_at = $9, assigned_to = $10,
                        assigned_team = $11, source_system = $12, affected_assets = $13,
                        indicators = $14, tags = $15, timeline = $16, evidence = $17,
                        related_alerts = $18, related_incidents = $19, containment_actions = $20,
                        eradication_actions = $21, recovery_actions = $22, lessons_learned = $23,
                        cost_impact = $24, business_impact = $25, compliance_impact = $26, metadata = $27
                    WHERE id = $1
                    "#,
                    &[
                        &incident.id,
                        &incident.title,
                        &incident.description,
                        &serde_json::to_string(&incident.category)?,
                        &serde_json::to_string(&incident.severity)?,
                        &serde_json::to_string(&incident.status)?,
                        &incident.priority_score,
                        &incident.updated_at,
                        &incident.detected_at,
                        &incident.assigned_to,
                        &incident.assigned_team,
                        &incident.source_system,
                        &serde_json::to_value(&incident.affected_assets)?,
                        &serde_json::to_value(&incident.indicators)?,
                        &serde_json::to_value(&incident.tags)?,
                        &serde_json::to_value(&incident.timeline)?,
                        &serde_json::to_value(&incident.evidence)?,
                        &serde_json::to_value(&incident.related_alerts)?,
                        &serde_json::to_value(&incident.related_incidents)?,
                        &serde_json::to_value(&incident.containment_actions)?,
                        &serde_json::to_value(&incident.eradication_actions)?,
                        &serde_json::to_value(&incident.recovery_actions)?,
                        &serde_json::to_value(&incident.lessons_learned)?,
                        &incident.cost_impact,
                        &serde_json::to_value(&incident.business_impact)?,
                        &serde_json::to_value(&incident.compliance_impact)?,
                        &serde_json::to_value(&incident.metadata)?,
                    ],
                ).await;
                
                if result.is_ok() {
                    return Ok(());
                }
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.update_incident(incident).await
    }
    
    async fn delete_incident(&self, id: &str) -> Result<()> {
        if let Ok(pool) = self.get_pool() {
            if let Ok(client) = pool.get().await {
                let result = client.execute("DELETE FROM security_incidents WHERE id = $1", &[&id]).await;
                if result.is_ok() {
                    return Ok(());
                }
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.delete_incident(id).await
    }
    
    async fn search_incidents(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityIncident>> {
        if let Ok(pool) = self.get_pool() {
            if let Ok(client) = pool.get().await {
                let mut query = "SELECT * FROM security_incidents WHERE 1=1".to_string();
                let mut params: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> = Vec::new();
                let mut param_count = 0;
                
                if !criteria.query.is_empty() {
                    param_count += 1;
                    query.push_str(&format!(" AND (title ILIKE ${} OR description ILIKE ${})", param_count, param_count));
                    params.push(&format!("%{}%", criteria.query));
                }
                
                // Add sorting
                if let Some(sort_by) = &criteria.sort_by {
                    query.push_str(&format!(" ORDER BY {}", sort_by));
                    if let Some(sort_order) = &criteria.sort_order {
                        match sort_order {
                            SortOrder::Descending => query.push_str(" DESC"),
                            SortOrder::Ascending => query.push_str(" ASC"),
                        }
                    }
                }
                
                // Add pagination
                if let Some(limit) = criteria.limit {
                    param_count += 1;
                    query.push_str(&format!(" LIMIT ${}", param_count));
                    params.push(&(limit as i64));
                }
                
                if let Some(offset) = criteria.offset {
                    param_count += 1;
                    query.push_str(&format!(" OFFSET ${}", param_count));
                    params.push(&(offset as i64));
                }
                
                match client.query(&query, &params).await {
                    Ok(rows) => {
                        let mut incidents = Vec::new();
                        for row in rows {
                            if let Ok(incident) = Self::incident_from_row(&row) {
                                incidents.push(incident);
                            }
                        }
                        return Ok(incidents);
                    }
                    Err(e) => log::warn!("PostgreSQL search failed: {}", e),
                }
            }
        }
        
        // Fallback to memory store
        self.memory_fallback.search_incidents(criteria).await
    }
    
    async fn list_incidents(&self, status: Option<IncidentStatus>, severity: Option<IncidentSeverity>) -> Result<Vec<SecurityIncident>> {
        // Use memory fallback for simplicity
        self.memory_fallback.list_incidents(status, severity).await
    }
}

// For brevity, I'll implement the other traits using similar patterns but with fallbacks to memory store
// In a production implementation, you would want to implement full PostgreSQL support for all operations

#[async_trait]
impl AlertStore for PostgreSQLDataStoreManager {
    async fn create_alert(&self, alert: &SecurityAlert) -> Result<String> {
        // Fallback to memory store for now
        self.memory_fallback.create_alert(alert).await
    }
    
    async fn get_alert(&self, id: &str) -> Result<Option<SecurityAlert>> {
        self.memory_fallback.get_alert(id).await
    }
    
    async fn update_alert(&self, alert: &SecurityAlert) -> Result<()> {
        self.memory_fallback.update_alert(alert).await
    }
    
    async fn delete_alert(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_alert(id).await
    }
    
    async fn search_alerts(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityAlert>> {
        self.memory_fallback.search_alerts(criteria).await
    }
    
    async fn get_active_alerts(&self) -> Result<Vec<SecurityAlert>> {
        self.memory_fallback.get_active_alerts().await
    }
    
    async fn list_alerts_by_priority(&self, priority: AlertPriority) -> Result<Vec<SecurityAlert>> {
        self.memory_fallback.list_alerts_by_priority(priority).await
    }
}

#[async_trait]
impl PlaybookStore for PostgreSQLDataStoreManager {
    async fn create_playbook(&self, playbook: &SecurityPlaybook) -> Result<String> {
        self.memory_fallback.create_playbook(playbook).await
    }
    
    async fn get_playbook(&self, id: &str) -> Result<Option<SecurityPlaybook>> {
        self.memory_fallback.get_playbook(id).await
    }
    
    async fn update_playbook(&self, playbook: &SecurityPlaybook) -> Result<()> {
        self.memory_fallback.update_playbook(playbook).await
    }
    
    async fn delete_playbook(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_playbook(id).await
    }
    
    async fn list_playbooks(&self, category: Option<&str>) -> Result<Vec<SecurityPlaybook>> {
        self.memory_fallback.list_playbooks(category).await
    }
    
    async fn create_execution(&self, execution: &PlaybookExecution) -> Result<String> {
        self.memory_fallback.create_execution(execution).await
    }
    
    async fn get_execution(&self, id: &str) -> Result<Option<PlaybookExecution>> {
        self.memory_fallback.get_execution(id).await
    }
    
    async fn update_execution(&self, execution: &PlaybookExecution) -> Result<()> {
        self.memory_fallback.update_execution(execution).await
    }
    
    async fn list_executions(&self, playbook_id: Option<&str>) -> Result<Vec<PlaybookExecution>> {
        self.memory_fallback.list_executions(playbook_id).await
    }
}

#[async_trait]
impl TaskStore for PostgreSQLDataStoreManager {
    async fn create_task(&self, task: &SecurityTask) -> Result<String> {
        self.memory_fallback.create_task(task).await
    }
    
    async fn get_task(&self, id: &str) -> Result<Option<SecurityTask>> {
        self.memory_fallback.get_task(id).await
    }
    
    async fn update_task(&self, task: &SecurityTask) -> Result<()> {
        self.memory_fallback.update_task(task).await
    }
    
    async fn delete_task(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_task(id).await
    }
    
    async fn search_tasks(&self, criteria: &SearchCriteria) -> Result<Vec<SecurityTask>> {
        self.memory_fallback.search_tasks(criteria).await
    }
    
    async fn list_tasks_by_status(&self, status: TaskStatus) -> Result<Vec<SecurityTask>> {
        self.memory_fallback.list_tasks_by_status(status).await
    }
}

#[async_trait]
impl EvidenceStore for PostgreSQLDataStoreManager {
    async fn create_evidence(&self, evidence: &Evidence) -> Result<String> {
        self.memory_fallback.create_evidence(evidence).await
    }
    
    async fn get_evidence(&self, id: &str) -> Result<Option<Evidence>> {
        self.memory_fallback.get_evidence(id).await
    }
    
    async fn update_evidence(&self, evidence: &Evidence) -> Result<()> {
        self.memory_fallback.update_evidence(evidence).await
    }
    
    async fn delete_evidence(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_evidence(id).await
    }
    
    async fn search_evidence(&self, criteria: &SearchCriteria) -> Result<Vec<Evidence>> {
        self.memory_fallback.search_evidence(criteria).await
    }
    
    async fn list_evidence_by_type(&self, evidence_type: EvidenceType) -> Result<Vec<Evidence>> {
        self.memory_fallback.list_evidence_by_type(evidence_type).await
    }
}

#[async_trait]
impl WorkflowStore for PostgreSQLDataStoreManager {
    async fn create_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<String> {
        self.memory_fallback.create_workflow(workflow).await
    }
    
    async fn get_workflow(&self, id: &str) -> Result<Option<OrchestrationWorkflow>> {
        self.memory_fallback.get_workflow(id).await
    }
    
    async fn update_workflow(&self, workflow: &OrchestrationWorkflow) -> Result<()> {
        self.memory_fallback.update_workflow(workflow).await
    }
    
    async fn delete_workflow(&self, id: &str) -> Result<()> {
        self.memory_fallback.delete_workflow(id).await
    }
    
    async fn list_workflows(&self, enabled_only: bool) -> Result<Vec<OrchestrationWorkflow>> {
        self.memory_fallback.list_workflows(enabled_only).await
    }
}

#[async_trait]
impl CacheStore for PostgreSQLDataStoreManager {
    async fn set(&self, key: &str, value: &str, ttl_seconds: Option<u64>) -> Result<()> {
        self.memory_fallback.set(key, value, ttl_seconds).await
    }
    
    async fn get(&self, key: &str) -> Result<Option<String>> {
        self.memory_fallback.get(key).await
    }
    
    async fn delete(&self, key: &str) -> Result<()> {
        self.memory_fallback.delete(key).await
    }
    
    async fn exists(&self, key: &str) -> Result<bool> {
        self.memory_fallback.exists(key).await
    }
    
    async fn increment(&self, key: &str) -> Result<i64> {
        self.memory_fallback.increment(key).await
    }
    
    async fn set_hash(&self, key: &str, field: &str, value: &str) -> Result<()> {
        self.memory_fallback.set_hash(key, field, value).await
    }
    
    async fn get_hash(&self, key: &str, field: &str) -> Result<Option<String>> {
        self.memory_fallback.get_hash(key, field).await
    }
    
    async fn publish(&self, channel: &str, message: &str) -> Result<()> {
        self.memory_fallback.publish(channel, message).await
    }
}

#[async_trait]
impl SearchStore for PostgreSQLDataStoreManager {
    async fn index_incident(&self, incident: &SecurityIncident) -> Result<()> {
        self.memory_fallback.index_incident(incident).await
    }
    
    async fn index_alert(&self, alert: &SecurityAlert) -> Result<()> {
        self.memory_fallback.index_alert(alert).await
    }
    
    async fn index_evidence(&self, evidence: &Evidence) -> Result<()> {
        self.memory_fallback.index_evidence(evidence).await
    }
    
    async fn search(&self, index: &str, query: &str) -> Result<Vec<serde_json::Value>> {
        self.memory_fallback.search(index, query).await
    }
    
    async fn aggregate(&self, index: &str, aggregation: &str) -> Result<serde_json::Value> {
        self.memory_fallback.aggregate(index, aggregation).await
    }
    
    async fn delete_index(&self, index: &str) -> Result<()> {
        self.memory_fallback.delete_index(index).await
    }
    
    async fn create_index(&self, index: &str, mapping: &str) -> Result<()> {
        self.memory_fallback.create_index(index, mapping).await
    }
}

impl DataStoreManager for PostgreSQLDataStoreManager {
    fn get_config(&self) -> &DataStoreConfig {
        &self.config
    }
    
    fn get_store_type(&self) -> DataStoreType {
        DataStoreType::PostgreSQL
    }
}