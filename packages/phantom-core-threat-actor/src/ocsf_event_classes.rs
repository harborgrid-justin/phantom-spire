use crate::ocsf::{ActivityId, Enrichment, Observable, SeverityId};
use crate::ocsf_categories::*;
use serde::{Deserialize, Serialize};

/// OCSF Event Classes Implementation
/// Provides specific event class implementations for threat actor analysis

/// Security Finding Event Class (Class UID: 1001)
pub mod security_finding_class {
    use super::*;

    /// Security Finding Activity IDs
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub enum SecurityFindingActivityId {
        #[serde(rename = "1")]
        Create = 1,
        #[serde(rename = "2")]
        Update = 2,
        #[serde(rename = "3")]
        Close = 3,
        #[serde(rename = "99")]
        Other = 99,
    }

    impl From<SecurityFindingActivityId> for ActivityId {
        fn from(activity: SecurityFindingActivityId) -> Self {
            match activity {
                SecurityFindingActivityId::Create => ActivityId::Other,
                SecurityFindingActivityId::Update => ActivityId::Other,
                SecurityFindingActivityId::Close => ActivityId::Other,
                SecurityFindingActivityId::Other => ActivityId::Other,
            }
        }
    }

    /// Create a security finding event for malware detection
    pub fn create_malware_finding(
        title: String,
        malware_name: String,
        file_path: String,
        confidence: f64,
        severity: SeverityId,
    ) -> security_finding::SecurityFindingEvent {
        let mut event = security_finding::SecurityFindingEvent::new(title, severity)
            .with_finding_type("malware".to_string())
            .with_description(format!(
                "Malware '{}' detected in file '{}'",
                malware_name, file_path
            ))
            .with_confidence(confidence);

        // Add observables
        let file_observable = Observable {
            name: "malware_file".to_string(),
            value: file_path.clone(),
            observable_type: "file".to_string(),
            type_id: 1,
            reputation: Some(confidence),
            data: Some(serde_json::json!({
                "malware_name": malware_name,
                "file_path": file_path
            })),
            attributes: None,
        };

        event.base.add_observable(file_observable);

        // Add remediation
        let remediation = security_finding::Remediation {
            desc: Some("Quarantine the infected file and run full system scan".to_string()),
            references: vec![
                "https://docs.microsoft.com/en-us/microsoft-365/security/defender-endpoint/respond-machine-alerts".to_string(),
            ],
            kb_articles: vec![security_finding::KbArticle {
                title: Some("Malware Removal Guide".to_string()),
                url: Some("https://support.microsoft.com/en-us/topic/remove-malware-123456".to_string()),
                uid: Some("KB-123456".to_string()),
            }],
        };

        event.with_remediation(remediation)
    }

    /// Create a security finding event for suspicious network activity
    pub fn create_network_anomaly_finding(
        title: String,
        src_ip: String,
        dst_ip: String,
        dst_port: i32,
        _anomaly_type: String,
        severity: SeverityId,
    ) -> security_finding::SecurityFindingEvent {
        let mut event = security_finding::SecurityFindingEvent::new(title, severity)
            .with_finding_type("network_anomaly".to_string())
            .with_description(format!(
                "Suspicious network activity detected: {} -> {}:{}",
                src_ip, dst_ip, dst_port
            ))
            .with_confidence(0.75);

        // Add observables
        let src_observable = Observable {
            name: "source_ip".to_string(),
            value: src_ip.clone(),
            observable_type: "ipv4".to_string(),
            type_id: 2,
            reputation: Some(0.3),
            data: Some(serde_json::json!({
                "ip": src_ip,
                "role": "source"
            })),
            attributes: None,
        };

        let dst_observable = Observable {
            name: "destination_ip".to_string(),
            value: dst_ip.clone(),
            observable_type: "ipv4".to_string(),
            type_id: 2,
            reputation: Some(0.8),
            data: Some(serde_json::json!({
                "ip": dst_ip,
                "port": dst_port,
                "role": "destination"
            })),
            attributes: None,
        };

        event.base.add_observable(src_observable);
        event.base.add_observable(dst_observable);

        // Add enrichment for geolocation (mock data)
        let enrichment = Enrichment {
            name: "src_ip_geolocation".to_string(),
            value: src_ip,
            enrichment_type: "geolocation".to_string(),
            data: Some(serde_json::json!({
                "country": "Unknown",
                "city": "Unknown",
                "coordinates": [0.0, 0.0]
            })),
        };

        event.base.add_enrichment(enrichment);

        event
    }

    /// Create a security finding event for unauthorized access
    pub fn create_unauthorized_access_finding(
        title: String,
        user: String,
        resource: String,
        access_type: String,
        severity: SeverityId,
    ) -> security_finding::SecurityFindingEvent {
        let mut event = security_finding::SecurityFindingEvent::new(title, severity)
            .with_finding_type("unauthorized_access".to_string())
            .with_description(format!(
                "Unauthorized {} access to {} by user {}",
                access_type, resource, user
            ))
            .with_confidence(0.9);

        // Add observables
        let user_observable = Observable {
            name: "user".to_string(),
            value: user.clone(),
            observable_type: "user".to_string(),
            type_id: 3,
            reputation: Some(0.5),
            data: Some(serde_json::json!({
                "username": user,
                "access_type": access_type
            })),
            attributes: None,
        };

        let resource_observable = Observable {
            name: "resource".to_string(),
            value: resource.clone(),
            observable_type: "resource".to_string(),
            type_id: 4,
            reputation: Some(0.5),
            data: Some(serde_json::json!({
                "resource_name": resource,
                "resource_type": "file"
            })),
            attributes: None,
        };

        event.base.add_observable(user_observable);
        event.base.add_observable(resource_observable);

        // Add remediation
        let remediation = security_finding::Remediation {
            desc: Some("Review user permissions and revoke unauthorized access".to_string()),
            references: vec![
                "https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/overview".to_string(),
            ],
            kb_articles: vec![],
        };

        event.with_remediation(remediation)
    }
}

/// Network Activity Event Class (Class UID: 2001)
pub mod network_activity_class {
    use super::*;

    /// Network Activity Activity IDs
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub enum NetworkActivityActivityId {
        #[serde(rename = "1")]
        Traffic = 1,
        #[serde(rename = "2")]
        Allow = 2,
        #[serde(rename = "3")]
        Deny = 3,
        #[serde(rename = "4")]
        DnsLookup = 4,
        #[serde(rename = "5")]
        HttpGet = 5,
        #[serde(rename = "6")]
        HttpPost = 6,
        #[serde(rename = "99")]
        Other = 99,
    }

    /// Create a network activity event for suspicious HTTP traffic
    pub fn create_suspicious_http_traffic(
        src_ip: String,
        dst_ip: String,
        dst_port: i32,
        url: String,
        user_agent: String,
        severity: SeverityId,
    ) -> network_activity::NetworkActivityEvent {
        let mut event = network_activity::NetworkActivityEvent::new(
            "Suspicious HTTP Traffic".to_string(),
            severity,
        );

        // Set connection info
        let conn_info = network_activity::NetworkConnectionInfo {
            protocol_num: Some(6),
            protocol_name: Some("TCP".to_string()),
            protocol_ver: Some("1.1".to_string()),
            uid: Some(format!("http_{}_{}", src_ip, dst_ip)),
            direction: Some("outbound".to_string()),
            direction_id: Some(1),
        };

        // Set endpoints
        let src_endpoint = network_activity::NetworkEndpoint {
            ip: Some(src_ip.clone()),
            port: None,
            hostname: None,
            location: Some(network_activity::Location {
                country: Some("US".to_string()),
                city: Some("Unknown".to_string()),
                coordinates: Some(vec![-74.006, 40.714]),
                desc: Some("New York Area".to_string()),
            }),
            autonomous_system: None,
        };

        let dst_endpoint = network_activity::NetworkEndpoint {
            ip: Some(dst_ip.clone()),
            port: Some(dst_port),
            hostname: Some("suspicious-domain.com".to_string()),
            location: Some(network_activity::Location {
                country: Some("RU".to_string()),
                city: Some("Moscow".to_string()),
                coordinates: Some(vec![37.617, 55.755]),
                desc: Some("Moscow, Russia".to_string()),
            }),
            autonomous_system: Some(network_activity::AutonomousSystem {
                number: Some(12345),
                organization_name: Some("Suspicious ISP".to_string()),
                organization_uid: Some("AS12345".to_string()),
            }),
        };

        // Set HTTP request
        let http_request = network_activity::HttpRequest {
            http_method: Some("GET".to_string()),
            url: Some(network_activity::Url {
                url_string: Some(url.clone()),
                scheme: Some("https".to_string()),
                host: Some("suspicious-domain.com".to_string()),
                port: Some(443),
                path: Some("/malware".to_string()),
                query: Some("param=evil".to_string()),
            }),
            user_agent: Some(user_agent.clone()),
            headers: vec![
                network_activity::HttpHeader {
                    name: "User-Agent".to_string(),
                    value: user_agent.clone(),
                },
                network_activity::HttpHeader {
                    name: "Accept".to_string(),
                    value: "*/*".to_string(),
                },
            ],
            body_size: Some(0),
        };

        event = event
            .with_connection_info(conn_info)
            .with_src_endpoint(src_endpoint)
            .with_dst_endpoint(dst_endpoint)
            .with_http_request(http_request);

        // Add observables
        let url_observable = Observable {
            name: "suspicious_url".to_string(),
            value: url,
            observable_type: "url".to_string(),
            type_id: 5,
            reputation: Some(0.9),
            data: Some(serde_json::json!({
                "threat_level": "high",
                "category": "malware"
            })),
            attributes: None,
        };

        event.base.add_observable(url_observable);

        event
    }

    /// Create a network activity event for DNS tunneling detection
    pub fn create_dns_tunneling_activity(
        src_ip: String,
        dst_ip: String,
        domain: String,
        query_type: String,
        severity: SeverityId,
    ) -> network_activity::NetworkActivityEvent {
        let mut event = network_activity::NetworkActivityEvent::new(
            "DNS Tunneling Detected".to_string(),
            severity,
        );

        // Set connection info
        let conn_info = network_activity::NetworkConnectionInfo {
            protocol_num: Some(17),
            protocol_name: Some("UDP".to_string()),
            protocol_ver: None,
            uid: Some(format!("dns_{}_{}", src_ip, domain)),
            direction: Some("outbound".to_string()),
            direction_id: Some(1),
        };

        // Set endpoints
        let src_endpoint = network_activity::NetworkEndpoint {
            ip: Some(src_ip.clone()),
            port: Some(53),
            hostname: None,
            location: None,
            autonomous_system: None,
        };

        let dst_endpoint = network_activity::NetworkEndpoint {
            ip: Some(dst_ip.clone()),
            port: Some(53),
            hostname: Some("suspicious-dns.com".to_string()),
            location: None,
            autonomous_system: None,
        };

        // Set DNS query
        let dns_query = network_activity::DnsQuery {
            domain: Some(domain.clone()),
            query_type: Some(query_type),
            class: Some("IN".to_string()),
            uid: Some(format!("query_{}", domain)),
        };

        event = event
            .with_connection_info(conn_info)
            .with_src_endpoint(src_endpoint)
            .with_dst_endpoint(dst_endpoint)
            .with_dns_query(dns_query);

        // Add observables
        let domain_observable = Observable {
            name: "suspicious_domain".to_string(),
            value: domain,
            observable_type: "domain".to_string(),
            type_id: 6,
            reputation: Some(0.8),
            data: Some(serde_json::json!({
                "detection_method": "entropy_analysis",
                "entropy_score": 0.95,
                "is_dga": true
            })),
            attributes: None,
        };

        event.base.add_observable(domain_observable);

        event
    }

    /// Create a network activity event for C2 beaconing
    pub fn create_c2_beaconing_activity(
        src_ip: String,
        dst_ip: String,
        dst_port: i32,
        beacon_interval: i64,
        severity: SeverityId,
    ) -> network_activity::NetworkActivityEvent {
        let mut event = network_activity::NetworkActivityEvent::new(
            "C2 Beaconing Detected".to_string(),
            severity,
        );

        // Set connection info
        let conn_info = network_activity::NetworkConnectionInfo {
            protocol_num: Some(6),
            protocol_name: Some("TCP".to_string()),
            protocol_ver: Some("1.1".to_string()),
            uid: Some(format!("beacon_{}_{}", src_ip, dst_ip)),
            direction: Some("outbound".to_string()),
            direction_id: Some(1),
        };

        // Set endpoints
        let src_endpoint = network_activity::NetworkEndpoint {
            ip: Some(src_ip.clone()),
            port: None,
            hostname: None,
            location: None,
            autonomous_system: None,
        };

        let dst_endpoint = network_activity::NetworkEndpoint {
            ip: Some(dst_ip.clone()),
            port: Some(dst_port),
            hostname: Some("c2-server.com".to_string()),
            location: Some(network_activity::Location {
                country: Some("CN".to_string()),
                city: Some("Beijing".to_string()),
                coordinates: Some(vec![116.407, 39.904]),
                desc: Some("Beijing, China".to_string()),
            }),
            autonomous_system: None,
        };

        // Set traffic information
        let traffic = network_activity::NetworkTraffic {
            bytes_in: Some(1024),
            bytes_out: Some(512),
            packets_in: Some(10),
            packets_out: Some(5),
        };

        event = event
            .with_connection_info(conn_info)
            .with_src_endpoint(src_endpoint)
            .with_dst_endpoint(dst_endpoint)
            .with_traffic(traffic);

        // Add observables
        let c2_observable = Observable {
            name: "c2_server".to_string(),
            value: dst_ip.clone(),
            observable_type: "ipv4".to_string(),
            type_id: 2,
            reputation: Some(0.95),
            data: Some(serde_json::json!({
                "beacon_interval_seconds": beacon_interval,
                "c2_type": "http",
                "threat_actor": "APT-123"
            })),
            attributes: None,
        };

        event.base.add_observable(c2_observable);

        // Add enrichment
        let enrichment = Enrichment {
            name: "threat_intelligence".to_string(),
            value: dst_ip.clone(),
            enrichment_type: "threat_feed".to_string(),
            data: Some(serde_json::json!({
                "threat_score": 95,
                "threat_categories": ["c2", "malware"],
                "first_seen": "2023-01-15T00:00:00Z",
                "last_seen": "2024-01-15T00:00:00Z"
            })),
        };

        event.base.add_enrichment(enrichment);

        event
    }
}

/// System Activity Event Classes
pub mod system_activity_class {
    use super::*;

    /// Create a file activity event for suspicious file creation
    pub fn create_suspicious_file_creation(
        file_path: String,
        file_name: String,
        file_size: i64,
        user: String,
        severity: SeverityId,
    ) -> system_activity::FileActivityEvent {
        let mut event = system_activity::FileActivityEvent::new(
            "Suspicious File Created".to_string(),
            severity,
        );

        let file = system_activity::File {
            name: Some(file_name.clone()),
            path: Some(file_path.clone()),
            size: Some(file_size),
            r#type: Some("executable".to_string()),
            uid: Some(format!("file_{}", uuid::Uuid::new_v4())),
            hashes: vec![system_activity::FileHash {
                algorithm: "SHA256".to_string(),
                value: "suspicious_hash_1234567890abcdef".to_string(),
            }],
        };

        let actor = system_activity::Actor {
            name: Some(user.clone()),
            uid: Some(format!("user_{}", user)),
            actor_type: Some("user".to_string()),
            user: Some(system_activity::User {
                name: Some(user.clone()),
                uid: Some(format!("user_{}", user)),
                user_type: Some("local".to_string()),
                groups: vec![],
            }),
            process: None,
        };

        event = event.with_file(file).with_actor(actor);

        // Add observables
        let file_observable = Observable {
            name: "suspicious_file".to_string(),
            value: file_path,
            observable_type: "file".to_string(),
            type_id: 1,
            reputation: Some(0.7),
            data: Some(serde_json::json!({
                "file_size": file_size,
                "file_type": "executable",
                "entropy": 0.85
            })),
            attributes: None,
        };

        event.base.add_observable(file_observable);

        event
    }

    /// Create a process activity event for suspicious process execution
    pub fn create_suspicious_process_execution(
        process_name: String,
        process_path: String,
        cmd_line: String,
        parent_process: String,
        user: String,
        severity: SeverityId,
    ) -> system_activity::ProcessActivityEvent {
        let mut event = system_activity::ProcessActivityEvent::new(
            "Suspicious Process Executed".to_string(),
            severity,
        );

        let process = system_activity::Process {
            pid: Some(1234),
            name: Some(process_name.clone()),
            path: Some(process_path.clone()),
            uid: Some(format!("proc_{}", uuid::Uuid::new_v4())),
            cmd_line: Some(cmd_line.clone()),
            parent_pid: Some(1),
        };

        let parent_proc = system_activity::Process {
            pid: Some(1),
            name: Some(parent_process.clone()),
            path: Some("/bin/init".to_string()),
            uid: Some("proc_parent_1".to_string()),
            cmd_line: Some("/bin/init".to_string()),
            parent_pid: None,
        };

        let actor = system_activity::Actor {
            name: Some(user.clone()),
            uid: Some(format!("user_{}", user)),
            actor_type: Some("user".to_string()),
            user: Some(system_activity::User {
                name: Some(user.clone()),
                uid: Some(format!("user_{}", user)),
                user_type: Some("local".to_string()),
                groups: vec![],
            }),
            process: Some(process.clone()),
        };

        event = event
            .with_process(process)
            .with_parent_process(parent_proc)
            .with_actor(actor);

        // Add observables
        let process_observable = Observable {
            name: "suspicious_process".to_string(),
            value: process_name,
            observable_type: "process".to_string(),
            type_id: 7,
            reputation: Some(0.8),
            data: Some(serde_json::json!({
                "command_line": cmd_line,
                "parent_process": parent_process,
                "user": user
            })),
            attributes: None,
        };

        event.base.add_observable(process_observable);

        event
    }

    /// Create an authentication event for failed login attempt
    pub fn create_failed_authentication(
        username: String,
        service: String,
        failure_reason: String,
        severity: SeverityId,
    ) -> system_activity::AuthenticationEvent {
        let mut event = system_activity::AuthenticationEvent::new(
            "Failed Authentication".to_string(),
            severity,
        );

        let user = system_activity::User {
            name: Some(username.clone()),
            uid: Some(format!("user_{}", username)),
            user_type: Some("local".to_string()),
            groups: vec![],
        };

        let service_info = system_activity::Service {
            name: Some(service.clone()),
            uid: Some(format!("service_{}", service)),
            service_type: Some("authentication".to_string()),
        };

        event = event.with_user(user).with_service(service_info);

        // Add authentication factor
        let auth_factor = system_activity::AuthFactor {
            factor_type: "password".to_string(),
            uid: Some("factor_password_1".to_string()),
        };

        event.add_auth_factor(auth_factor);

        // Set status to failure
        event.base = event.base.with_status(
            crate::ocsf::StatusId::Failure,
            Some("Authentication Failed".to_string()),
        );

        // Add observables
        let user_observable = Observable {
            name: "failed_login_user".to_string(),
            value: username,
            observable_type: "user".to_string(),
            type_id: 3,
            reputation: Some(0.6),
            data: Some(serde_json::json!({
                "failure_reason": failure_reason,
                "service": service,
                "attempt_count": 1
            })),
            attributes: None,
        };

        event.base.add_observable(user_observable);

        event
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_malware_finding_creation() {
        let event = security_finding_class::create_malware_finding(
            "Trojan Detected".to_string(),
            "Trojan.Generic".to_string(),
            "/tmp/malware.exe".to_string(),
            0.95,
            SeverityId::Critical,
        );

        assert_eq!(event.finding.title, "Trojan Detected");
        assert_eq!(event.finding.types[0], "malware");
        assert_eq!(event.finding.confidence, Some(0.95));
        assert_eq!(event.base.observables.len(), 1);
        assert!(event.remediation.is_some());
    }

    #[test]
    fn test_suspicious_http_traffic() {
        let event = network_activity_class::create_suspicious_http_traffic(
            "192.168.1.100".to_string(),
            "malicious-site.com".to_string(),
            443,
            "https://malicious-site.com/payload".to_string(),
            "MaliciousUserAgent/1.0".to_string(),
            SeverityId::High,
        );

        assert_eq!(
            event.connection_info.as_ref().unwrap().protocol_name,
            Some("TCP".to_string())
        );
        assert_eq!(
            event.http_request.as_ref().unwrap().http_method,
            Some("GET".to_string())
        );
        assert_eq!(event.base.observables.len(), 1);
        assert_eq!(event.base.enrichments.len(), 0); // No enrichments added in this test
    }

    #[test]
    fn test_dns_tunneling_detection() {
        let event = network_activity_class::create_dns_tunneling_activity(
            "192.168.1.100".to_string(),
            "8.8.8.8".to_string(),
            "suspicious-domain-with-high-entropy.com".to_string(),
            "A".to_string(),
            SeverityId::Medium,
        );

        assert_eq!(
            event.dns_query.as_ref().unwrap().domain,
            Some("suspicious-domain-with-high-entropy.com".to_string())
        );
        assert_eq!(event.base.observables.len(), 1);
        assert_eq!(event.base.observables[0].observable_type, "domain");
    }

    #[test]
    fn test_c2_beaconing_detection() {
        let event = network_activity_class::create_c2_beaconing_activity(
            "192.168.1.100".to_string(),
            "203.0.113.1".to_string(),
            8080,
            300, // 5 minutes
            SeverityId::High,
        );

        assert_eq!(
            event.connection_info.as_ref().unwrap().protocol_name,
            Some("TCP".to_string())
        );
        assert_eq!(event.traffic.as_ref().unwrap().bytes_in, Some(1024));
        assert_eq!(event.base.observables.len(), 1);
        assert_eq!(event.base.enrichments.len(), 1);
    }

    #[test]
    fn test_suspicious_file_creation() {
        let event = system_activity_class::create_suspicious_file_creation(
            "/tmp/suspicious.exe".to_string(),
            "suspicious.exe".to_string(),
            1048576, // 1MB
            "attacker".to_string(),
            SeverityId::High,
        );

        assert_eq!(event.file.name, Some("suspicious.exe".to_string()));
        assert_eq!(event.file.size, Some(1048576));
        assert_eq!(
            event.actor.as_ref().unwrap().name,
            Some("attacker".to_string())
        );
        assert_eq!(event.base.observables.len(), 1);
    }

    #[test]
    fn test_suspicious_process_execution() {
        let event = system_activity_class::create_suspicious_process_execution(
            "powershell.exe".to_string(),
            "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe".to_string(),
            "powershell -EncodedCommand <base64>".to_string(),
            "explorer.exe".to_string(),
            "attacker".to_string(),
            SeverityId::High,
        );

        assert_eq!(event.process.name, Some("powershell.exe".to_string()));
        assert_eq!(
            event.parent_process.as_ref().unwrap().name,
            Some("explorer.exe".to_string())
        );
        assert_eq!(
            event.actor.as_ref().unwrap().name,
            Some("attacker".to_string())
        );
        assert_eq!(event.base.observables.len(), 1);
    }

    #[test]
    fn test_failed_authentication() {
        let event = system_activity_class::create_failed_authentication(
            "admin".to_string(),
            "ssh".to_string(),
            "Invalid password".to_string(),
            SeverityId::Medium,
        );

        assert_eq!(event.user.as_ref().unwrap().name, Some("admin".to_string()));
        assert_eq!(
            event.service.as_ref().unwrap().name,
            Some("ssh".to_string())
        );
        assert_eq!(event.base.status_id, Some(crate::ocsf::StatusId::Failure));
        assert_eq!(event.base.observables.len(), 1);
    }
}
