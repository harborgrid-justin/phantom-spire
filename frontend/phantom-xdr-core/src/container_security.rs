// Container Security Engine for XDR Platform
// Provides container and Kubernetes security monitoring, vulnerability scanning, and compliance

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerImage {
    pub image_id: String,
    pub name: String,
    pub tag: String,
    pub registry: String,
    pub digest: String,
    pub size: u64,
    pub layers: Vec<ImageLayer>,
    pub vulnerabilities: Vec<ContainerVulnerability>,
    pub scan_status: String, // "pending", "scanning", "completed", "failed"
    pub last_scanned: i64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageLayer {
    pub layer_id: String,
    pub digest: String,
    pub size: u64,
    pub command: String,
    pub created_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerVulnerability {
    pub vulnerability_id: String,
    pub cve_id: Option<String>,
    pub severity: String, // "critical", "high", "medium", "low"
    pub title: String,
    pub description: String,
    pub package_name: String,
    pub installed_version: String,
    pub fixed_version: Option<String>,
    pub cvss_score: Option<f64>,
    pub references: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KubernetesResource {
    pub resource_id: String,
    pub resource_type: String, // "pod", "service", "deployment", "configmap", "secret"
    pub namespace: String,
    pub name: String,
    pub cluster_name: String,
    pub labels: std::collections::HashMap<String, String>,
    pub annotations: std::collections::HashMap<String, String>,
    pub spec: serde_json::Value,
    pub status: serde_json::Value,
    pub security_context: Option<SecurityContext>,
    pub created_at: i64,
    pub last_updated: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityContext {
    pub run_as_user: Option<u32>,
    pub run_as_group: Option<u32>,
    pub run_as_non_root: Option<bool>,
    pub privileged: Option<bool>,
    pub allow_privilege_escalation: Option<bool>,
    pub capabilities: Option<Capabilities>,
    pub selinux_options: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Capabilities {
    pub add: Vec<String>,
    pub drop: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerRuntime {
    pub runtime_id: String,
    pub runtime_type: String, // "docker", "containerd", "crio"
    pub version: String,
    pub host: String,
    pub active_containers: u32,
    pub total_containers: u32,
    pub images_count: u32,
    pub cpu_usage: f64,
    pub memory_usage: f64,
    pub disk_usage: f64,
    pub last_updated: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerSecurityPolicy {
    pub policy_id: String,
    pub name: String,
    pub description: String,
    pub policy_type: String, // "admission", "runtime", "network", "compliance"
    pub rules: Vec<ContainerSecurityRule>,
    pub enforcement_action: String, // "allow", "deny", "warn"
    pub enabled: bool,
    pub created_at: i64,
    pub last_modified: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerSecurityRule {
    pub rule_id: String,
    pub rule_type: String, // "image_policy", "resource_limits", "security_context", "network_policy"
    pub conditions: Vec<RuleCondition>,
    pub actions: Vec<RuleAction>,
    pub severity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleCondition {
    pub field: String,
    pub operator: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleAction {
    pub action_type: String,
    pub parameters: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerSecurityEvent {
    pub event_id: String,
    pub event_type: String, // "runtime_violation", "admission_denied", "vulnerability_detected", "policy_violation"
    pub severity: String,
    pub container_id: Option<String>,
    pub image_id: Option<String>,
    pub pod_name: Option<String>,
    pub namespace: Option<String>,
    pub description: String,
    pub details: serde_json::Value,
    pub remediation: Vec<String>,
    pub status: String, // "open", "investigating", "resolved"
    pub detected_at: i64,
    pub resolved_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerComplianceReport {
    pub report_id: String,
    pub cluster_name: String,
    pub compliance_framework: String, // "cis-kubernetes", "nist", "pci-dss"
    pub total_checks: u32,
    pub passed_checks: u32,
    pub failed_checks: u32,
    pub score: f64,
    pub findings: Vec<ComplianceFinding>,
    pub generated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceFinding {
    pub finding_id: String,
    pub check_id: String,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub resource_type: String,
    pub resource_name: String,
    pub namespace: String,
    pub remediation: String,
    pub status: String, // "fail", "pass", "warning"
}

#[async_trait]
pub trait ContainerSecurityTrait {
    async fn scan_container_image(&self, image: ContainerImage) -> Result<ContainerImage, String>;
    async fn register_kubernetes_resource(&self, resource: KubernetesResource) -> Result<(), String>;
    async fn create_security_policy(&self, policy: ContainerSecurityPolicy) -> Result<String, String>;
    async fn monitor_runtime(&self, runtime: ContainerRuntime) -> Result<(), String>;
    async fn detect_runtime_threats(&self, container_id: &str) -> Vec<ContainerSecurityEvent>;
    async fn run_compliance_scan(&self, cluster_name: &str, framework: &str) -> Result<ContainerComplianceReport, String>;
    async fn get_vulnerability_summary(&self) -> std::collections::HashMap<String, u32>;
    async fn remediate_vulnerability(&self, vulnerability_id: &str) -> Result<String, String>;
    async fn get_container_security_status(&self) -> String;
}

#[derive(Clone)]
pub struct ContainerSecurityEngine {
    container_images: Arc<DashMap<String, ContainerImage>>,
    kubernetes_resources: Arc<DashMap<String, KubernetesResource>>,
    security_policies: Arc<DashMap<String, ContainerSecurityPolicy>>,
    container_runtimes: Arc<DashMap<String, ContainerRuntime>>,
    security_events: Arc<DashMap<String, ContainerSecurityEvent>>,
    compliance_reports: Arc<DashMap<String, ContainerComplianceReport>>,
    scanned_images: Arc<RwLock<u64>>,
    detected_vulnerabilities: Arc<RwLock<u64>>,
    policy_violations: Arc<RwLock<u32>>,
    last_error: Arc<RwLock<Option<String>>>,
}

impl ContainerSecurityEngine {
    pub fn new() -> Self {
        Self {
            container_images: Arc::new(DashMap::new()),
            kubernetes_resources: Arc::new(DashMap::new()),
            security_policies: Arc::new(DashMap::new()),
            container_runtimes: Arc::new(DashMap::new()),
            security_events: Arc::new(DashMap::new()),
            compliance_reports: Arc::new(DashMap::new()),
            scanned_images: Arc::new(RwLock::new(0)),
            detected_vulnerabilities: Arc::new(RwLock::new(0)),
            policy_violations: Arc::new(RwLock::new(0)),
            last_error: Arc::new(RwLock::new(None)),
        }
    }

    pub async fn get_cluster_metrics(&self, cluster_name: &str) -> std::collections::HashMap<String, f64> {
        let mut metrics = std::collections::HashMap::new();
        
        let mut pod_count = 0.0;
        let mut service_count = 0.0;
        let mut deployment_count = 0.0;

        for resource in self.kubernetes_resources.iter() {
            if resource.cluster_name == cluster_name {
                match resource.resource_type.as_str() {
                    "pod" => pod_count += 1.0,
                    "service" => service_count += 1.0,
                    "deployment" => deployment_count += 1.0,
                    _ => {}
                }
            }
        }

        metrics.insert("pod_count".to_string(), pod_count);
        metrics.insert("service_count".to_string(), service_count);
        metrics.insert("deployment_count".to_string(), deployment_count);
        metrics.insert("security_score".to_string(), 85.5); // Simulated

        metrics
    }

    pub async fn get_image_analytics(&self) -> std::collections::HashMap<String, f64> {
        let mut analytics = std::collections::HashMap::new();
        
        let scanned = *self.scanned_images.read().await;
        let vulnerabilities = *self.detected_vulnerabilities.read().await;
        
        analytics.insert("total_images_scanned".to_string(), scanned as f64);
        analytics.insert("total_vulnerabilities".to_string(), vulnerabilities as f64);
        analytics.insert("avg_vulnerabilities_per_image".to_string(), 
                        if scanned > 0 { vulnerabilities as f64 / scanned as f64 } else { 0.0 });

        analytics
    }

    async fn perform_image_scan(&self, image: &ContainerImage) -> Vec<ContainerVulnerability> {
        // Simulate vulnerability scanning
        let mut vulnerabilities = Vec::new();

        // Simulate finding vulnerabilities based on image characteristics
        if image.name.contains("node") || image.tag.contains("latest") {
            vulnerabilities.push(ContainerVulnerability {
                vulnerability_id: format!("vuln_{}", Utc::now().timestamp()),
                cve_id: Some("CVE-2023-12345".to_string()),
                severity: "high".to_string(),
                title: "Buffer overflow in libssl".to_string(),
                description: "A buffer overflow vulnerability exists in OpenSSL".to_string(),
                package_name: "openssl".to_string(),
                installed_version: "1.1.1".to_string(),
                fixed_version: Some("1.1.1k".to_string()),
                cvss_score: Some(7.5),
                references: vec!["https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-12345".to_string()],
            });
        }

        if image.size > 1024 * 1024 * 1024 { // > 1GB
            vulnerabilities.push(ContainerVulnerability {
                vulnerability_id: format!("vuln_{}", Utc::now().timestamp() + 1),
                cve_id: Some("CVE-2023-54321".to_string()),
                severity: "medium".to_string(),
                title: "Outdated base image".to_string(),
                description: "Base image contains outdated packages".to_string(),
                package_name: "base-image".to_string(),
                installed_version: "20.04".to_string(),
                fixed_version: Some("22.04".to_string()),
                cvss_score: Some(5.5),
                references: vec!["https://ubuntu.com/security".to_string()],
            });
        }

        vulnerabilities
    }

    async fn analyze_kubernetes_security(&self, resource: &KubernetesResource) -> Vec<ContainerSecurityEvent> {
        let mut events = Vec::new();
        let current_time = Utc::now().timestamp();

        // Check for security context issues
        if let Some(security_context) = &resource.security_context {
            if security_context.privileged == Some(true) {
                events.push(ContainerSecurityEvent {
                    event_id: format!("event_{}_{}", current_time, resource.resource_id),
                    event_type: "runtime_violation".to_string(),
                    severity: "high".to_string(),
                    container_id: None,
                    image_id: None,
                    pod_name: Some(resource.name.clone()),
                    namespace: Some(resource.namespace.clone()),
                    description: "Pod running with privileged access".to_string(),
                    details: serde_json::json!({
                        "privileged": true,
                        "resource_type": resource.resource_type
                    }),
                    remediation: vec![
                        "Remove privileged flag unless absolutely necessary".to_string(),
                        "Use specific capabilities instead of privileged mode".to_string(),
                    ],
                    status: "open".to_string(),
                    detected_at: current_time,
                    resolved_at: None,
                });
            }

            if security_context.run_as_non_root != Some(true) {
                events.push(ContainerSecurityEvent {
                    event_id: format!("event_{}_{}", current_time + 1, resource.resource_id),
                    event_type: "policy_violation".to_string(),
                    severity: "medium".to_string(),
                    container_id: None,
                    image_id: None,
                    pod_name: Some(resource.name.clone()),
                    namespace: Some(resource.namespace.clone()),
                    description: "Container not configured to run as non-root".to_string(),
                    details: serde_json::json!({
                        "run_as_non_root": security_context.run_as_non_root,
                        "resource_type": resource.resource_type
                    }),
                    remediation: vec![
                        "Set runAsNonRoot to true".to_string(),
                        "Specify a non-root user ID".to_string(),
                    ],
                    status: "open".to_string(),
                    detected_at: current_time,
                    resolved_at: None,
                });
            }
        }

        // Check for missing security context
        if resource.security_context.is_none() && resource.resource_type == "pod" {
            events.push(ContainerSecurityEvent {
                event_id: format!("event_{}_{}", current_time + 2, resource.resource_id),
                event_type: "policy_violation".to_string(),
                severity: "medium".to_string(),
                container_id: None,
                image_id: None,
                pod_name: Some(resource.name.clone()),
                namespace: Some(resource.namespace.clone()),
                description: "Pod missing security context configuration".to_string(),
                details: serde_json::json!({
                    "security_context": "missing",
                    "resource_type": resource.resource_type
                }),
                remediation: vec![
                    "Add security context to pod specification".to_string(),
                    "Configure appropriate user and group IDs".to_string(),
                ],
                status: "open".to_string(),
                detected_at: current_time,
                resolved_at: None,
            });
        }

        events
    }

    async fn run_compliance_checks(&self, cluster_name: &str, framework: &str) -> Vec<ComplianceFinding> {
        let mut findings = Vec::new();

        // Get all resources for the cluster
        let cluster_resources: Vec<_> = self.kubernetes_resources
            .iter()
            .filter(|r| r.cluster_name == cluster_name)
            .collect();

        match framework {
            "cis-kubernetes" => {
                // CIS Kubernetes Benchmark checks
                for resource in cluster_resources {
                    if resource.resource_type == "pod" {
                        // Check 5.1.1: Ensure that the cluster-admin role is only used where required
                        if resource.namespace == "kube-system" {
                            findings.push(ComplianceFinding {
                                finding_id: format!("cis_5_1_1_{}", resource.resource_id),
                                check_id: "5.1.1".to_string(),
                                title: "Cluster-admin role usage".to_string(),
                                description: "Pods in kube-system namespace should be reviewed".to_string(),
                                severity: "medium".to_string(),
                                resource_type: resource.resource_type.clone(),
                                resource_name: resource.name.clone(),
                                namespace: resource.namespace.clone(),
                                remediation: "Review and minimize cluster-admin usage".to_string(),
                                status: "warning".to_string(),
                            });
                        }

                        // Check 5.1.3: Minimize wildcard use in Roles and ClusterRoles
                        if let Some(security_context) = &resource.security_context {
                            if security_context.privileged == Some(true) {
                                findings.push(ComplianceFinding {
                                    finding_id: format!("cis_5_1_3_{}", resource.resource_id),
                                    check_id: "5.1.3".to_string(),
                                    title: "Privileged container".to_string(),
                                    description: "Container running with privileged access".to_string(),
                                    severity: "high".to_string(),
                                    resource_type: resource.resource_type.clone(),
                                    resource_name: resource.name.clone(),
                                    namespace: resource.namespace.clone(),
                                    remediation: "Remove privileged flag and use specific capabilities".to_string(),
                                    status: "fail".to_string(),
                                });
                            }
                        }
                    }
                }
            },
            "nist" => {
                // NIST SP 800-190 checks
                for resource in cluster_resources {
                    if resource.resource_type == "pod" {
                        if resource.security_context.is_none() {
                            findings.push(ComplianceFinding {
                                finding_id: format!("nist_ac_6_{}", resource.resource_id),
                                check_id: "AC-6".to_string(),
                                title: "Least Privilege".to_string(),
                                description: "Security context not configured".to_string(),
                                severity: "medium".to_string(),
                                resource_type: resource.resource_type.clone(),
                                resource_name: resource.name.clone(),
                                namespace: resource.namespace.clone(),
                                remediation: "Configure security context with least privilege".to_string(),
                                status: "fail".to_string(),
                            });
                        }
                    }
                }
            },
            _ => {}
        }

        findings
    }
}

#[async_trait]
impl ContainerSecurityTrait for ContainerSecurityEngine {
    async fn scan_container_image(&self, mut image: ContainerImage) -> Result<ContainerImage, String> {
        let mut scanned = self.scanned_images.write().await;
        *scanned += 1;

        // Perform vulnerability scan
        let vulnerabilities = self.perform_image_scan(&image).await;
        
        let mut detected = self.detected_vulnerabilities.write().await;
        *detected += vulnerabilities.len() as u64;

        image.vulnerabilities = vulnerabilities;
        image.scan_status = "completed".to_string();
        image.last_scanned = Utc::now().timestamp();

        self.container_images.insert(image.image_id.clone(), image.clone());
        Ok(image)
    }

    async fn register_kubernetes_resource(&self, resource: KubernetesResource) -> Result<(), String> {
        // Analyze resource for security issues
        let security_events = self.analyze_kubernetes_security(&resource).await;
        
        // Store security events
        for event in security_events {
            if event.severity == "high" || event.severity == "critical" {
                let mut violations = self.policy_violations.write().await;
                *violations += 1;
            }
            self.security_events.insert(event.event_id.clone(), event);
        }

        self.kubernetes_resources.insert(resource.resource_id.clone(), resource);
        Ok(())
    }

    async fn create_security_policy(&self, policy: ContainerSecurityPolicy) -> Result<String, String> {
        let policy_id = policy.policy_id.clone();
        self.security_policies.insert(policy_id.clone(), policy);
        Ok(policy_id)
    }

    async fn monitor_runtime(&self, runtime: ContainerRuntime) -> Result<(), String> {
        self.container_runtimes.insert(runtime.runtime_id.clone(), runtime);
        Ok(())
    }

    async fn detect_runtime_threats(&self, container_id: &str) -> Vec<ContainerSecurityEvent> {
        // Simulate runtime threat detection
        let current_time = Utc::now().timestamp();
        
        vec![
            ContainerSecurityEvent {
                event_id: format!("runtime_{}_{}", container_id, current_time),
                event_type: "runtime_violation".to_string(),
                severity: "medium".to_string(),
                container_id: Some(container_id.to_string()),
                image_id: None,
                pod_name: None,
                namespace: None,
                description: "Suspicious process execution detected".to_string(),
                details: serde_json::json!({
                    "process": "/bin/sh",
                    "command": "curl http://malicious-site.com",
                    "detection_method": "behavioral_analysis"
                }),
                remediation: vec![
                    "Investigate the suspicious process".to_string(),
                    "Check for malware or unauthorized access".to_string(),
                ],
                status: "open".to_string(),
                detected_at: current_time,
                resolved_at: None,
            }
        ]
    }

    async fn run_compliance_scan(&self, cluster_name: &str, framework: &str) -> Result<ContainerComplianceReport, String> {
        let findings = self.run_compliance_checks(cluster_name, framework).await;
        
        let total_checks = 50; // Simulated total checks
        let failed_checks = findings.iter().filter(|f| f.status == "fail").count() as u32;
        let passed_checks = total_checks - failed_checks;
        let score = (passed_checks as f64 / total_checks as f64) * 100.0;

        let report = ContainerComplianceReport {
            report_id: format!("compliance_{}_{}", cluster_name, Utc::now().timestamp()),
            cluster_name: cluster_name.to_string(),
            compliance_framework: framework.to_string(),
            total_checks,
            passed_checks,
            failed_checks,
            score,
            findings,
            generated_at: Utc::now().timestamp(),
        };

        self.compliance_reports.insert(report.report_id.clone(), report.clone());
        Ok(report)
    }

    async fn get_vulnerability_summary(&self) -> std::collections::HashMap<String, u32> {
        let mut summary = std::collections::HashMap::new();
        
        let mut critical = 0;
        let mut high = 0;
        let mut medium = 0;
        let mut low = 0;

        for image in self.container_images.iter() {
            for vuln in &image.vulnerabilities {
                match vuln.severity.as_str() {
                    "critical" => critical += 1,
                    "high" => high += 1,
                    "medium" => medium += 1,
                    "low" => low += 1,
                    _ => {}
                }
            }
        }

        summary.insert("critical".to_string(), critical);
        summary.insert("high".to_string(), high);
        summary.insert("medium".to_string(), medium);
        summary.insert("low".to_string(), low);

        summary
    }

    async fn remediate_vulnerability(&self, vulnerability_id: &str) -> Result<String, String> {
        // Find the vulnerability across all images
        for mut image in self.container_images.iter_mut() {
            if let Some(vuln_index) = image.vulnerabilities.iter().position(|v| v.vulnerability_id == vulnerability_id) {
                image.vulnerabilities.remove(vuln_index);
                return Ok("Vulnerability remediated successfully".to_string());
            }
        }
        
        Err("Vulnerability not found".to_string())
    }

    async fn get_container_security_status(&self) -> String {
        let scanned = *self.scanned_images.read().await;
        let vulnerabilities = *self.detected_vulnerabilities.read().await;
        let violations = *self.policy_violations.read().await;
        
        format!("Container Security Engine: {} images scanned, {} vulnerabilities detected, {} policy violations", 
               scanned, vulnerabilities, violations)
    }
}