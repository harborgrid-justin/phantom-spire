//! Phantom MITRE Core - Local In-Memory Storage
//! 
//! This module provides a local in-memory storage implementation for MITRE ATT&CK data.
//! This is useful for testing, development, and scenarios where persistent storage is not required.

use async_trait::async_trait;
use crate::models::*;
use crate::storage::traits::*;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Local in-memory storage implementation
pub struct LocalStorage {
    techniques: Arc<RwLock<HashMap<String, MitreTechnique>>>,
    sub_techniques: Arc<RwLock<HashMap<String, SubTechnique>>>,
    groups: Arc<RwLock<HashMap<String, MitreGroup>>>,
    software: Arc<RwLock<HashMap<String, MitreSoftware>>>,
    mitigations: Arc<RwLock<HashMap<String, Mitigation>>>,
    detection_rules: Arc<RwLock<HashMap<String, DetectionRule>>>,
    analyses: Arc<RwLock<HashMap<String, ThreatAnalysis>>>,
    initialized: bool,
}

impl LocalStorage {
    /// Create a new local storage instance
    pub fn new() -> Self {
        Self {
            techniques: Arc::new(RwLock::new(HashMap::new())),
            sub_techniques: Arc::new(RwLock::new(HashMap::new())),
            groups: Arc::new(RwLock::new(HashMap::new())),
            software: Arc::new(RwLock::new(HashMap::new())),
            mitigations: Arc::new(RwLock::new(HashMap::new())),
            detection_rules: Arc::new(RwLock::new(HashMap::new())),
            analyses: Arc::new(RwLock::new(HashMap::new())),
            initialized: false,
        }
    }

    /// Load sample data for testing and development
    pub fn load_sample_data(&mut self) -> StorageResult<()> {
        self.load_sample_techniques()?;
        self.load_sample_groups()?;
        self.load_sample_software()?;
        self.load_sample_mitigations()?;
        self.load_sample_detection_rules()?;
        Ok(())
    }

    fn load_sample_techniques(&mut self) -> StorageResult<()> {
        let sample_techniques = vec![
            ("T1566.001", "Spearphishing Attachment", MitreTactic::InitialAccess),
            ("T1055", "Process Injection", MitreTactic::DefenseEvasion),
            ("T1071.001", "Application Layer Protocol: Web Protocols", MitreTactic::CommandAndControl),
            ("T1083", "File and Directory Discovery", MitreTactic::Discovery),
            ("T1005", "Data from Local System", MitreTactic::Collection),
            ("T1041", "Exfiltration Over C2 Channel", MitreTactic::Exfiltration),
        ];

        for (id, name, tactic) in sample_techniques {
            let technique = MitreTechnique {
                id: id.to_string(),
                name: name.to_string(),
                description: format!("Sample description for {}", name),
                tactic,
                platforms: vec![MitrePlatform::Windows, MitrePlatform::Linux],
                data_sources: vec![DataSource::ProcessMonitoring, DataSource::NetworkTraffic],
                detection_difficulty: DetectionDifficulty::Medium,
                sub_techniques: vec![],
                mitigations: vec![],
                detection_rules: vec![],
                kill_chain_phases: vec!["act".to_string()],
                permissions_required: vec!["User".to_string()],
                effective_permissions: vec!["User".to_string()],
                system_requirements: vec![],
                network_requirements: vec![],
                remote_support: true,
                impact_type: vec![],
                created: Utc::now(),
                modified: Utc::now(),
                version: "1.0".to_string(),
                revoked: false,
                deprecated: false,
            };

            let mut techniques = self.techniques.write()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
            techniques.insert(id.to_string(), technique);
        }

        Ok(())
    }

    fn load_sample_groups(&mut self) -> StorageResult<()> {
        let sample_groups = vec![
            ("G0016", "APT29", "Cozy Bear"),
            ("G0028", "Lazarus Group", "Hidden Cobra"),
            ("G0007", "APT28", "Fancy Bear"),
        ];

        for (id, name, alias) in sample_groups {
            let group = MitreGroup {
                id: id.to_string(),
                name: name.to_string(),
                aliases: vec![alias.to_string()],
                description: format!("Sample threat group: {}", name),
                techniques_used: vec!["T1566.001".to_string(), "T1055".to_string()],
                software_used: vec![],
                associated_campaigns: vec![],
                first_seen: Utc::now(),
                last_seen: Utc::now(),
                origin_country: Some("Unknown".to_string()),
                motivation: vec!["Espionage".to_string()],
                sophistication_level: "Advanced".to_string(),
                targets: vec!["Government".to_string(), "Technology".to_string()],
                references: vec![],
            };

            let mut groups = self.groups.write()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
            groups.insert(id.to_string(), group);
        }

        Ok(())
    }

    fn load_sample_software(&mut self) -> StorageResult<()> {
        let sample_software = vec![
            ("S0154", "Cobalt Strike", SoftwareType::Tool),
            ("S0363", "Empire", SoftwareType::Tool),
            ("S0002", "Mimikatz", SoftwareType::Tool),
        ];

        for (id, name, software_type) in sample_software {
            let software = MitreSoftware {
                id: id.to_string(),
                name: name.to_string(),
                aliases: vec![],
                description: format!("Sample software: {}", name),
                software_type,
                platforms: vec![MitrePlatform::Windows],
                techniques_used: vec!["T1055".to_string()],
                groups_using: vec!["G0016".to_string()],
                kill_chain_phases: vec!["act".to_string()],
                first_seen: Utc::now(),
                last_seen: Utc::now(),
                references: vec![],
            };

            let mut software_map = self.software.write()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
            software_map.insert(id.to_string(), software);
        }

        Ok(())
    }

    fn load_sample_mitigations(&mut self) -> StorageResult<()> {
        let mitigation = Mitigation {
            id: "M1049".to_string(),
            name: "Antivirus/Antimalware".to_string(),
            description: "Use signatures or heuristics to detect malicious software.".to_string(),
            techniques_mitigated: vec!["T1055".to_string()],
            implementation_difficulty: ImplementationDifficulty::Low,
            effectiveness: 0.7,
            cost_estimate: CostEstimate::Medium,
            deployment_time: "1-2 weeks".to_string(),
            prerequisites: vec!["Endpoint management system".to_string()],
            side_effects: vec!["Potential performance impact".to_string()],
            references: vec![],
        };

        let mut mitigations = self.mitigations.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        mitigations.insert("M1049".to_string(), mitigation);

        Ok(())
    }

    fn load_sample_detection_rules(&mut self) -> StorageResult<()> {
        let rule = DetectionRule {
            id: "DR001".to_string(),
            name: "Process Injection Detection".to_string(),
            description: "Detects process injection techniques".to_string(),
            rule_type: DetectionRuleType::Sigma,
            severity: Severity::High,
            confidence: 0.85,
            data_source: DataSource::ProcessMonitoring,
            query: "process_name:*.exe AND (CreateRemoteThread OR SetWindowsHookEx)".to_string(),
            false_positive_rate: 0.05,
            coverage_percentage: 0.8,
            created: Utc::now(),
            updated: Utc::now(),
            author: "Phantom Security".to_string(),
            references: vec![],
        };

        let mut detection_rules = self.detection_rules.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        detection_rules.insert("DR001".to_string(), rule);

        Ok(())
    }

    fn matches_technique_filter(&self, technique: &MitreTechnique, filter: &TechniqueFilter) -> bool {
        if let Some(ref tactics) = filter.tactics {
            if !tactics.contains(&technique.tactic) {
                return false;
            }
        }

        if let Some(ref platforms) = filter.platforms {
            if !technique.platforms.iter().any(|p| platforms.contains(p)) {
                return false;
            }
        }

        if let Some(ref data_sources) = filter.data_sources {
            if !technique.data_sources.iter().any(|ds| data_sources.contains(ds)) {
                return false;
            }
        }

        if let Some(ref detection_difficulty) = filter.detection_difficulty {
            if technique.detection_difficulty != *detection_difficulty {
                return false;
            }
        }

        if let Some(revoked) = filter.revoked {
            if technique.revoked != revoked {
                return false;
            }
        }

        if let Some(deprecated) = filter.deprecated {
            if technique.deprecated != deprecated {
                return false;
            }
        }

        if let Some(ref text_search) = filter.text_search {
            let search_text = text_search.to_lowercase();
            if !technique.name.to_lowercase().contains(&search_text) &&
               !technique.description.to_lowercase().contains(&search_text) &&
               !technique.id.to_lowercase().contains(&search_text) {
                return false;
            }
        }

        true
    }

    fn matches_group_filter(&self, group: &MitreGroup, filter: &GroupFilter) -> bool {
        if let Some(ref origin_country) = filter.origin_country {
            if group.origin_country.as_ref() != Some(origin_country) {
                return false;
            }
        }

        if let Some(ref sophistication_level) = filter.sophistication_level {
            if group.sophistication_level != *sophistication_level {
                return false;
            }
        }

        if let Some(ref motivation) = filter.motivation {
            if !group.motivation.iter().any(|m| motivation.contains(m)) {
                return false;
            }
        }

        if let Some(ref targets) = filter.targets {
            if !group.targets.iter().any(|t| targets.contains(t)) {
                return false;
            }
        }

        if let Some(ref text_search) = filter.text_search {
            let search_text = text_search.to_lowercase();
            if !group.name.to_lowercase().contains(&search_text) &&
               !group.description.to_lowercase().contains(&search_text) &&
               !group.id.to_lowercase().contains(&search_text) &&
               !group.aliases.iter().any(|a| a.to_lowercase().contains(&search_text)) {
                return false;
            }
        }

        true
    }

    fn matches_software_filter(&self, software: &MitreSoftware, filter: &SoftwareFilter) -> bool {
        if let Some(ref software_type) = filter.software_type {
            if software.software_type != *software_type {
                return false;
            }
        }

        if let Some(ref platforms) = filter.platforms {
            if !software.platforms.iter().any(|p| platforms.contains(p)) {
                return false;
            }
        }

        if let Some(ref groups_using) = filter.groups_using {
            if !software.groups_using.iter().any(|g| groups_using.contains(g)) {
                return false;
            }
        }

        if let Some(ref text_search) = filter.text_search {
            let search_text = text_search.to_lowercase();
            if !software.name.to_lowercase().contains(&search_text) &&
               !software.description.to_lowercase().contains(&search_text) &&
               !software.id.to_lowercase().contains(&search_text) &&
               !software.aliases.iter().any(|a| a.to_lowercase().contains(&search_text)) {
                return false;
            }
        }

        true
    }
}

impl Default for LocalStorage {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl MitreStorage for LocalStorage {
    async fn initialize(&mut self) -> StorageResult<()> {
        self.initialized = true;
        self.load_sample_data()?;
        Ok(())
    }

    async fn health_check(&self) -> StorageResult<HealthStatus> {
        let start_time = std::time::Instant::now();
        let stats = self.get_statistics().await?;
        let response_time = start_time.elapsed().as_millis() as u64;

        let mut metadata = HashMap::new();
        metadata.insert("technique_count".to_string(), stats.technique_count.to_string());
        metadata.insert("group_count".to_string(), stats.group_count.to_string());
        metadata.insert("software_count".to_string(), stats.software_count.to_string());

        Ok(HealthStatus {
            status: "healthy".to_string(),
            response_time_ms: response_time,
            error_message: None,
            metadata,
        })
    }

    async fn get_statistics(&self) -> StorageResult<StorageStatistics> {
        let techniques = self.techniques.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        let sub_techniques = self.sub_techniques.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        let groups = self.groups.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        let software = self.software.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        let mitigations = self.mitigations.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        let detection_rules = self.detection_rules.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        let analyses = self.analyses.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;

        Ok(StorageStatistics {
            technique_count: techniques.len() as u64,
            sub_technique_count: sub_techniques.len() as u64,
            group_count: groups.len() as u64,
            software_count: software.len() as u64,
            mitigation_count: mitigations.len() as u64,
            detection_rule_count: detection_rules.len() as u64,
            analysis_count: analyses.len() as u64,
            total_size_bytes: 0, // Approximate calculation could be added here
            last_updated: Utc::now(),
        })
    }

    async fn clear_all(&mut self) -> StorageResult<()> {
        self.techniques.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?
            .clear();
        self.sub_techniques.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?
            .clear();
        self.groups.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?
            .clear();
        self.software.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?
            .clear();
        self.mitigations.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?
            .clear();
        self.detection_rules.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?
            .clear();
        self.analyses.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?
            .clear();
        Ok(())
    }

    // Technique operations
    async fn store_technique(&mut self, technique: MitreTechnique) -> StorageResult<String> {
        let id = technique.id.clone();
        let mut techniques = self.techniques.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        techniques.insert(id.clone(), technique);
        Ok(id)
    }

    async fn get_technique(&self, id: &str) -> StorageResult<Option<MitreTechnique>> {
        let techniques = self.techniques.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(techniques.get(id).cloned())
    }

    async fn update_technique(&mut self, technique: MitreTechnique) -> StorageResult<()> {
        let id = technique.id.clone();
        let mut techniques = self.techniques.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        if techniques.contains_key(&id) {
            techniques.insert(id, technique);
            Ok(())
        } else {
            Err(StorageError::NotFound(format!("Technique {} not found", id)))
        }
    }

    async fn delete_technique(&mut self, id: &str) -> StorageResult<bool> {
        let mut techniques = self.techniques.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(techniques.remove(id).is_some())
    }

    async fn list_techniques(
        &self,
        filter: Option<TechniqueFilter>,
        _sort_field: Option<TechniqueSortField>,
        _sort_order: Option<SortOrder>,
        pagination: Option<Pagination>,
    ) -> StorageResult<Vec<MitreTechnique>> {
        let techniques = self.techniques.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let mut results: Vec<MitreTechnique> = techniques.values()
            .filter(|technique| {
                if let Some(ref filter) = filter {
                    self.matches_technique_filter(technique, filter)
                } else {
                    true
                }
            })
            .cloned()
            .collect();

        if let Some(pagination) = pagination {
            results = results.into_iter()
                .skip(pagination.offset)
                .take(pagination.limit)
                .collect();
        }

        Ok(results)
    }

    async fn count_techniques(&self, filter: Option<TechniqueFilter>) -> StorageResult<u64> {
        let techniques = self.techniques.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let count = techniques.values()
            .filter(|technique| {
                if let Some(ref filter) = filter {
                    self.matches_technique_filter(technique, filter)
                } else {
                    true
                }
            })
            .count() as u64;

        Ok(count)
    }

    // Sub-technique operations (simplified implementations)
    async fn store_sub_technique(&mut self, sub_technique: SubTechnique) -> StorageResult<String> {
        let id = sub_technique.id.clone();
        let mut sub_techniques = self.sub_techniques.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        sub_techniques.insert(id.clone(), sub_technique);
        Ok(id)
    }

    async fn get_sub_technique(&self, id: &str) -> StorageResult<Option<SubTechnique>> {
        let sub_techniques = self.sub_techniques.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(sub_techniques.get(id).cloned())
    }

    async fn update_sub_technique(&mut self, sub_technique: SubTechnique) -> StorageResult<()> {
        let id = sub_technique.id.clone();
        let mut sub_techniques = self.sub_techniques.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        if sub_techniques.contains_key(&id) {
            sub_techniques.insert(id, sub_technique);
            Ok(())
        } else {
            Err(StorageError::NotFound(format!("Sub-technique {} not found", id)))
        }
    }

    async fn delete_sub_technique(&mut self, id: &str) -> StorageResult<bool> {
        let mut sub_techniques = self.sub_techniques.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(sub_techniques.remove(id).is_some())
    }

    async fn list_sub_techniques_for_technique(&self, technique_id: &str) -> StorageResult<Vec<SubTechnique>> {
        let sub_techniques = self.sub_techniques.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let results: Vec<SubTechnique> = sub_techniques.values()
            .filter(|sub_technique| sub_technique.parent_technique == technique_id)
            .cloned()
            .collect();

        Ok(results)
    }

    // Group operations
    async fn store_group(&mut self, group: MitreGroup) -> StorageResult<String> {
        let id = group.id.clone();
        let mut groups = self.groups.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        groups.insert(id.clone(), group);
        Ok(id)
    }

    async fn get_group(&self, id: &str) -> StorageResult<Option<MitreGroup>> {
        let groups = self.groups.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(groups.get(id).cloned())
    }

    async fn update_group(&mut self, group: MitreGroup) -> StorageResult<()> {
        let id = group.id.clone();
        let mut groups = self.groups.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        if groups.contains_key(&id) {
            groups.insert(id, group);
            Ok(())
        } else {
            Err(StorageError::NotFound(format!("Group {} not found", id)))
        }
    }

    async fn delete_group(&mut self, id: &str) -> StorageResult<bool> {
        let mut groups = self.groups.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(groups.remove(id).is_some())
    }

    async fn list_groups(
        &self,
        filter: Option<GroupFilter>,
        _sort_field: Option<GroupSortField>,
        _sort_order: Option<SortOrder>,
        pagination: Option<Pagination>,
    ) -> StorageResult<Vec<MitreGroup>> {
        let groups = self.groups.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let mut results: Vec<MitreGroup> = groups.values()
            .filter(|group| {
                if let Some(ref filter) = filter {
                    self.matches_group_filter(group, filter)
                } else {
                    true
                }
            })
            .cloned()
            .collect();

        if let Some(pagination) = pagination {
            results = results.into_iter()
                .skip(pagination.offset)
                .take(pagination.limit)
                .collect();
        }

        Ok(results)
    }

    async fn count_groups(&self, filter: Option<GroupFilter>) -> StorageResult<u64> {
        let groups = self.groups.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let count = groups.values()
            .filter(|group| {
                if let Some(ref filter) = filter {
                    self.matches_group_filter(group, filter)
                } else {
                    true
                }
            })
            .count() as u64;

        Ok(count)
    }

    // Software operations (simplified - similar pattern to above)
    async fn store_software(&mut self, software: MitreSoftware) -> StorageResult<String> {
        let id = software.id.clone();
        let mut software_map = self.software.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        software_map.insert(id.clone(), software);
        Ok(id)
    }

    async fn get_software(&self, id: &str) -> StorageResult<Option<MitreSoftware>> {
        let software = self.software.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(software.get(id).cloned())
    }

    async fn update_software(&mut self, software: MitreSoftware) -> StorageResult<()> {
        let id = software.id.clone();
        let mut software_map = self.software.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        if software_map.contains_key(&id) {
            software_map.insert(id, software);
            Ok(())
        } else {
            Err(StorageError::NotFound(format!("Software {} not found", id)))
        }
    }

    async fn delete_software(&mut self, id: &str) -> StorageResult<bool> {
        let mut software = self.software.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(software.remove(id).is_some())
    }

    async fn list_software(
        &self,
        filter: Option<SoftwareFilter>,
        _sort_field: Option<SoftwareSortField>,
        _sort_order: Option<SortOrder>,
        pagination: Option<Pagination>,
    ) -> StorageResult<Vec<MitreSoftware>> {
        let software = self.software.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let mut results: Vec<MitreSoftware> = software.values()
            .filter(|sw| {
                if let Some(ref filter) = filter {
                    self.matches_software_filter(sw, filter)
                } else {
                    true
                }
            })
            .cloned()
            .collect();

        if let Some(pagination) = pagination {
            results = results.into_iter()
                .skip(pagination.offset)
                .take(pagination.limit)
                .collect();
        }

        Ok(results)
    }

    async fn count_software(&self, filter: Option<SoftwareFilter>) -> StorageResult<u64> {
        let software = self.software.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let count = software.values()
            .filter(|sw| {
                if let Some(ref filter) = filter {
                    self.matches_software_filter(sw, filter)
                } else {
                    true
                }
            })
            .count() as u64;

        Ok(count)
    }

    // Simplified implementations for remaining required methods
    async fn store_mitigation(&mut self, mitigation: Mitigation) -> StorageResult<String> {
        let id = mitigation.id.clone();
        let mut mitigations = self.mitigations.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        mitigations.insert(id.clone(), mitigation);
        Ok(id)
    }

    async fn get_mitigation(&self, id: &str) -> StorageResult<Option<Mitigation>> {
        let mitigations = self.mitigations.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(mitigations.get(id).cloned())
    }

    async fn update_mitigation(&mut self, mitigation: Mitigation) -> StorageResult<()> {
        let id = mitigation.id.clone();
        let mut mitigations = self.mitigations.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        if mitigations.contains_key(&id) {
            mitigations.insert(id, mitigation);
            Ok(())
        } else {
            Err(StorageError::NotFound(format!("Mitigation {} not found", id)))
        }
    }

    async fn delete_mitigation(&mut self, id: &str) -> StorageResult<bool> {
        let mut mitigations = self.mitigations.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(mitigations.remove(id).is_some())
    }

    async fn list_mitigations(&self) -> StorageResult<Vec<Mitigation>> {
        let mitigations = self.mitigations.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(mitigations.values().cloned().collect())
    }

    async fn get_mitigations_for_technique(&self, technique_id: &str) -> StorageResult<Vec<Mitigation>> {
        let mitigations = self.mitigations.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let results: Vec<Mitigation> = mitigations.values()
            .filter(|mitigation| mitigation.techniques_mitigated.contains(&technique_id.to_string()))
            .cloned()
            .collect();

        Ok(results)
    }

    async fn store_detection_rule(&mut self, rule: DetectionRule) -> StorageResult<String> {
        let id = rule.id.clone();
        let mut detection_rules = self.detection_rules.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        detection_rules.insert(id.clone(), rule);
        Ok(id)
    }

    async fn get_detection_rule(&self, id: &str) -> StorageResult<Option<DetectionRule>> {
        let detection_rules = self.detection_rules.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(detection_rules.get(id).cloned())
    }

    async fn update_detection_rule(&mut self, rule: DetectionRule) -> StorageResult<()> {
        let id = rule.id.clone();
        let mut detection_rules = self.detection_rules.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        if detection_rules.contains_key(&id) {
            detection_rules.insert(id, rule);
            Ok(())
        } else {
            Err(StorageError::NotFound(format!("Detection rule {} not found", id)))
        }
    }

    async fn delete_detection_rule(&mut self, id: &str) -> StorageResult<bool> {
        let mut detection_rules = self.detection_rules.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(detection_rules.remove(id).is_some())
    }

    async fn list_detection_rules(&self) -> StorageResult<Vec<DetectionRule>> {
        let detection_rules = self.detection_rules.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(detection_rules.values().cloned().collect())
    }

    async fn get_detection_rules_for_technique(&self, technique_id: &str) -> StorageResult<Vec<DetectionRule>> {
        // This is a simplified implementation - in practice, you'd need to track 
        // which detection rules are associated with which techniques
        let _technique_id = technique_id;
        self.list_detection_rules().await
    }

    async fn store_analysis(&mut self, analysis: ThreatAnalysis) -> StorageResult<String> {
        let id = analysis.analysis_id.clone();
        let mut analyses = self.analyses.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        analyses.insert(id.clone(), analysis);
        Ok(id)
    }

    async fn get_analysis(&self, id: &str) -> StorageResult<Option<ThreatAnalysis>> {
        let analyses = self.analyses.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(analyses.get(id).cloned())
    }

    async fn delete_analysis(&mut self, id: &str) -> StorageResult<bool> {
        let mut analyses = self.analyses.write()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        Ok(analyses.remove(id).is_some())
    }

    async fn list_analyses(&self, limit: Option<usize>) -> StorageResult<Vec<ThreatAnalysis>> {
        let analyses = self.analyses.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let mut results: Vec<ThreatAnalysis> = analyses.values().cloned().collect();
        
        if let Some(limit) = limit {
            results.truncate(limit);
        }
        
        Ok(results)
    }

    // Bulk operations (simplified implementations)
    async fn bulk_store_techniques(&mut self, techniques: Vec<MitreTechnique>) -> StorageResult<Vec<String>> {
        let mut ids = Vec::new();
        for technique in techniques {
            let id = self.store_technique(technique).await?;
            ids.push(id);
        }
        Ok(ids)
    }

    async fn bulk_store_groups(&mut self, groups: Vec<MitreGroup>) -> StorageResult<Vec<String>> {
        let mut ids = Vec::new();
        for group in groups {
            let id = self.store_group(group).await?;
            ids.push(id);
        }
        Ok(ids)
    }

    async fn bulk_store_software(&mut self, software: Vec<MitreSoftware>) -> StorageResult<Vec<String>> {
        let mut ids = Vec::new();
        for sw in software {
            let id = self.store_software(sw).await?;
            ids.push(id);
        }
        Ok(ids)
    }

    async fn bulk_store_mitigations(&mut self, mitigations: Vec<Mitigation>) -> StorageResult<Vec<String>> {
        let mut ids = Vec::new();
        for mitigation in mitigations {
            let id = self.store_mitigation(mitigation).await?;
            ids.push(id);
        }
        Ok(ids)
    }

    // Search operations (simplified text-based search)
    async fn search_techniques(&self, query: &str, limit: Option<usize>) -> StorageResult<Vec<MitreTechnique>> {
        let filter = TechniqueFilter {
            text_search: Some(query.to_string()),
            ..Default::default()
        };
        
        let pagination = limit.map(|l| Pagination { offset: 0, limit: l });
        
        self.list_techniques(Some(filter), None, None, pagination).await
    }

    async fn search_groups(&self, query: &str, limit: Option<usize>) -> StorageResult<Vec<MitreGroup>> {
        let filter = GroupFilter {
            text_search: Some(query.to_string()),
            ..Default::default()
        };
        
        let pagination = limit.map(|l| Pagination { offset: 0, limit: l });
        
        self.list_groups(Some(filter), None, None, pagination).await
    }

    async fn search_software(&self, query: &str, limit: Option<usize>) -> StorageResult<Vec<MitreSoftware>> {
        let filter = SoftwareFilter {
            text_search: Some(query.to_string()),
            ..Default::default()
        };
        
        let pagination = limit.map(|l| Pagination { offset: 0, limit: l });
        
        self.list_software(Some(filter), None, None, pagination).await
    }

    // Relationship operations (simplified implementations)
    async fn get_techniques_by_group(&self, group_id: &str) -> StorageResult<Vec<MitreTechnique>> {
        let group = self.get_group(group_id).await?;
        if let Some(group) = group {
            let techniques = self.techniques.read()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
            
            let results: Vec<MitreTechnique> = group.techniques_used.iter()
                .filter_map(|technique_id| techniques.get(technique_id).cloned())
                .collect();
            
            Ok(results)
        } else {
            Err(StorageError::NotFound(format!("Group {} not found", group_id)))
        }
    }

    async fn get_software_by_group(&self, group_id: &str) -> StorageResult<Vec<MitreSoftware>> {
        let software = self.software.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let results: Vec<MitreSoftware> = software.values()
            .filter(|sw| sw.groups_using.contains(&group_id.to_string()))
            .cloned()
            .collect();
        
        Ok(results)
    }

    async fn get_groups_using_technique(&self, technique_id: &str) -> StorageResult<Vec<MitreGroup>> {
        let groups = self.groups.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let results: Vec<MitreGroup> = groups.values()
            .filter(|group| group.techniques_used.contains(&technique_id.to_string()))
            .cloned()
            .collect();
        
        Ok(results)
    }

    async fn get_software_using_technique(&self, technique_id: &str) -> StorageResult<Vec<MitreSoftware>> {
        let software = self.software.read()
            .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?;
        
        let results: Vec<MitreSoftware> = software.values()
            .filter(|sw| sw.techniques_used.contains(&technique_id.to_string()))
            .cloned()
            .collect();
        
        Ok(results)
    }

    // Backup operations (simplified implementations)
    async fn create_backup(&self, path: &str) -> StorageResult<()> {
        use std::fs;
        use std::path::Path;
        
        let backup_data = serde_json::json!({
            "techniques": *self.techniques.read()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?,
            "sub_techniques": *self.sub_techniques.read()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?,
            "groups": *self.groups.read()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?,
            "software": *self.software.read()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?,
            "mitigations": *self.mitigations.read()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?,
            "detection_rules": *self.detection_rules.read()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))?,
        });
        
        if let Some(parent) = Path::new(path).parent() {
            fs::create_dir_all(parent)
                .map_err(|e| StorageError::Internal(format!("Failed to create backup directory: {}", e)))?;
        }
        
        fs::write(path, serde_json::to_string_pretty(&backup_data)
            .map_err(|e| StorageError::Serialization(format!("Failed to serialize backup: {}", e)))?)
            .map_err(|e| StorageError::Internal(format!("Failed to write backup: {}", e)))?;
        
        Ok(())
    }

    async fn restore_backup(&mut self, path: &str) -> StorageResult<()> {
        use std::fs;
        
        let backup_data = fs::read_to_string(path)
            .map_err(|e| StorageError::Internal(format!("Failed to read backup: {}", e)))?;
        
        let backup: serde_json::Value = serde_json::from_str(&backup_data)
            .map_err(|e| StorageError::Serialization(format!("Failed to parse backup: {}", e)))?;
        
        // This is a simplified restoration - in practice, you'd want more robust error handling
        if let Some(techniques) = backup.get("techniques") {
            let techniques_map: HashMap<String, MitreTechnique> = serde_json::from_value(techniques.clone())
                .map_err(|e| StorageError::Serialization(format!("Failed to deserialize techniques: {}", e)))?;
            *self.techniques.write()
                .map_err(|e| StorageError::Internal(format!("Lock error: {}", e)))? = techniques_map;
        }
        
        // Similar for other collections...
        
        Ok(())
    }
}