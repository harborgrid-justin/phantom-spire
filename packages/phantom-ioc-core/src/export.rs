// phantom-ioc-core/src/export.rs
// IOC data export and reporting engine

use crate::types::*;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use serde_json;
use std::fs;
use std::path::Path;

pub struct ExportEngine {
    export_templates: Arc<RwLock<HashMap<String, ExportTemplate>>>,
    export_history: Arc<RwLock<Vec<ExportRecord>>>,
}

impl ExportEngine {
    pub async fn new() -> Result<Self, IOCError> {
        let export_templates = Arc::new(RwLock::new(HashMap::new()));
        let export_history = Arc::new(RwLock::new(Vec::new()));

        let engine = Self {
            export_templates,
            export_history,
        };

        engine.initialize_templates().await?;
        Ok(engine)
    }

    async fn initialize_templates(&self) -> Result<(), IOCError> {
        let mut templates = self.export_templates.write().await;

        // STIX 2.1 export template
        templates.insert("stix".to_string(), ExportTemplate {
            id: "stix".to_string(),
            name: "STIX 2.1 Format".to_string(),
            format: ExportFormat::JSON,
            schema_version: "2.1".to_string(),
            fields: vec![
                "type".to_string(),
                "id".to_string(),
                "created".to_string(),
                "modified".to_string(),
                "indicator".to_string(),
                "pattern".to_string(),
                "labels".to_string(),
            ],
            description: "Export IOCs in STIX 2.1 format for threat intelligence sharing".to_string(),
        });

        // CSV export template
        templates.insert("csv".to_string(), ExportTemplate {
            id: "csv".to_string(),
            name: "CSV Format".to_string(),
            format: ExportFormat::CSV,
            schema_version: "1.0".to_string(),
            fields: vec![
                "id".to_string(),
                "indicator_type".to_string(),
                "value".to_string(),
                "confidence".to_string(),
                "severity".to_string(),
                "source".to_string(),
                "timestamp".to_string(),
                "tags".to_string(),
            ],
            description: "Export IOCs in CSV format for spreadsheet analysis".to_string(),
        });

        // MISP export template
        templates.insert("misp".to_string(), ExportTemplate {
            id: "misp".to_string(),
            name: "MISP JSON Format".to_string(),
            format: ExportFormat::JSON,
            schema_version: "2.4.140".to_string(),
            fields: vec![
                "uuid".to_string(),
                "date".to_string(),
                "info".to_string(),
                "Attribute".to_string(),
            ],
            description: "Export IOCs in MISP format for platform integration".to_string(),
        });

        Ok(())
    }

    pub async fn export_iocs(&self, iocs: &[IOC], template_id: &str, output_path: &Path) -> Result<ExportResult, IOCError> {
        let templates = self.export_templates.read().await;
        let template = templates.get(template_id)
            .ok_or(IOCError::TemplateNotFound)?;

        let export_data = match template.format {
            ExportFormat::JSON => self.export_to_json(iocs, template).await?,
            ExportFormat::CSV => self.export_to_csv(iocs, template).await?,
            ExportFormat::XML => self.export_to_xml(iocs, template).await?,
        };

        // Write to file
        fs::write(output_path, &export_data)?;

        let record = ExportRecord {
            id: uuid::Uuid::new_v4().to_string(),
            template_id: template_id.to_string(),
            format: template.format.clone(),
            record_count: iocs.len(),
            file_path: output_path.to_string_lossy().to_string(),
            export_timestamp: Utc::now(),
            file_size: export_data.len(),
        };

        let mut history = self.export_history.write().await;
        history.push(record.clone());

        Ok(ExportResult {
            success: true,
            record,
            exported_count: iocs.len(),
            errors: Vec::new(),
        })
    }

    async fn export_to_json(&self, iocs: &[IOC], template: &ExportTemplate) -> Result<String, IOCError> {
        let export_iocs: Vec<serde_json::Value> = iocs.iter().map(|ioc| {
            let mut obj = serde_json::Map::new();
            obj.insert("id".to_string(), serde_json::Value::String(ioc.id.clone()));
            obj.insert("indicator_type".to_string(), serde_json::Value::String(format!("{:?}", ioc.indicator_type)));
            obj.insert("value".to_string(), serde_json::Value::String(ioc.value.clone()));
            obj.insert("confidence".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(ioc.confidence).unwrap()));
            obj.insert("severity".to_string(), serde_json::Value::String(format!("{:?}", ioc.severity)));
            obj.insert("source".to_string(), serde_json::Value::String(ioc.source.clone()));
            obj.insert("timestamp".to_string(), serde_json::Value::String(ioc.timestamp.to_rfc3339()));
            obj.insert("tags".to_string(), serde_json::json!(ioc.tags));
            serde_json::Value::Object(obj)
        }).collect();

        let export_obj = serde_json::json!({
            "export_info": {
                "template": template.name,
                "format": "JSON",
                "timestamp": Utc::now().to_rfc3339(),
                "version": template.schema_version,
            },
            "iocs": export_iocs
        });

        serde_json::to_string_pretty(&export_obj).map_err(|e| IOCError::SerializationError(e.to_string()))
    }

    async fn export_to_csv(&self, iocs: &[IOC], template: &ExportTemplate) -> Result<String, IOCError> {
        let mut csv_content = String::new();

        // CSV header
        csv_content.push_str(&template.fields.join(","));
        csv_content.push('\n');

        // CSV data
        for ioc in iocs {
            let row = vec![
                ioc.id.to_string(),
                format!("{:?}", ioc.indicator_type),
                format!("\"{}\"", ioc.value.replace("\"", "\"\"")), // Escape quotes
                ioc.confidence.to_string(),
                format!("{:?}", ioc.severity),
                format!("\"{}\"", ioc.source.replace("\"", "\"\"")),
                ioc.timestamp.to_rfc3339(),
                format!("\"{}\"", ioc.tags.join(";").replace("\"", "\"\"")),
            ];
            csv_content.push_str(&row.join(","));
            csv_content.push('\n');
        }

        Ok(csv_content)
    }

    async fn export_to_xml(&self, iocs: &[IOC], template: &ExportTemplate) -> Result<String, IOCError> {
        let mut xml_content = format!("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml_content.push_str("<ioc_export>\n");
        xml_content.push_str(&format!("  <template>{}</template>\n", template.name));
        xml_content.push_str(&format!("  <timestamp>{}</timestamp>\n", Utc::now().to_rfc3339()));
        xml_content.push_str("  <indicators>\n");

        for ioc in iocs {
            xml_content.push_str("    <indicator>\n");
            xml_content.push_str(&format!("      <id>{}</id>\n", self.escape_xml(&ioc.id.to_string())));
            xml_content.push_str(&format!("      <type>{:?}</type>\n", ioc.indicator_type));
            xml_content.push_str(&format!("      <value>{}</value>\n", self.escape_xml(&ioc.value)));
            xml_content.push_str(&format!("      <confidence>{}</confidence>\n", ioc.confidence));
            xml_content.push_str(&format!("      <severity>{:?}</severity>\n", ioc.severity));
            xml_content.push_str(&format!("      <source>{}</source>\n", self.escape_xml(&ioc.source)));
            xml_content.push_str(&format!("      <timestamp>{}</timestamp>\n", ioc.timestamp.to_rfc3339()));
            xml_content.push_str("      <tags>\n");
            for tag in &ioc.tags {
                xml_content.push_str(&format!("        <tag>{}</tag>\n", self.escape_xml(tag)));
            }
            xml_content.push_str("      </tags>\n");
            xml_content.push_str("    </indicator>\n");
        }

        xml_content.push_str("  </indicators>\n");
        xml_content.push_str("</ioc_export>\n");

        Ok(xml_content)
    }

    fn escape_xml(&self, input: &str) -> String {
        input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&apos;")
    }

    pub async fn get_export_history(&self) -> Vec<ExportRecord> {
        let history = self.export_history.read().await;
        history.clone()
    }

    pub async fn get_available_templates(&self) -> Vec<ExportTemplate> {
        let templates = self.export_templates.read().await;
        templates.values().cloned().collect()
    }

    pub async fn create_custom_template(&self, template: ExportTemplate) -> Result<(), IOCError> {
        let mut templates = self.export_templates.write().await;
        if templates.contains_key(&template.id) {
            return Err(IOCError::TemplateAlreadyExists);
        }
        templates.insert(template.id.clone(), template);
        Ok(())
    }

    pub async fn get_export_stats(&self) -> ExportStats {
        let history = self.export_history.read().await;
        let total_exports = history.len();
        let total_records: usize = history.iter().map(|r| r.record_count).sum();
        let total_size: usize = history.iter().map(|r| r.file_size).sum();

        ExportStats {
            total_exports,
            total_records,
            total_size_bytes: total_size,
            last_export: history.last().map(|r| r.export_timestamp),
        }
    }

    pub async fn get_health(&self) -> ComponentHealth {
        let templates = self.export_templates.read().await;
        let history = self.export_history.read().await;
        ComponentHealth {
            status: HealthStatus::Healthy,
            message: format!("Export engine operational - {} templates, {} exports", templates.len(), history.len()),
            last_check: Utc::now(),
            metrics: {
                let mut metrics = HashMap::new();
                metrics.insert("available_templates".to_string(), templates.len() as f64);
                metrics.insert("total_exports".to_string(), history.len() as f64);
                metrics
            },
        }
    }
}
