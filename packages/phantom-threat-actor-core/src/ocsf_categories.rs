use crate::ocsf::{BaseEvent, CategoryUid, ClassUid, SeverityId, ActivityId, Observable, Enrichment};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;

/// Security Finding Category (Category UID: 2)
/// Events related to security findings and detections
pub mod security_finding {
    use super::*;

    /// Security Finding Event
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SecurityFindingEvent {
        #[serde(flatten)]
        pub base: BaseEvent,
        /// The finding information
        pub finding: FindingInfo,
        /// The resources affected
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub resources: Vec<ResourceDetails>,
        /// The remediation information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub remediation: Option<Remediation>,
        /// The attack information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub attack: Option<Attack>,
    }

    /// Finding Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct FindingInfo {
        /// The finding title
        pub title: String,
        /// The finding description
        pub desc: Option<String>,
        /// The finding types
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub types: Vec<String>,
        /// The finding UID
        pub uid: String,
        /// The finding creation time
        pub created_time: Option<DateTime<Utc>>,
        /// The finding modification time
        pub modified_time: Option<DateTime<Utc>>,
        /// The confidence score
        pub confidence: Option<f64>,
        /// The analytic information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub analytic: Option<Analytic>,
    }

    /// Resource Details
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ResourceDetails {
        /// The resource name
        pub name: Option<String>,
        /// The resource UID
        pub uid: Option<String>,
        /// The resource type
        pub r#type: Option<String>,
        /// The resource labels
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub labels: Vec<String>,
        /// The resource data
        #[serde(skip_serializing_if = "Option::is_none")]
        pub data: Option<serde_json::Value>,
    }

    /// Remediation Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Remediation {
        /// The remediation description
        pub desc: Option<String>,
        /// The remediation references
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub references: Vec<String>,
        /// The KB articles
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub kb_articles: Vec<KbArticle>,
    }

    /// KB Article
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct KbArticle {
        /// The article title
        pub title: Option<String>,
        /// The article URL
        pub url: Option<String>,
        /// The article UID
        pub uid: Option<String>,
    }

    /// Attack Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Attack {
        /// The MITRE ATT&CK tactic
        pub tactic: Option<Tactic>,
        /// The MITRE ATT&CK technique
        pub technique: Option<Technique>,
        /// The sub-technique
        pub sub_technique: Option<SubTechnique>,
    }

    /// MITRE Tactic
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Tactic {
        /// The tactic name
        pub name: String,
        /// The tactic UID
        pub uid: String,
    }

    /// MITRE Technique
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Technique {
        /// The technique name
        pub name: String,
        /// The technique UID
        pub uid: String,
    }

    /// MITRE Sub-Technique
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct SubTechnique {
        /// The sub-technique name
        pub name: String,
        /// The sub-technique UID
        pub uid: String,
    }

    /// Analytic Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Analytic {
        /// The analytic name
        pub name: Option<String>,
        /// The analytic UID
        pub uid: Option<String>,
        /// The analytic type
        pub analytic_type: Option<String>,
        /// The analytic version
        pub version: Option<String>,
    }

    impl SecurityFindingEvent {
        /// Create a new security finding event
        pub fn new(title: String, severity: SeverityId) -> Self {
            let mut base = BaseEvent::new(CategoryUid::Findings, ClassUid::SecurityFinding, severity);
            base.activity_id = ActivityId::Other;
            base.activity_name = Some("Security Finding".to_string());
            base.category_name = Some("Findings".to_string());
            base.class_name = Some("Security Finding".to_string());

            Self {
                base,
                finding: FindingInfo {
                    title: title.clone(),
                    desc: None,
                    types: Vec::new(),
                    uid: uuid::Uuid::new_v4().to_string(),
                    created_time: Some(Utc::now()),
                    modified_time: None,
                    confidence: None,
                    analytic: None,
                },
                resources: Vec::new(),
                remediation: None,
                attack: None,
            }
        }

        /// Add a finding type
        pub fn with_finding_type(mut self, finding_type: String) -> Self {
            self.finding.types.push(finding_type);
            self
        }

        /// Set finding description
        pub fn with_description(mut self, desc: String) -> Self {
            self.finding.desc = Some(desc);
            self
        }

        /// Add a resource
        pub fn add_resource(&mut self, resource: ResourceDetails) {
            self.resources.push(resource);
        }

        /// Set remediation information
        pub fn with_remediation(mut self, remediation: Remediation) -> Self {
            self.remediation = Some(remediation);
            self
        }

        /// Set attack information
        pub fn with_attack(mut self, attack: Attack) -> Self {
            self.attack = Some(attack);
            self
        }

        /// Set analytic information
        pub fn with_analytic(mut self, analytic: Analytic) -> Self {
            self.finding.analytic = Some(analytic);
            self
        }

        /// Set confidence score
        pub fn with_confidence(mut self, confidence: f64) -> Self {
            self.finding.confidence = Some(confidence);
            self
        }
    }
}

/// Network Activity Category (Category UID: 4)
/// Events related to network communications and activities
pub mod network_activity {
    use super::*;

    /// Network Activity Event
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NetworkActivityEvent {
        #[serde(flatten)]
        pub base: BaseEvent,
        /// The connection information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub connection_info: Option<NetworkConnectionInfo>,
        /// The source endpoint
        #[serde(skip_serializing_if = "Option::is_none")]
        pub src_endpoint: Option<NetworkEndpoint>,
        /// The destination endpoint
        #[serde(skip_serializing_if = "Option::is_none")]
        pub dst_endpoint: Option<NetworkEndpoint>,
        /// The network traffic information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub traffic: Option<NetworkTraffic>,
        /// The HTTP request information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub http_request: Option<HttpRequest>,
        /// The HTTP response information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub http_response: Option<HttpResponse>,
        /// The DNS query information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub dns_query: Option<DnsQuery>,
        /// The DNS answer information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub dns_answer: Option<DnsAnswer>,
    }

    /// Network Connection Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NetworkConnectionInfo {
        /// The protocol identifier
        pub protocol_num: Option<i32>,
        /// The protocol name
        pub protocol_name: Option<String>,
        /// The protocol version
        pub protocol_ver: Option<String>,
        /// The connection UID
        pub uid: Option<String>,
        /// The direction
        pub direction: Option<String>,
        /// The direction ID
        pub direction_id: Option<i32>,
    }

    /// Network Endpoint
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NetworkEndpoint {
        /// The IP address
        pub ip: Option<String>,
        /// The port
        pub port: Option<i32>,
        /// The hostname
        pub hostname: Option<String>,
        /// The location information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub location: Option<Location>,
        /// The autonomous system information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub autonomous_system: Option<AutonomousSystem>,
    }

    /// Location Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Location {
        /// The country code
        pub country: Option<String>,
        /// The city name
        pub city: Option<String>,
        /// The coordinates
        pub coordinates: Option<Vec<f64>>,
        /// The geolocation description
        pub desc: Option<String>,
    }

    /// Autonomous System Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct AutonomousSystem {
        /// The AS number
        pub number: Option<i32>,
        /// The AS organization name
        pub organization_name: Option<String>,
        /// The AS organization UID
        pub organization_uid: Option<String>,
    }

    /// Network Traffic Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NetworkTraffic {
        /// The number of bytes sent
        pub bytes_in: Option<i64>,
        /// The number of bytes received
        pub bytes_out: Option<i64>,
        /// The number of packets sent
        pub packets_in: Option<i64>,
        /// The number of packets received
        pub packets_out: Option<i64>,
    }

    /// HTTP Request Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct HttpRequest {
        /// The HTTP method
        pub http_method: Option<String>,
        /// The URL
        pub url: Option<Url>,
        /// The user agent
        pub user_agent: Option<String>,
        /// The HTTP headers
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub headers: Vec<HttpHeader>,
        /// The request body size
        pub body_size: Option<i64>,
    }

    /// HTTP Response Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct HttpResponse {
        /// The HTTP status code
        pub code: Option<i32>,
        /// The HTTP status message
        pub message: Option<String>,
        /// The HTTP headers
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub headers: Vec<HttpHeader>,
        /// The response body size
        pub body_size: Option<i64>,
    }

    /// HTTP Header
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct HttpHeader {
        /// The header name
        pub name: String,
        /// The header value
        pub value: String,
    }

    /// URL Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Url {
        /// The full URL string
        pub url_string: Option<String>,
        /// The URL scheme
        pub scheme: Option<String>,
        /// The URL host
        pub host: Option<String>,
        /// The URL port
        pub port: Option<i32>,
        /// The URL path
        pub path: Option<String>,
        /// The URL query parameters
        pub query: Option<String>,
    }

    /// DNS Query Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct DnsQuery {
        /// The domain name
        pub domain: Option<String>,
        /// The DNS query type
        pub query_type: Option<String>,
        /// The DNS query class
        pub class: Option<String>,
        /// The query UID
        pub uid: Option<String>,
    }

    /// DNS Answer Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct DnsAnswer {
        /// The answer type
        pub answer_type: Option<String>,
        /// The answer class
        pub class: Option<String>,
        /// The answer data
        pub data: Option<String>,
        /// The answer TTL
        pub ttl: Option<i32>,
    }

    impl NetworkActivityEvent {
        /// Create a new network activity event
        pub fn new(activity_name: String, severity: SeverityId) -> Self {
            let mut base = BaseEvent::new(CategoryUid::NetworkActivity, ClassUid::NetworkActivity, severity);
            base.activity_id = ActivityId::Other;
            base.activity_name = Some(activity_name);
            base.category_name = Some("Network Activity".to_string());
            base.class_name = Some("Network Activity".to_string());

            Self {
                base,
                connection_info: None,
                src_endpoint: None,
                dst_endpoint: None,
                traffic: None,
                http_request: None,
                http_response: None,
                dns_query: None,
                dns_answer: None,
            }
        }

        /// Set connection information
        pub fn with_connection_info(mut self, conn_info: NetworkConnectionInfo) -> Self {
            self.connection_info = Some(conn_info);
            self
        }

        /// Set source endpoint
        pub fn with_src_endpoint(mut self, endpoint: NetworkEndpoint) -> Self {
            self.src_endpoint = Some(endpoint);
            self
        }

        /// Set destination endpoint
        pub fn with_dst_endpoint(mut self, endpoint: NetworkEndpoint) -> Self {
            self.dst_endpoint = Some(endpoint);
            self
        }

        /// Set traffic information
        pub fn with_traffic(mut self, traffic: NetworkTraffic) -> Self {
            self.traffic = Some(traffic);
            self
        }

        /// Set HTTP request information
        pub fn with_http_request(mut self, request: HttpRequest) -> Self {
            self.http_request = Some(request);
            self
        }

        /// Set HTTP response information
        pub fn with_http_response(mut self, response: HttpResponse) -> Self {
            self.http_response = Some(response);
            self
        }

        /// Set DNS query information
        pub fn with_dns_query(mut self, query: DnsQuery) -> Self {
            self.dns_query = Some(query);
            self
        }

        /// Set DNS answer information
        pub fn with_dns_answer(mut self, answer: DnsAnswer) -> Self {
            self.dns_answer = Some(answer);
            self
        }
    }
}

/// System Activity Category (Category UID: 1)
/// Events related to system-level activities
pub mod system_activity {
    use super::*;

    /// File Activity Event
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct FileActivityEvent {
        #[serde(flatten)]
        pub base: BaseEvent,
        /// The file information
        pub file: File,
        /// The actor information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub actor: Option<Actor>,
    }

    /// Process Activity Event
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ProcessActivityEvent {
        #[serde(flatten)]
        pub base: BaseEvent,
        /// The process information
        pub process: Process,
        /// The parent process information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub parent_process: Option<Process>,
        /// The actor information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub actor: Option<Actor>,
    }

    /// Authentication Event
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct AuthenticationEvent {
        #[serde(flatten)]
        pub base: BaseEvent,
        /// The user information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub user: Option<User>,
        /// The authentication factors
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub auth_factors: Vec<AuthFactor>,
        /// The service information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub service: Option<Service>,
    }

    /// File Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct File {
        /// The file name
        pub name: Option<String>,
        /// The file path
        pub path: Option<String>,
        /// The file size
        pub size: Option<i64>,
        /// The file type
        pub r#type: Option<String>,
        /// The file UID
        pub uid: Option<String>,
        /// The file hashes
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub hashes: Vec<FileHash>,
    }

    /// File Hash
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct FileHash {
        /// The hash algorithm
        pub algorithm: String,
        /// The hash value
        pub value: String,
    }

    /// Process Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Process {
        /// The process ID
        pub pid: Option<i32>,
        /// The process name
        pub name: Option<String>,
        /// The process path
        pub path: Option<String>,
        /// The process UID
        pub uid: Option<String>,
        /// The command line
        pub cmd_line: Option<String>,
        /// The parent process ID
        pub parent_pid: Option<i32>,
    }

    /// Actor Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Actor {
        /// The actor name
        pub name: Option<String>,
        /// The actor UID
        pub uid: Option<String>,
        /// The actor type
        pub actor_type: Option<String>,
        /// The user information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub user: Option<User>,
        /// The process information
        #[serde(skip_serializing_if = "Option::is_none")]
        pub process: Option<Process>,
    }

    /// User Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct User {
        /// The user name
        pub name: Option<String>,
        /// The user UID
        pub uid: Option<String>,
        /// The user type
        pub user_type: Option<String>,
        /// The user groups
        #[serde(skip_serializing_if = "Vec::is_empty")]
        pub groups: Vec<Group>,
    }

    /// Group Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Group {
        /// The group name
        pub name: Option<String>,
        /// The group UID
        pub uid: Option<String>,
    }

    /// Authentication Factor
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct AuthFactor {
        /// The factor type
        pub factor_type: String,
        /// The factor UID
        pub uid: Option<String>,
    }

    /// Service Information
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Service {
        /// The service name
        pub name: Option<String>,
        /// The service UID
        pub uid: Option<String>,
        /// The service type
        pub service_type: Option<String>,
    }

    impl FileActivityEvent {
        /// Create a new file activity event
        pub fn new(activity_name: String, severity: SeverityId) -> Self {
            let mut base = BaseEvent::new(CategoryUid::SystemActivity, ClassUid::FileActivity, severity);
            base.activity_id = ActivityId::Other;
            base.activity_name = Some(activity_name);
            base.category_name = Some("System Activity".to_string());
            base.class_name = Some("File Activity".to_string());

            Self {
                base,
                file: File {
                    name: None,
                    path: None,
                    size: None,
                    r#type: None,
                    uid: None,
                    hashes: Vec::new(),
                },
                actor: None,
            }
        }

        /// Set file information
        pub fn with_file(mut self, file: File) -> Self {
            self.file = file;
            self
        }

        /// Set actor information
        pub fn with_actor(mut self, actor: Actor) -> Self {
            self.actor = Some(actor);
            self
        }
    }

    impl ProcessActivityEvent {
        /// Create a new process activity event
        pub fn new(activity_name: String, severity: SeverityId) -> Self {
            let mut base = BaseEvent::new(CategoryUid::SystemActivity, ClassUid::ProcessActivity, severity);
            base.activity_id = ActivityId::Other;
            base.activity_name = Some(activity_name);
            base.category_name = Some("System Activity".to_string());
            base.class_name = Some("Process Activity".to_string());

            Self {
                base,
                process: Process {
                    pid: None,
                    name: None,
                    path: None,
                    uid: None,
                    cmd_line: None,
                    parent_pid: None,
                },
                parent_process: None,
                actor: None,
            }
        }

        /// Set process information
        pub fn with_process(mut self, process: Process) -> Self {
            self.process = process;
            self
        }

        /// Set parent process information
        pub fn with_parent_process(mut self, parent_process: Process) -> Self {
            self.parent_process = Some(parent_process);
            self
        }

        /// Set actor information
        pub fn with_actor(mut self, actor: Actor) -> Self {
            self.actor = Some(actor);
            self
        }
    }

    impl AuthenticationEvent {
        /// Create a new authentication event
        pub fn new(activity_name: String, severity: SeverityId) -> Self {
            let mut base = BaseEvent::new(CategoryUid::IdentityAndAccessManagement, ClassUid::Authentication, severity);
            base.activity_id = ActivityId::Other;
            base.activity_name = Some(activity_name);
            base.category_name = Some("Identity & Access Management".to_string());
            base.class_name = Some("Authentication".to_string());

            Self {
                base,
                user: None,
                auth_factors: Vec::new(),
                service: None,
            }
        }

        /// Set user information
        pub fn with_user(mut self, user: User) -> Self {
            self.user = Some(user);
            self
        }

        /// Add authentication factor
        pub fn add_auth_factor(&mut self, factor: AuthFactor) {
            self.auth_factors.push(factor);
        }

        /// Set service information
        pub fn with_service(mut self, service: Service) -> Self {
            self.service = Some(service);
            self
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_security_finding_event() {
        let event = security_finding::SecurityFindingEvent::new(
            "Suspicious Network Activity Detected".to_string(),
            SeverityId::High,
        )
        .with_description("Detected unusual outbound connections".to_string())
        .with_finding_type("network_anomaly".to_string())
        .with_confidence(0.85);

        assert_eq!(event.finding.title, "Suspicious Network Activity Detected");
        assert_eq!(event.finding.types.len(), 1);
        assert_eq!(event.finding.confidence, Some(0.85));
        assert_eq!(event.base.severity_id as i32, 4);
    }

    #[test]
    fn test_network_activity_event() {
        let event = network_activity::NetworkActivityEvent::new(
            "HTTP Connection".to_string(),
            SeverityId::Medium,
        )
        .with_connection_info(network_activity::NetworkConnectionInfo {
            protocol_num: Some(6),
            protocol_name: Some("TCP".to_string()),
            protocol_ver: Some("1.1".to_string()),
            uid: Some("conn_123".to_string()),
            direction: Some("outbound".to_string()),
            direction_id: Some(1),
        });

        assert_eq!(event.connection_info.as_ref().unwrap().protocol_name, Some("TCP".to_string()));
        assert_eq!(event.base.category_uid as i32, 4);
    }

    #[test]
    fn test_file_activity_event() {
        let event = system_activity::FileActivityEvent::new(
            "File Created".to_string(),
            SeverityId::Low,
        )
        .with_file(system_activity::File {
            name: Some("suspicious.exe".to_string()),
            path: Some("/tmp/suspicious.exe".to_string()),
            size: Some(1024),
            r#type: Some("executable".to_string()),
            uid: Some("file_456".to_string()),
            hashes: vec![system_activity::FileHash {
                algorithm: "SHA256".to_string(),
                value: "abc123...".to_string(),
            }],
        });

        assert_eq!(event.file.name, Some("suspicious.exe".to_string()));
        assert_eq!(event.file.hashes.len(), 1);
        assert_eq!(event.base.class_uid as i32, 3001);
    }

    #[test]
    fn test_process_activity_event() {
        let event = system_activity::ProcessActivityEvent::new(
            "Process Started".to_string(),
            SeverityId::Informational,
        )
        .with_process(system_activity::Process {
            pid: Some(1234),
            name: Some("malware.exe".to_string()),
            path: Some("/malware/malware.exe".to_string()),
            uid: Some("proc_789".to_string()),
            cmd_line: Some("/malware/malware.exe --silent".to_string()),
            parent_pid: Some(1),
        });

        assert_eq!(event.process.pid, Some(1234));
        assert_eq!(event.process.name, Some("malware.exe".to_string()));
        assert_eq!(event.base.severity_id as i32, 1);
    }

    #[test]
    fn test_authentication_event() {
        let event = system_activity::AuthenticationEvent::new(
            "Login Attempt".to_string(),
            SeverityId::Medium,
        )
        .with_user(system_activity::User {
            name: Some("attacker".to_string()),
            uid: Some("user_101".to_string()),
            user_type: Some("local".to_string()),
            groups: vec![system_activity::Group {
                name: Some("admin".to_string()),
                uid: Some("group_1".to_string()),
            }],
        });

        assert_eq!(event.user.as_ref().unwrap().name, Some("attacker".to_string()));
        assert_eq!(event.user.as_ref().unwrap().groups.len(), 1);
        assert_eq!(event.base.category_uid as i32, 3);
    }
}