// phantom-ioc-core/src/context.rs
// IOC contextual analysis and relationship mapping

use crate::types::*;
use async_trait::async_trait;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use uuid::Uuid;

pub struct ContextEngine {
    context_graph: Arc<RwLock<HashMap<String, IOCContext>>>,
    relationships: Arc<RwLock<Vec<IOCContextRelationship>>>,
}

impl ContextEngine {
    pub async fn new() -> Result<Self, IOCError> {
        Ok(Self {
            context_graph: Arc::new(RwLock::new(HashMap::new())),
            relationships: Arc::new(RwLock::new(Vec::new())),
        })
    }

    pub async fn analyze_context(&self, ioc: &IOC) -> Result<IOCContext, IOCError> {
        let context_id = Uuid::new_v4().to_string();

        // Analyze temporal context
        let temporal_context = self.analyze_temporal_context(ioc).await?;

        // Analyze behavioral context
        let behavioral_context = self.analyze_behavioral_context(ioc).await?;

        // Analyze network context
        let network_context = self.analyze_network_context(ioc).await?;

        // Analyze threat actor context
        let threat_actor_context = self.analyze_threat_actor_context(ioc).await?;

        let context = IOCContext {
            id: context_id.clone(),
            ioc_id: ioc.id.clone(),
            temporal_context,
            behavioral_context,
            network_context,
            threat_actor_context,
            related_indicators: Vec::new(),
            context_score: self.calculate_context_score(&temporal_context, &behavioral_context, &network_context, &threat_actor_context),
            analysis_timestamp: Utc::now(),
        };

        let mut graph = self.context_graph.write().await;
        graph.insert(context_id, context.clone());
        Ok(context)
    }

    async fn analyze_temporal_context(&self, ioc: &IOC) -> Result<TemporalContext, IOCError> {
        // Analyze timing patterns and frequency
        let now = Utc::now();
        let age_hours = (now - ioc.timestamp).num_hours();

        let pattern = if age_hours < 24 {
            TemporalPattern::Recent
        } else if age_hours < 168 { // 7 days
            TemporalPattern::Active
        } else if age_hours < 720 { // 30 days
            TemporalPattern::Stale
        } else {
            TemporalPattern::Historical
        };

        Ok(TemporalContext {
            first_seen: ioc.timestamp,
            last_seen: ioc.timestamp,
            frequency: 1,
            pattern,
            time_window: std::time::Duration::from_secs(3600), // 1 hour
        })
    }

    async fn analyze_behavioral_context(&self, ioc: &IOC) -> Result<BehavioralContext, IOCError> {
        // Analyze behavioral patterns based on IOC characteristics
        let mut behaviors = HashSet::new();
        let mut tactics = Vec::new();

        match ioc.indicator_type {
            IndicatorType::Hash => {
                behaviors.insert("file_execution".to_string());
                tactics.push(MITRETactic::Execution);
            }
            IndicatorType::IP => {
                behaviors.insert("network_connection".to_string());
                tactics.push(MITRETactic::CommandAndControl);
            }
            IndicatorType::Domain | IndicatorType::URL => {
                behaviors.insert("dns_resolution".to_string());
                behaviors.insert("http_request".to_string());
                tactics.push(MITRETactic::CommandAndControl);
            }
            IndicatorType::Email => {
                behaviors.insert("email_communication".to_string());
                tactics.push(MITRETactic::InitialAccess);
            }
            IndicatorType::FilePath => {
                behaviors.insert("file_access".to_string());
                tactics.push(MITRETactic::Discovery);
            }
        }

        Ok(BehavioralContext {
            observed_behaviors: behaviors.into_iter().collect(),
            mitre_tactics: tactics,
            behavior_confidence: 0.8,
            anomaly_score: 0.3,
        })
    }

    async fn analyze_network_context(&self, ioc: &IOC) -> Result<NetworkContext, IOCError> {
        // Analyze network-related context
        let mut connections = Vec::new();
        let mut protocols = HashSet::new();

        if matches!(ioc.indicator_type, IndicatorType::IP | IndicatorType::Domain | IndicatorType::URL) {
            protocols.insert("tcp".to_string());
            protocols.insert("udp".to_string());

            // Mock network connections
            connections.push(NetworkConnection {
                source: "192.168.1.1".to_string(),
                destination: ioc.value.clone(),
                protocol: "tcp".to_string(),
                port: 443,
                timestamp: Utc::now(),
                data_volume: 1024,
            });
        }

        Ok(NetworkContext {
            connections,
            protocols: protocols.into_iter().collect(),
            geographic_location: Some("Unknown".to_string()),
            asn_info: None,
            network_segment: "external".to_string(),
        })
    }

    async fn analyze_threat_actor_context(&self, ioc: &IOC) -> Result<ThreatActorContext, IOCError> {
        // Analyze potential threat actor associations
        let mut associated_groups = Vec::new();
        let mut campaigns = Vec::new();
        let mut tools = Vec::new();

        // Mock threat actor analysis based on IOC characteristics
        if ioc.tags.contains(&"malware".to_string()) {
            associated_groups.push("APT28".to_string());
            campaigns.push("Operation FakeDate".to_string());
            tools.push("Cobalt Strike".to_string());
        }

        if ioc.tags.contains(&"phishing".to_string()) {
            associated_groups.push("FIN7".to_string());
            campaigns.push("Phishing Campaign 2024".to_string());
            tools.push("Phishing Kit".to_string());
        }

        Ok(ThreatActorContext {
            associated_groups,
            campaigns,
            tools,
            attribution_confidence: 0.6,
            motivation: ThreatMotivation::CyberCrime,
        })
    }

    fn calculate_context_score(&self, temporal: &TemporalContext, behavioral: &BehavioralContext, network: &NetworkContext, threat: &ThreatActorContext) -> f64 {
        let temporal_score = match temporal.pattern {
            TemporalPattern::Recent => 0.9,
            TemporalPattern::Active => 0.7,
            TemporalPattern::Stale => 0.4,
            TemporalPattern::Historical => 0.2,
        };

        let behavioral_score = behavioral.behavior_confidence;
        let network_score = if network.connections.is_empty() { 0.3 } else { 0.8 };
        let threat_score = threat.attribution_confidence;

        (temporal_score * 0.3) + (behavioral_score * 0.3) + (network_score * 0.2) + (threat_score * 0.2)
    }

    pub async fn find_related_indicators(&self, ioc_id: &str) -> Result<Vec<String>, IOCError> {
        let graph = self.context_graph.read().await;
        let relationships = self.relationships.read().await;

        let mut related = Vec::new();

        // Find direct relationships
        for relationship in relationships.iter() {
            if relationship.source_ioc_id == ioc_id {
                related.push(relationship.target_ioc_id.clone());
            } else if relationship.target_ioc_id == ioc_id {
                related.push(relationship.source_ioc_id.clone());
            }
        }

        // Find contextually related IOCs
        if let Some(context) = graph.get(ioc_id) {
            for (other_id, other_context) in graph.iter() {
                if other_id != ioc_id && self.are_contextually_related(context, other_context) {
                    related.push(other_id.clone());
                }
            }
        }

        Ok(related)
    }

    fn are_contextually_related(&self, context1: &IOCContext, context2: &IOCContext) -> bool {
        // Check for shared threat actors
        let shared_groups: HashSet<_> = context1.threat_actor_context.associated_groups.iter().collect();
        let other_groups: HashSet<_> = context2.threat_actor_context.associated_groups.iter().collect();
        !shared_groups.is_disjoint(&other_groups)
    }

    pub async fn get_health(&self) -> ComponentHealth {
        let graph = self.context_graph.read().await;
        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Context engine operational - {} contexts analyzed", graph.len()),
            last_check: Utc::now(),
            metrics: {
                let mut metrics = HashMap::new();
                metrics.insert("analyzed_contexts".to_string(), graph.len() as f64);
                metrics
            },
        }
    }
}
