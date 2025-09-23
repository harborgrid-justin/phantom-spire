use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
#[napi]
pub struct DatabaseMigrationAgent {
    name: String,
    version: String,
    migrations: Vec<Migration>,
}

#[napi]
impl DatabaseMigrationAgent {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            name: "DatabaseMigrationAgent".to_string(),
            version: "1.0.0".to_string(),
            migrations: Vec::new(),
        }
    }

    #[napi]
    pub fn create_migration(&mut self, name: String, sql_up: String, sql_down: String) -> Migration {
        let migration = Migration {
            id: format!("{}_{}", chrono::Utc::now().timestamp(), name),
            name,
            version: self.migrations.len() as i32 + 1,
            sql_up,
            sql_down,
            created_at: chrono::Utc::now().to_rfc3339(),
            executed_at: None,
            checksum: self.calculate_checksum(&sql_up),
        };
        self.migrations.push(migration.clone());
        migration
    }

    #[napi]
    pub fn validate_migration(&self, migration: &Migration) -> ValidationResult {
        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        if migration.sql_up.is_empty() {
            errors.push("UP migration SQL is empty".to_string());
        }

        if migration.sql_down.is_empty() {
            warnings.push("DOWN migration SQL is empty - rollback not possible".to_string());
        }

        if migration.sql_up.to_uppercase().contains("DROP TABLE") && !migration.sql_up.to_uppercase().contains("IF EXISTS") {
            warnings.push("DROP TABLE without IF EXISTS can fail".to_string());
        }

        ValidationResult {
            is_valid: errors.is_empty(),
            errors,
            warnings,
        }
    }

    #[napi]
    pub fn generate_migration_plan(&self, current_version: i32, target_version: i32) -> MigrationPlan {
        let mut steps = Vec::new();

        if target_version > current_version {
            for migration in &self.migrations {
                if migration.version > current_version && migration.version <= target_version {
                    steps.push(MigrationStep {
                        migration_id: migration.id.clone(),
                        direction: "UP".to_string(),
                        sql: migration.sql_up.clone(),
                    });
                }
            }
        } else if target_version < current_version {
            for migration in self.migrations.iter().rev() {
                if migration.version <= current_version && migration.version > target_version {
                    steps.push(MigrationStep {
                        migration_id: migration.id.clone(),
                        direction: "DOWN".to_string(),
                        sql: migration.sql_down.clone(),
                    });
                }
            }
        }

        MigrationPlan {
            from_version: current_version,
            to_version: target_version,
            steps,
            estimated_duration_ms: steps.len() as i64 * 100,
        }
    }

    fn calculate_checksum(&self, content: &str) -> String {
        use std::hash::{Hash, Hasher};
        use std::collections::hash_map::DefaultHasher;
        let mut hasher = DefaultHasher::new();
        content.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct Migration {
    pub id: String,
    pub name: String,
    pub version: i32,
    pub sql_up: String,
    pub sql_down: String,
    pub created_at: String,
    pub executed_at: Option<String>,
    pub checksum: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct MigrationStep {
    pub migration_id: String,
    pub direction: String,
    pub sql: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct MigrationPlan {
    pub from_version: i32,
    pub to_version: i32,
    pub steps: Vec<MigrationStep>,
    pub estimated_duration_ms: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[napi(object)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}