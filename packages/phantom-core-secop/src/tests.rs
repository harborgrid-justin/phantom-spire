//! Test for the data store functionality

#[cfg(test)]
mod tests {
    use super::*;
    use crate::datastore::*;
    
    #[tokio::test]
    async fn test_memory_data_store() {
        let config = DataStoreConfig::default();
        let mut manager = crate::stores::memory::MemoryDataStoreManager::new(config).await.unwrap();
        
        // Test initialization
        assert!(manager.initialize().await.is_ok());
        assert!(manager.health_check().await.unwrap());
        
        // Test incident creation
        let incident = SecurityIncident {
            id: "test-1".to_string(),
            title: "Test Incident".to_string(),
            description: "Test Description".to_string(),
            category: IncidentCategory::Malware,
            severity: IncidentSeverity::High,
            status: IncidentStatus::New,
            priority_score: 4.0,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            detected_at: chrono::Utc::now(),
            assigned_to: None,
            assigned_team: None,
            source_system: "test".to_string(),
            affected_assets: Vec::new(),
            indicators: Vec::new(),
            tags: Vec::new(),
            timeline: Vec::new(),
            evidence: Vec::new(),
            related_alerts: Vec::new(),
            related_incidents: Vec::new(),
            containment_actions: Vec::new(),
            eradication_actions: Vec::new(),
            recovery_actions: Vec::new(),
            lessons_learned: Vec::new(),
            cost_impact: None,
            business_impact: BusinessImpact {
                financial_impact: 0.0,
                operational_impact: OperationalImpact::None,
                reputation_impact: ReputationImpact::None,
                regulatory_impact: Vec::new(),
                customer_impact: CustomerImpact {
                    customers_affected: 0,
                    service_degradation: false,
                    data_exposure: false,
                    communication_required: false,
                    compensation_required: false,
                },
                service_disruption: Vec::new(),
                data_impact: DataImpact {
                    data_types_affected: Vec::new(),
                    records_affected: 0,
                    confidentiality_breach: false,
                    integrity_compromise: false,
                    availability_impact: false,
                    regulatory_notification_required: false,
                },
            },
            compliance_impact: Vec::new(),
            metadata: std::collections::HashMap::new(),
        };
        
        let result = manager.create_incident(&incident).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "test-1");
        
        // Test retrieval
        let retrieved = manager.get_incident("test-1").await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().title, "Test Incident");
        
        // Test search
        let criteria = SearchCriteria {
            query: "Test".to_string(),
            filters: std::collections::HashMap::new(),
            sort_by: None,
            sort_order: None,
            limit: None,
            offset: None,
        };
        
        let search_results = manager.search_incidents(&criteria).await.unwrap();
        assert_eq!(search_results.len(), 1);
    }
    
    #[tokio::test] 
    async fn test_data_store_factory() {
        let config = DataStoreConfig {
            redis_url: None,
            postgres_url: None,
            mongodb_url: None,
            elasticsearch_url: None,
            default_store: DataStoreType::Memory,
            cache_enabled: false,
            connection_pool_size: 1,
        };
        
        let manager = DataStoreFactory::create_manager(config).await;
        assert!(manager.is_ok());
        
        let mut manager = manager.unwrap();
        assert!(manager.initialize().await.is_ok());
        assert!(manager.health_check().await.unwrap());
        assert_eq!(manager.get_store_type(), DataStoreType::Memory);
    }
    
    #[test]
    fn test_secop_core_basic() {
        let core = SecOpCore::new();
        assert!(!core.has_external_data_store());
    }
}