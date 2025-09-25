use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid;

/// OCSF Objects Library
/// Reusable objects for threat actor analysis and cybersecurity events

/// Actor Object - Represents the user, role, application, service, or process that initiated an activity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Actor {
    /// The actor name
    pub name: Option<String>,
    /// The actor UID
    pub uid: Option<String>,
    /// The actor type
    pub r#type: Option<String>,
    /// The actor type ID
    pub type_id: Option<i32>,
    /// The user information
    pub user: Option<User>,
    /// The process information
    pub process: Option<Process>,
    /// The session information
    pub session: Option<Session>,
    /// The attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// Threat Actor Object - Represents a threat actor responsible for malicious activity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatActor {
    /// The threat actor name
    pub name: Option<String>,
    /// The threat actor UID
    pub uid: Option<String>,
    /// The threat actor aliases
    pub aliases: Vec<String>,
    /// The threat actor description
    pub description: Option<String>,
    /// The first seen date
    pub first_seen: Option<DateTime<Utc>>,
    /// The last seen date
    pub last_seen: Option<DateTime<Utc>>,
    /// The threat actor type
    pub actor_type: Option<String>,
    /// The associated campaigns
    pub campaigns: Vec<String>,
    /// The associated malware
    pub malware: Vec<String>,
    /// The associated techniques
    pub techniques: Vec<String>,
    /// The threat actor attribution confidence
    pub confidence: Option<f64>,
    /// The source of attribution
    pub attribution_source: Option<String>,
    /// Additional attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// Attack Object - Describes attack information including MITRE ATT&CK details
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attack {
    /// The attack tactic
    pub tactic: Option<Tactic>,
    /// The attack technique
    pub technique: Option<Technique>,
    /// The sub-technique
    pub sub_technique: Option<SubTechnique>,
    /// The attack vector
    pub vector: Option<String>,
    /// The attack complexity
    pub complexity: Option<String>,
    /// The attack references
    pub references: Vec<String>,
}

/// Malware Object - Describes known malicious software
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Malware {
    /// The malware name
    pub name: Option<String>,
    /// The malware UID
    pub uid: Option<String>,
    /// The malware aliases
    pub aliases: Vec<String>,
    /// The malware type
    pub malware_type: Option<String>,
    /// The malware type ID
    pub malware_type_id: Option<i32>,
    /// The malware family
    pub family: Option<String>,
    /// The malware classification
    pub classification: Option<String>,
    /// The file information
    pub file: Option<File>,
    /// The first seen date
    pub first_seen: Option<DateTime<Utc>>,
    /// The last seen date
    pub last_seen: Option<DateTime<Utc>>,
    /// The malware capabilities
    pub capabilities: Vec<String>,
    /// The associated threat actors
    pub threat_actors: Vec<String>,
    /// The malware attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// Vulnerability Object - Describes security vulnerabilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vulnerability {
    /// The vulnerability name
    pub name: Option<String>,
    /// The vulnerability UID
    pub uid: Option<String>,
    /// The CVE ID
    pub cve: Option<Cve>,
    /// The CWE ID
    pub cwe: Option<Cwe>,
    /// The CVSS score
    pub cvss: Option<Cvss>,
    /// The vulnerability description
    pub description: Option<String>,
    /// The affected software
    pub affected_software: Vec<AffectedPackage>,
    /// The exploitability
    pub exploitability: Option<String>,
    /// The remediation information
    pub remediation: Option<String>,
    /// The references
    pub references: Vec<String>,
    /// The vulnerability attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// Campaign Object - Represents organized efforts by threat actors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Campaign {
    /// The campaign name
    pub name: Option<String>,
    /// The campaign UID
    pub uid: Option<String>,
    /// The campaign aliases
    pub aliases: Vec<String>,
    /// The campaign description
    pub description: Option<String>,
    /// The start date
    pub start_date: Option<DateTime<Utc>>,
    /// The end date
    pub end_date: Option<DateTime<Utc>>,
    /// The associated threat actors
    pub threat_actors: Vec<String>,
    /// The associated malware
    pub malware: Vec<String>,
    /// The associated techniques
    pub techniques: Vec<String>,
    /// The campaign objectives
    pub objectives: Vec<String>,
    /// The campaign status
    pub status: Option<String>,
    /// The campaign attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// Tactic Object - MITRE ATT&CK Tactic
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tactic {
    /// The tactic name
    pub name: String,
    /// The tactic UID
    pub uid: String,
    /// The tactic description
    pub description: Option<String>,
    /// The tactic URL
    pub url: Option<String>,
}

/// Technique Object - MITRE ATT&CK Technique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Technique {
    /// The technique name
    pub name: String,
    /// The technique UID
    pub uid: String,
    /// The technique description
    pub description: Option<String>,
    /// The technique URL
    pub url: Option<String>,
    /// The associated tactics
    pub tactics: Vec<String>,
    /// The technique detection
    pub detection: Option<String>,
    /// The technique platforms
    pub platforms: Vec<String>,
}

/// Sub-Technique Object - MITRE ATT&CK Sub-Technique
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubTechnique {
    /// The sub-technique name
    pub name: String,
    /// The sub-technique UID
    pub uid: String,
    /// The sub-technique description
    pub description: Option<String>,
    /// The sub-technique URL
    pub url: Option<String>,
    /// The parent technique
    pub parent_technique: String,
}

/// User Object - User information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    /// The user name
    pub name: Option<String>,
    /// The user UID
    pub uid: Option<String>,
    /// The user type
    pub user_type: Option<String>,
    /// The user email
    pub email: Option<String>,
    /// The user groups
    pub groups: Vec<Group>,
    /// The user attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// Group Object - Group information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Group {
    /// The group name
    pub name: Option<String>,
    /// The group UID
    pub uid: Option<String>,
    /// The group description
    pub description: Option<String>,
    /// The group privileges
    pub privileges: Vec<String>,
}

/// Process Object - Process information
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
    /// The parent process
    pub parent_process: Option<Box<Process>>,
    /// The process attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// Session Object - Session information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    /// The session UID
    pub uid: Option<String>,
    /// The session type
    pub session_type: Option<String>,
    /// The session issuer
    pub issuer: Option<String>,
    /// The session start time
    pub start_time: Option<DateTime<Utc>>,
    /// The session end time
    pub end_time: Option<DateTime<Utc>>,
    /// The session attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// File Object - File information
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
    pub hashes: Vec<FileHash>,
    /// The file attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// File Hash Object
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileHash {
    /// The hash algorithm
    pub algorithm: String,
    /// The hash value
    pub value: String,
}

/// CVE Object - Common Vulnerabilities and Exposures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cve {
    /// The CVE ID
    pub cve_id: String,
    /// The CVE URL
    pub url: Option<String>,
    /// The CVE summary
    pub summary: Option<String>,
    /// The CVE published date
    pub published: Option<DateTime<Utc>>,
    /// The CVE modified date
    pub modified: Option<DateTime<Utc>>,
}

/// CWE Object - Common Weakness Enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cwe {
    /// The CWE ID
    pub cwe_id: String,
    /// The CWE name
    pub name: Option<String>,
    /// The CWE description
    pub description: Option<String>,
    /// The CWE URL
    pub url: Option<String>,
}

/// CVSS Object - Common Vulnerability Scoring System
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cvss {
    /// The CVSS version
    pub version: Option<String>,
    /// The base score
    pub base_score: Option<f64>,
    /// The base severity
    pub base_severity: Option<String>,
    /// The vector string
    pub vector_string: Option<String>,
    /// The temporal score
    pub temporal_score: Option<f64>,
    /// The environmental score
    pub environmental_score: Option<f64>,
}

/// Affected Package Object
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffectedPackage {
    /// The package name
    pub name: String,
    /// The package version
    pub version: Option<String>,
    /// The affected versions
    pub affected_versions: Vec<String>,
    /// The fixed versions
    pub fixed_versions: Vec<String>,
}

/// Indicator of Compromise (IOC) Object
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ioc {
    /// The IOC name
    pub name: Option<String>,
    /// The IOC UID
    pub uid: Option<String>,
    /// The IOC type
    pub ioc_type: String,
    /// The IOC value
    pub value: String,
    /// The IOC description
    pub description: Option<String>,
    /// The IOC confidence
    pub confidence: Option<f64>,
    /// The first seen date
    pub first_seen: Option<DateTime<Utc>>,
    /// The last seen date
    pub last_seen: Option<DateTime<Utc>>,
    /// The IOC attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

/// Enrichment Object - Additional context data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Enrichment {
    /// The enrichment name
    pub name: String,
    /// The enrichment value
    pub value: String,
    /// The enrichment type
    pub enrichment_type: String,
    /// The enrichment data
    pub data: Option<serde_json::Value>,
    /// The enrichment source
    pub source: Option<String>,
    /// The enrichment timestamp
    pub timestamp: Option<DateTime<Utc>>,
}

/// Observable Object - Observable data for threat intelligence
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Observable {
    /// The observable name
    pub name: String,
    /// The observable value
    pub value: String,
    /// The observable type
    pub observable_type: String,
    /// The observable type ID
    pub type_id: i32,
    /// The observable reputation
    pub reputation: Option<f64>,
    /// The observable data
    pub data: Option<serde_json::Value>,
    /// The observable attributes
    pub attributes: Option<HashMap<String, serde_json::Value>>,
}

impl Actor {
    /// Create a new actor with user information
    pub fn new_user(name: String, uid: String) -> Self {
        Self {
            name: Some(name.clone()),
            uid: Some(uid),
            r#type: Some("user".to_string()),
            type_id: Some(1),
            user: Some(User {
                name: Some(name),
                uid: None,
                user_type: Some("local".to_string()),
                email: None,
                groups: vec![],
                attributes: None,
            }),
            process: None,
            session: None,
            attributes: None,
        }
    }

    /// Create a new actor with process information
    pub fn new_process(name: String, pid: i32, path: String) -> Self {
        Self {
            name: Some(name.clone()),
            uid: Some(format!("proc_{}", pid)),
            r#type: Some("process".to_string()),
            type_id: Some(2),
            user: None,
            process: Some(Process {
                pid: Some(pid),
                name: Some(name),
                path: Some(path),
                uid: Some(format!("proc_{}", pid)),
                cmd_line: None,
                parent_pid: None,
                parent_process: None,
                attributes: None,
            }),
            session: None,
            attributes: None,
        }
    }
}

impl ThreatActor {
    /// Create a new threat actor
    pub fn new(name: String, actor_type: String) -> Self {
        Self {
            name: Some(name),
            uid: Some(format!("ta_{}", uuid::Uuid::new_v4())),
            aliases: vec![],
            description: None,
            first_seen: Some(Utc::now()),
            last_seen: Some(Utc::now()),
            actor_type: Some(actor_type),
            campaigns: vec![],
            malware: vec![],
            techniques: vec![],
            confidence: Some(0.8),
            attribution_source: None,
            attributes: None,
        }
    }

    /// Add an alias
    pub fn add_alias(&mut self, alias: String) {
        self.aliases.push(alias);
    }

    /// Add a technique
    pub fn add_technique(&mut self, technique: String) {
        self.techniques.push(technique);
    }

    /// Add malware
    pub fn add_malware(&mut self, malware: String) {
        self.malware.push(malware);
    }

    /// Update last seen timestamp
    pub fn update_last_seen(&mut self) {
        self.last_seen = Some(Utc::now());
    }
}

impl Malware {
    /// Create a new malware instance
    pub fn new(name: String, malware_type: String) -> Self {
        Self {
            name: Some(name),
            uid: Some(format!("malware_{}", uuid::Uuid::new_v4())),
            aliases: vec![],
            malware_type: Some(malware_type),
            malware_type_id: None,
            family: None,
            classification: None,
            file: None,
            first_seen: Some(Utc::now()),
            last_seen: Some(Utc::now()),
            capabilities: vec![],
            threat_actors: vec![],
            attributes: None,
        }
    }

    /// Add a capability
    pub fn add_capability(&mut self, capability: String) {
        self.capabilities.push(capability);
    }

    /// Add a threat actor association
    pub fn add_threat_actor(&mut self, threat_actor: String) {
        self.threat_actors.push(threat_actor);
    }
}

impl Vulnerability {
    /// Create a new vulnerability
    pub fn new(name: String, cve_id: Option<String>) -> Self {
        let cve = cve_id.map(|id| Cve {
            cve_id: id.clone(),
            url: Some(format!(
                "https://cve.mitre.org/cgi-bin/cvename.cgi?name={}",
                id
            )),
            summary: None,
            published: None,
            modified: None,
        });

        Self {
            name: Some(name),
            uid: Some(format!("vuln_{}", uuid::Uuid::new_v4())),
            cve,
            cwe: None,
            cvss: None,
            description: None,
            affected_software: vec![],
            exploitability: None,
            remediation: None,
            references: vec![],
            attributes: None,
        }
    }

    /// Add affected software
    pub fn add_affected_package(&mut self, package: AffectedPackage) {
        self.affected_software.push(package);
    }

    /// Set CVSS score
    pub fn set_cvss(&mut self, base_score: f64, base_severity: String, vector_string: String) {
        self.cvss = Some(Cvss {
            version: Some("3.1".to_string()),
            base_score: Some(base_score),
            base_severity: Some(base_severity),
            vector_string: Some(vector_string),
            temporal_score: None,
            environmental_score: None,
        });
    }
}

impl Campaign {
    /// Create a new campaign
    pub fn new(name: String) -> Self {
        Self {
            name: Some(name),
            uid: Some(format!("campaign_{}", uuid::Uuid::new_v4())),
            aliases: vec![],
            description: None,
            start_date: Some(Utc::now()),
            end_date: None,
            threat_actors: vec![],
            malware: vec![],
            techniques: vec![],
            objectives: vec![],
            status: Some("active".to_string()),
            attributes: None,
        }
    }

    /// Add a threat actor
    pub fn add_threat_actor(&mut self, threat_actor: String) {
        self.threat_actors.push(threat_actor);
    }

    /// Add malware
    pub fn add_malware(&mut self, malware: String) {
        self.malware.push(malware);
    }

    /// Add an objective
    pub fn add_objective(&mut self, objective: String) {
        self.objectives.push(objective);
    }
}

impl Ioc {
    /// Create a new IOC
    pub fn new(ioc_type: String, value: String) -> Self {
        Self {
            name: Some(format!("{} IOC", ioc_type)),
            uid: Some(format!("ioc_{}", uuid::Uuid::new_v4())),
            ioc_type,
            value,
            description: None,
            confidence: Some(0.8),
            first_seen: Some(Utc::now()),
            last_seen: Some(Utc::now()),
            attributes: None,
        }
    }

    /// Update last seen timestamp
    pub fn update_last_seen(&mut self) {
        self.last_seen = Some(Utc::now());
    }

    /// Set confidence score
    pub fn set_confidence(&mut self, confidence: f64) {
        self.confidence = Some(confidence);
    }
}

impl Observable {
    /// Create a new observable
    pub fn new(name: String, value: String, observable_type: String, type_id: i32) -> Self {
        Self {
            name,
            value,
            observable_type,
            type_id,
            reputation: None,
            data: None,
            attributes: None,
        }
    }

    /// Set reputation score
    pub fn set_reputation(&mut self, reputation: f64) {
        self.reputation = Some(reputation);
    }

    /// Add data
    pub fn add_data(&mut self, data: serde_json::Value) {
        self.data = Some(data);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_actor_creation() {
        let user_actor = Actor::new_user("alice".to_string(), "user_123".to_string());
        assert_eq!(user_actor.name, Some("alice".to_string()));
        assert_eq!(user_actor.r#type, Some("user".to_string()));
        assert!(user_actor.user.is_some());

        let process_actor = Actor::new_process(
            "malware.exe".to_string(),
            1234,
            "/tmp/malware.exe".to_string(),
        );
        assert_eq!(process_actor.name, Some("malware.exe".to_string()));
        assert_eq!(process_actor.r#type, Some("process".to_string()));
        assert!(process_actor.process.is_some());
    }

    #[test]
    fn test_threat_actor_operations() {
        let mut ta = ThreatActor::new("APT-123".to_string(), "nation_state".to_string());
        assert_eq!(ta.name, Some("APT-123".to_string()));
        assert_eq!(ta.actor_type, Some("nation_state".to_string()));

        ta.add_alias("Fancy Bear".to_string());
        ta.add_technique("T1059".to_string());
        ta.add_malware("Trojan.Generic".to_string());

        assert_eq!(ta.aliases.len(), 1);
        assert_eq!(ta.techniques.len(), 1);
        assert_eq!(ta.malware.len(), 1);
    }

    #[test]
    fn test_malware_creation() {
        let mut malware = Malware::new("Ransomware.ABC".to_string(), "ransomware".to_string());
        assert_eq!(malware.name, Some("Ransomware.ABC".to_string()));
        assert_eq!(malware.malware_type, Some("ransomware".to_string()));

        malware.add_capability("file_encryption".to_string());
        malware.add_capability("data_exfiltration".to_string());
        malware.add_threat_actor("APT-123".to_string());

        assert_eq!(malware.capabilities.len(), 2);
        assert_eq!(malware.threat_actors.len(), 1);
    }

    #[test]
    fn test_vulnerability_creation() {
        let mut vuln = Vulnerability::new(
            "Remote Code Execution".to_string(),
            Some("CVE-2023-12345".to_string()),
        );
        assert_eq!(vuln.name, Some("Remote Code Execution".to_string()));
        assert!(vuln.cve.is_some());

        vuln.set_cvss(
            9.8,
            "Critical".to_string(),
            "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H".to_string(),
        );
        assert_eq!(vuln.cvss.as_ref().unwrap().base_score, Some(9.8));
        assert_eq!(
            vuln.cvss.as_ref().unwrap().base_severity,
            Some("Critical".to_string())
        );
    }

    #[test]
    fn test_campaign_operations() {
        let mut campaign = Campaign::new("Operation Shadow".to_string());
        assert_eq!(campaign.name, Some("Operation Shadow".to_string()));
        assert_eq!(campaign.status, Some("active".to_string()));

        campaign.add_threat_actor("APT-123".to_string());
        campaign.add_malware("Backdoor.XYZ".to_string());
        campaign.add_objective("Data exfiltration".to_string());

        assert_eq!(campaign.threat_actors.len(), 1);
        assert_eq!(campaign.malware.len(), 1);
        assert_eq!(campaign.objectives.len(), 1);
    }

    #[test]
    fn test_ioc_operations() {
        let mut ioc = Ioc::new("domain".to_string(), "malicious-site.com".to_string());
        assert_eq!(ioc.ioc_type, "domain");
        assert_eq!(ioc.value, "malicious-site.com");

        ioc.set_confidence(0.95);
        ioc.update_last_seen();

        assert_eq!(ioc.confidence, Some(0.95));
        assert!(ioc.last_seen.is_some());
    }

    #[test]
    fn test_observable_creation() {
        let mut observable = Observable::new(
            "suspicious_ip".to_string(),
            "192.168.1.100".to_string(),
            "ipv4".to_string(),
            2,
        );

        observable.set_reputation(0.9);
        observable.add_data(serde_json::json!({"country": "RU", "threat_level": "high"}));

        assert_eq!(observable.reputation, Some(0.9));
        assert!(observable.data.is_some());
    }
}
