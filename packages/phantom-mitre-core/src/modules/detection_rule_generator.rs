//! Detection Rule Generator Module
//! Advanced detection rule generation capabilities

use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionRuleResult {
    pub rule_id: String,
    pub timestamp: DateTime<Utc>,
    pub rule_name: String,
    pub rule_type: RuleType,
    pub rule_content: String,
    pub confidence: f64,
    pub severity: RuleSeverity,
    pub mitre_techniques: Vec<String>,
    pub data_sources: Vec<String>,
    pub false_positive_likelihood: f64,
    pub performance_impact: PerformanceImpact,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleType {
    Sigma,
    YARA,
    Suricata,
    Splunk,
    ElasticSearch,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PerformanceImpact {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleGenerationRequest {
    pub technique_id: String,
    pub rule_type: RuleType,
    pub target_platform: String,
    pub detection_context: DetectionContext,
    pub customization_options: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionContext {
    pub environment_type: String,
    pub log_sources: Vec<String>,
    pub threat_profile: ThreatProfile,
    pub compliance_requirements: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreatProfile {
    pub threat_actors: Vec<String>,
    pub attack_vectors: Vec<String>,
    pub target_assets: Vec<String>,
    pub risk_tolerance: f64,
}

pub struct DetectionRuleGenerator {
    generated_rules: Vec<DetectionRuleResult>,
    rule_templates: HashMap<String, RuleTemplate>,
    technique_mappings: HashMap<String, TechniqueMetadata>,
    config: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuleTemplate {
    pub template_id: String,
    pub name: String,
    pub rule_type: RuleType,
    pub template_content: String,
    pub variables: Vec<String>,
    pub applicable_techniques: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechniqueMetadata {
    pub technique_id: String,
    pub technique_name: String,
    pub tactic: String,
    pub data_sources: Vec<String>,
    pub detection_difficulty: f64,
    pub common_platforms: Vec<String>,
}

impl DetectionRuleGenerator {
    pub fn new() -> Self {
        let mut generator = Self {
            generated_rules: Vec::new(),
            rule_templates: HashMap::new(),
            technique_mappings: HashMap::new(),
            config: HashMap::new(),
        };
        
        generator.initialize_templates();
        generator.initialize_technique_mappings();
        generator
    }

    fn initialize_templates(&mut self) {
        // Sigma rule templates
        self.rule_templates.insert("sigma_process_creation".to_string(), RuleTemplate {
            template_id: "sigma_process_creation".to_string(),
            name: "Process Creation Detection".to_string(),
            rule_type: RuleType::Sigma,
            template_content: r#"
title: {{RULE_TITLE}}
id: {{RULE_ID}}
status: experimental
description: Detects {{TECHNIQUE_NAME}} activity
references:
    - https://attack.mitre.org/techniques/{{TECHNIQUE_ID}}/
author: Phantom Detection Rule Generator
date: {{DATE}}
modified: {{DATE}}
tags:
    - attack.{{TACTIC}}
    - attack.{{TECHNIQUE_ID}}
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        CommandLine|contains:
            - '{{SUSPICIOUS_COMMAND}}'
        Image|endswith:
            - '{{SUSPICIOUS_EXECUTABLE}}'
    condition: selection
falsepositives:
    - Administrative activity
    - Software installations
level: {{SEVERITY}}
"#.to_string(),
            variables: vec!["RULE_TITLE", "RULE_ID", "TECHNIQUE_NAME", "TECHNIQUE_ID", "DATE", "TACTIC", "SUSPICIOUS_COMMAND", "SUSPICIOUS_EXECUTABLE", "SEVERITY"].map(|s| s.to_string()).collect(),
            applicable_techniques: vec!["T1059", "T1055", "T1547"].map(|s| s.to_string()).collect(),
        });

        // YARA rule template
        self.rule_templates.insert("yara_malware_detection".to_string(), RuleTemplate {
            template_id: "yara_malware_detection".to_string(),
            name: "Malware Detection Rule".to_string(),
            rule_type: RuleType::YARA,
            template_content: r#"
rule {{RULE_NAME}} {
    meta:
        description = "{{DESCRIPTION}}"
        author = "Phantom Detection Rule Generator"
        date = "{{DATE}}"
        mitre_technique = "{{TECHNIQUE_ID}}"
        severity = "{{SEVERITY}}"
        
    strings:
        $s1 = "{{STRING_PATTERN_1}}"
        $s2 = "{{STRING_PATTERN_2}}"
        $hex1 = { {{HEX_PATTERN}} }
        
    condition:
        (uint16(0) == 0x5a4d) and 
        (filesize < {{MAX_FILESIZE}}) and
        ({{CONDITION_LOGIC}})
}
"#.to_string(),
            variables: vec!["RULE_NAME", "DESCRIPTION", "DATE", "TECHNIQUE_ID", "SEVERITY", "STRING_PATTERN_1", "STRING_PATTERN_2", "HEX_PATTERN", "MAX_FILESIZE", "CONDITION_LOGIC"].map(|s| s.to_string()).collect(),
            applicable_techniques: vec!["T1055", "T1105", "T1027"].map(|s| s.to_string()).collect(),
        });

        // Suricata rule template
        self.rule_templates.insert("suricata_network_detection".to_string(), RuleTemplate {
            template_id: "suricata_network_detection".to_string(),
            name: "Network Traffic Detection".to_string(),
            rule_type: RuleType::Suricata,
            template_content: r#"
alert {{PROTOCOL}} {{SOURCE_IP}} {{SOURCE_PORT}} -> {{DEST_IP}} {{DEST_PORT}} (
    msg:"{{ALERT_MESSAGE}}";
    content:"{{CONTENT_PATTERN}}";
    {{ADDITIONAL_OPTIONS}}
    reference:url,attack.mitre.org/techniques/{{TECHNIQUE_ID}}/;
    classtype:{{CLASS_TYPE}};
    sid:{{SID}};
    rev:1;
)
"#.to_string(),
            variables: vec!["PROTOCOL", "SOURCE_IP", "SOURCE_PORT", "DEST_IP", "DEST_PORT", "ALERT_MESSAGE", "CONTENT_PATTERN", "ADDITIONAL_OPTIONS", "TECHNIQUE_ID", "CLASS_TYPE", "SID"].map(|s| s.to_string()).collect(),
            applicable_techniques: vec!["T1071", "T1095", "T1090"].map(|s| s.to_string()).collect(),
        });
    }

    fn initialize_technique_mappings(&mut self) {
        let techniques = vec![
            TechniqueMetadata {
                technique_id: "T1059".to_string(),
                technique_name: "Command and Scripting Interpreter".to_string(),
                tactic: "execution".to_string(),
                data_sources: vec!["Process", "Command"].map(|s| s.to_string()).collect(),
                detection_difficulty: 0.6,
                common_platforms: vec!["Windows", "Linux", "macOS"].map(|s| s.to_string()).collect(),
            },
            TechniqueMetadata {
                technique_id: "T1055".to_string(),
                technique_name: "Process Injection".to_string(),
                tactic: "defense_evasion".to_string(),
                data_sources: vec!["Process", "File", "API"].map(|s| s.to_string()).collect(),
                detection_difficulty: 0.8,
                common_platforms: vec!["Windows"].map(|s| s.to_string()).collect(),
            },
            TechniqueMetadata {
                technique_id: "T1071".to_string(),
                technique_name: "Application Layer Protocol".to_string(),
                tactic: "command_and_control".to_string(),
                data_sources: vec!["Network Traffic", "Netflow"].map(|s| s.to_string()).collect(),
                detection_difficulty: 0.7,
                common_platforms: vec!["Windows", "Linux", "macOS", "Network"].map(|s| s.to_string()).collect(),
            },
            TechniqueMetadata {
                technique_id: "T1547".to_string(),
                technique_name: "Boot or Logon Autostart Execution".to_string(),
                tactic: "persistence".to_string(),
                data_sources: vec!["Process", "File", "Windows Registry"].map(|s| s.to_string()).collect(),
                detection_difficulty: 0.5,
                common_platforms: vec!["Windows", "Linux", "macOS"].map(|s| s.to_string()).collect(),
            },
        ];

        for technique in techniques {
            self.technique_mappings.insert(technique.technique_id.clone(), technique);
        }
    }

    pub fn generate_detection_rule(&mut self, request: RuleGenerationRequest) -> DetectionRuleResult {
        let rule_id = uuid::Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        let technique_metadata = self.technique_mappings.get(&request.technique_id)
            .cloned()
            .unwrap_or_else(|| TechniqueMetadata {
                technique_id: request.technique_id.clone(),
                technique_name: "Unknown Technique".to_string(),
                tactic: "unknown".to_string(),
                data_sources: vec!["Unknown".to_string()],
                detection_difficulty: 0.5,
                common_platforms: vec!["Generic".to_string()],
            });

        let template = self.select_template(&request.rule_type, &request.technique_id);
        let rule_content = self.generate_rule_content(&template, &technique_metadata, &request);
        
        let confidence = self.calculate_rule_confidence(&technique_metadata, &request);
        let severity = self.determine_rule_severity(&technique_metadata, &request);
        let performance_impact = self.assess_performance_impact(&template, &request);
        let false_positive_likelihood = self.estimate_false_positive_rate(&technique_metadata, &request);
        
        let recommendations = self.generate_rule_recommendations(&technique_metadata, confidence, false_positive_likelihood);

        let result = DetectionRuleResult {
            rule_id: rule_id.clone(),
            timestamp,
            rule_name: format!("{} Detection Rule", technique_metadata.technique_name),
            rule_type: request.rule_type.clone(),
            rule_content,
            confidence,
            severity,
            mitre_techniques: vec![request.technique_id.clone()],
            data_sources: technique_metadata.data_sources.clone(),
            false_positive_likelihood,
            performance_impact,
            recommendations,
        };

        self.generated_rules.push(result.clone());
        result
    }

    fn select_template(&self, rule_type: &RuleType, technique_id: &str) -> RuleTemplate {
        // Select the most appropriate template based on rule type and technique
        let template_key = match rule_type {
            RuleType::Sigma => {
                if technique_id.starts_with("T1059") || technique_id.starts_with("T1055") {
                    "sigma_process_creation"
                } else {
                    "sigma_process_creation" // Default fallback
                }
            },
            RuleType::YARA => "yara_malware_detection",
            RuleType::Suricata => "suricata_network_detection",
            _ => "sigma_process_creation", // Default fallback
        };

        self.rule_templates.get(template_key)
            .cloned()
            .unwrap_or_else(|| self.create_generic_template(rule_type))
    }

    fn create_generic_template(&self, rule_type: &RuleType) -> RuleTemplate {
        RuleTemplate {
            template_id: "generic".to_string(),
            name: "Generic Rule Template".to_string(),
            rule_type: rule_type.clone(),
            template_content: "# Generic rule template\n# Technique: {{TECHNIQUE_ID}}\n# Generated by Phantom Detection Rule Generator".to_string(),
            variables: vec!["TECHNIQUE_ID".to_string()],
            applicable_techniques: vec![],
        }
    }

    fn generate_rule_content(&self, template: &RuleTemplate, metadata: &TechniqueMetadata, request: &RuleGenerationRequest) -> String {
        let mut content = template.template_content.clone();
        
        // Replace template variables
        let replacements = HashMap::from([
            ("{{RULE_TITLE}}".to_string(), format!("Detection of {}", metadata.technique_name)),
            ("{{RULE_ID}}".to_string(), uuid::Uuid::new_v4().to_string()),
            ("{{TECHNIQUE_NAME}}".to_string(), metadata.technique_name.clone()),
            ("{{TECHNIQUE_ID}}".to_string(), metadata.technique_id.clone()),
            ("{{DATE}}".to_string(), Utc::now().format("%Y/%m/%d").to_string()),
            ("{{TACTIC}}".to_string(), metadata.tactic.clone()),
            ("{{SEVERITY}}".to_string(), self.map_severity_to_string(&self.determine_rule_severity(metadata, request))),
            ("{{SUSPICIOUS_COMMAND}}".to_string(), self.generate_suspicious_patterns(&metadata.technique_id)),
            ("{{SUSPICIOUS_EXECUTABLE}}".to_string(), self.generate_executable_patterns(&metadata.technique_id)),
            ("{{RULE_NAME}}".to_string(), format!("Detect_{}", metadata.technique_id.replace('.', "_"))),
            ("{{DESCRIPTION}}".to_string(), format!("Detects {} behavior", metadata.technique_name)),
            ("{{STRING_PATTERN_1}}".to_string(), "suspicious_string_1".to_string()),
            ("{{STRING_PATTERN_2}}".to_string(), "suspicious_string_2".to_string()),
            ("{{HEX_PATTERN}}".to_string(), "48 89 e5".to_string()),
            ("{{MAX_FILESIZE}}".to_string(), "10MB".to_string()),
            ("{{CONDITION_LOGIC}}".to_string(), "any of ($s*)".to_string()),
            ("{{PROTOCOL}}".to_string(), "tcp".to_string()),
            ("{{SOURCE_IP}}".to_string(), "any".to_string()),
            ("{{SOURCE_PORT}}".to_string(), "any".to_string()),
            ("{{DEST_IP}}".to_string(), "any".to_string()),
            ("{{DEST_PORT}}".to_string(), "any".to_string()),
            ("{{ALERT_MESSAGE}}".to_string(), format!("Possible {} Activity", metadata.technique_name)),
            ("{{CONTENT_PATTERN}}".to_string(), "suspicious_content".to_string()),
            ("{{ADDITIONAL_OPTIONS}}".to_string(), "nocase;".to_string()),
            ("{{CLASS_TYPE}}".to_string(), "trojan-activity".to_string()),
            ("{{SID}}".to_string(), "1000001".to_string()),
        ]);

        for (placeholder, replacement) in replacements {
            content = content.replace(&placeholder, &replacement);
        }

        content
    }

    fn generate_suspicious_patterns(&self, technique_id: &str) -> String {
        match technique_id {
            "T1059.001" => "powershell.exe -EncodedCommand".to_string(),
            "T1059.003" => "cmd.exe /c".to_string(),
            "T1055" => "CreateRemoteThread".to_string(),
            _ => "suspicious_pattern".to_string(),
        }
    }

    fn generate_executable_patterns(&self, technique_id: &str) -> String {
        match technique_id {
            "T1059.001" => "\\powershell.exe".to_string(),
            "T1059.003" => "\\cmd.exe".to_string(),
            "T1055" => "\\*.exe".to_string(),
            _ => "\\suspicious.exe".to_string(),
        }
    }

    fn calculate_rule_confidence(&self, metadata: &TechniqueMetadata, request: &RuleGenerationRequest) -> f64 {
        let base_confidence = 1.0 - metadata.detection_difficulty;
        let context_bonus = if request.detection_context.log_sources.iter()
            .any(|source| metadata.data_sources.contains(source)) { 0.1 } else { 0.0 };
        
        ((base_confidence + context_bonus) * 100.0).min(100.0)
    }

    fn determine_rule_severity(&self, metadata: &TechniqueMetadata, request: &RuleGenerationRequest) -> RuleSeverity {
        let threat_actor_multiplier = if request.detection_context.threat_profile.threat_actors.contains(&"APT".to_string()) { 1.0 } else { 0.8 };
        let tactic_score = match metadata.tactic.as_str() {
            "initial_access" | "execution" | "persistence" => 0.9,
            "privilege_escalation" | "defense_evasion" => 0.8,
            "credential_access" | "discovery" => 0.7,
            "lateral_movement" | "collection" => 0.6,
            _ => 0.5,
        };

        let final_score = tactic_score * threat_actor_multiplier;

        match final_score {
            s if s >= 0.8 => RuleSeverity::Critical,
            s if s >= 0.6 => RuleSeverity::High,
            s if s >= 0.4 => RuleSeverity::Medium,
            _ => RuleSeverity::Low,
        }
    }

    fn assess_performance_impact(&self, template: &RuleTemplate, _request: &RuleGenerationRequest) -> PerformanceImpact {
        match template.rule_type {
            RuleType::YARA => PerformanceImpact::High,
            RuleType::Suricata => PerformanceImpact::Medium,
            RuleType::Sigma => PerformanceImpact::Low,
            _ => PerformanceImpact::Medium,
        }
    }

    fn estimate_false_positive_rate(&self, metadata: &TechniqueMetadata, request: &RuleGenerationRequest) -> f64 {
        let base_fp_rate = metadata.detection_difficulty * 0.3;
        let environment_factor = match request.detection_context.environment_type.as_str() {
            "production" => 1.2,
            "development" => 0.8,
            "test" => 0.5,
            _ => 1.0,
        };

        (base_fp_rate * environment_factor * 100.0).min(100.0)
    }

    fn map_severity_to_string(&self, severity: &RuleSeverity) -> String {
        match severity {
            RuleSeverity::Low => "low".to_string(),
            RuleSeverity::Medium => "medium".to_string(),
            RuleSeverity::High => "high".to_string(),
            RuleSeverity::Critical => "critical".to_string(),
        }
    }

    fn generate_rule_recommendations(&self, metadata: &TechniqueMetadata, confidence: f64, fp_rate: f64) -> Vec<String> {
        let mut recommendations = Vec::new();

        if confidence < 70.0 {
            recommendations.push("Consider additional context or data sources to improve detection confidence".to_string());
        }

        if fp_rate > 20.0 {
            recommendations.push("Review and refine rule conditions to reduce false positive rate".to_string());
        }

        if metadata.detection_difficulty > 0.7 {
            recommendations.push("This technique is difficult to detect - consider behavioral analytics".to_string());
        }

        recommendations.push("Test rule in controlled environment before production deployment".to_string());
        recommendations.push("Establish baseline behavior to improve detection accuracy".to_string());

        recommendations
    }

    pub fn get_generated_rules(&self) -> &[DetectionRuleResult] {
        &self.generated_rules
    }

    pub fn get_rules_by_technique(&self, technique_id: &str) -> Vec<&DetectionRuleResult> {
        self.generated_rules.iter()
            .filter(|rule| rule.mitre_techniques.contains(&technique_id.to_string()))
            .collect()
    }
}

#[napi]
pub struct DetectionRuleGeneratorNapi {
    inner: DetectionRuleGenerator,
}

#[napi]
impl DetectionRuleGeneratorNapi {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: DetectionRuleGenerator::new(),
        }
    }

    #[napi]
    pub fn generate_detection_rule(&mut self, request_json: String) -> napi::Result<String> {
        let request: RuleGenerationRequest = serde_json::from_str(&request_json)
            .map_err(|e| napi::Error::from_reason(format!("Failed to parse request: {}", e)))?;
        
        let result = self.inner.generate_detection_rule(request);
        serde_json::to_string(&result)
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_generated_rules(&self) -> napi::Result<String> {
        serde_json::to_string(self.inner.get_generated_rules())
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_rules_by_technique(&self, technique_id: String) -> napi::Result<String> {
        let rules = self.inner.get_rules_by_technique(&technique_id);
        serde_json::to_string(&rules)
            .map_err(|e| napi::Error::from_reason(format!("Serialization failed: {}", e)))
    }

    #[napi]
    pub fn get_supported_rule_types(&self) -> napi::Result<Vec<String>> {
        Ok(vec![
            "Sigma".to_string(),
            "YARA".to_string(),
            "Suricata".to_string(),
            "Splunk".to_string(),
            "ElasticSearch".to_string(),
            "Custom".to_string(),
        ])
    }
}

impl Default for DetectionRuleGenerator {
    fn default() -> Self {
        Self::new()
    }
}
