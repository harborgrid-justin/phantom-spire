//! Database module for phantom-threat-actor-core
//!
//! This module provides database models and operations using the Diesel ORM
//! for PostgreSQL, SQLite, and MySQL databases.

#[cfg(feature = "diesel-orm")]
use diesel::prelude::*;
#[cfg(feature = "diesel-orm")]
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
#[cfg(feature = "diesel-orm")]
use serde::{Deserialize, Serialize};
#[cfg(feature = "diesel-orm")]
use chrono::{DateTime, Utc};
#[cfg(feature = "diesel-orm")]
use std::collections::HashMap;

#[cfg(feature = "diesel-orm")]
pub mod schema;
#[cfg(feature = "diesel-orm")]
pub mod models;

#[cfg(feature = "diesel-orm")]
/// Database connection type
pub type DbConnection = diesel::PgConnection;

/// Database connection manager
#[cfg(feature = "diesel-orm")]
pub struct DatabaseManager {
    pub database_url: String,
}

#[cfg(feature = "diesel-orm")]
impl DatabaseManager {
    /// Create a new database manager
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    /// Establish database connection
    pub fn connect(&self) -> Result<DbConnection, diesel::ConnectionError> {
        diesel::PgConnection::establish(&self.database_url)
    }

    /// Run database migrations
    pub fn run_migrations(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut connection = self.connect()?;
        connection.run_pending_migrations(MIGRATIONS).map_err(|e| {
            let err: Box<dyn std::error::Error + Send + Sync> = Box::new(e);
            err
        })?;
        Ok(())
    }
}

#[cfg(feature = "diesel-orm")]
/// Embedded migrations
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

#[cfg(feature = "diesel-orm")]
/// Database operations trait
#[async_trait::async_trait]
pub trait DatabaseOperations<T> {
    /// Create a new record
    async fn create(&self, conn: &mut DbConnection, item: &T) -> Result<T, diesel::result::Error>;

    /// Find by ID
    async fn find_by_id(&self, conn: &mut DbConnection, id: &str) -> Result<Option<T>, diesel::result::Error>;

    /// Update a record
    async fn update(&self, conn: &mut DbConnection, id: &str, item: &T) -> Result<T, diesel::result::Error>;

    /// Delete a record
    async fn delete(&self, conn: &mut DbConnection, id: &str) -> Result<bool, diesel::result::Error>;

    /// List all records
    async fn list(&self, conn: &mut DbConnection) -> Result<Vec<T>, diesel::result::Error>;

    /// Search records
    async fn search(&self, conn: &mut DbConnection, query: &str) -> Result<Vec<T>, diesel::result::Error>;
}

/// Threat actor database operations
#[cfg(feature = "diesel-orm")]
pub struct ThreatActorRepository;

#[cfg(feature = "diesel-orm")]
#[async_trait::async_trait]
impl DatabaseOperations<models::ThreatActor> for ThreatActorRepository {
    async fn create(&self, conn: &mut DbConnection, item: &models::ThreatActor) -> Result<models::ThreatActor, diesel::result::Error> {
        use schema::threat_actors::dsl::*;

        let new_actor = models::NewThreatActor {
            id: &item.id,
            name: item.name.as_deref(),
            aliases: &item.aliases,
            description: item.description.as_deref(),
            first_seen: item.first_seen,
            last_seen: item.last_seen,
            actor_type: item.actor_type.as_deref(),
            campaigns: &item.campaigns,
            malware: &item.malware,
            techniques: &item.techniques,
            confidence: item.confidence,
            attribution_source: item.attribution_source.as_deref(),
            attributes: item.attributes.clone(),
            created_at: item.created_at,
            updated_at: item.updated_at,
        };

        diesel::insert_into(threat_actors)
            .values(&new_actor)
            .get_result(conn)
    }

    async fn find_by_id(&self, conn: &mut DbConnection, actor_id: &str) -> Result<Option<models::ThreatActor>, diesel::result::Error> {
        use schema::threat_actors::dsl::*;

        threat_actors
            .filter(id.eq(actor_id))
            .select(models::ThreatActor::as_select())
            .first(conn)
            .optional()
    }

    async fn update(&self, conn: &mut DbConnection, actor_id: &str, item: &models::ThreatActor) -> Result<models::ThreatActor, diesel::result::Error> {
        use schema::threat_actors::dsl::*;

        diesel::update(threat_actors.filter(id.eq(actor_id)))
            .set((
                name.eq(&item.name),
                aliases.eq(&item.aliases),
                description.eq(&item.description),
                first_seen.eq(&item.first_seen),
                last_seen.eq(&item.last_seen),
                actor_type.eq(&item.actor_type),
                campaigns.eq(&item.campaigns),
                malware.eq(&item.malware),
                techniques.eq(&item.techniques),
                confidence.eq(&item.confidence),
                attribution_source.eq(&item.attribution_source),
                attributes.eq(&item.attributes),
                updated_at.eq(&item.updated_at),
            ))
            .get_result(conn)
    }

    async fn delete(&self, conn: &mut DbConnection, actor_id: &str) -> Result<bool, diesel::result::Error> {
        use schema::threat_actors::dsl::*;

        let deleted_rows = diesel::delete(threat_actors.filter(id.eq(actor_id)))
            .execute(conn)?;

        Ok(deleted_rows > 0)
    }

    async fn list(&self, conn: &mut DbConnection) -> Result<Vec<models::ThreatActor>, diesel::result::Error> {
        use schema::threat_actors::dsl::*;

        threat_actors
            .select(models::ThreatActor::as_select())
            .load(conn)
    }

    async fn search(&self, conn: &mut DbConnection, query: &str) -> Result<Vec<models::ThreatActor>, diesel::result::Error> {
        use schema::threat_actors::dsl::*;

        threat_actors
            .filter(name.ilike(format!("%{}%", query)))
            .or_filter(description.ilike(format!("%{}%", query)))
            .select(models::ThreatActor::as_select())
            .load(conn)
    }
}

/// Incident database operations
#[cfg(feature = "diesel-orm")]
pub struct IncidentRepository;

#[cfg(feature = "diesel-orm")]
#[async_trait::async_trait]
impl DatabaseOperations<models::Incident> for IncidentRepository {
    async fn create(&self, conn: &mut DbConnection, item: &models::Incident) -> Result<models::Incident, diesel::result::Error> {
        use schema::incidents::dsl::*;

        let new_incident = models::NewIncident {
            id: &item.id,
            title: &item.title,
            description: &item.description,
            severity: &item.severity,
            status: &item.status,
            priority: &item.priority,
            assigned_to: item.assigned_to.as_deref(),
            created_at: item.created_at,
            updated_at: item.updated_at,
            resolved_at: item.resolved_at,
            affected_assets: &item.affected_assets,
            threat_actors: &item.threat_actors,
            tags: &item.tags,
            metadata: item.metadata.clone(),
        };

        diesel::insert_into(incidents)
            .values(&new_incident)
            .get_result(conn)
    }

    async fn find_by_id(&self, conn: &mut DbConnection, incident_id: &str) -> Result<Option<models::Incident>, diesel::result::Error> {
        use schema::incidents::dsl::*;

        incidents
            .filter(id.eq(incident_id))
            .select(models::Incident::as_select())
            .first(conn)
            .optional()
    }

    async fn update(&self, conn: &mut DbConnection, incident_id: &str, item: &models::Incident) -> Result<models::Incident, diesel::result::Error> {
        use schema::incidents::dsl::*;

        diesel::update(incidents.filter(id.eq(incident_id)))
            .set((
                title.eq(&item.title),
                description.eq(&item.description),
                severity.eq(&item.severity),
                status.eq(&item.status),
                priority.eq(&item.priority),
                assigned_to.eq(&item.assigned_to),
                updated_at.eq(&item.updated_at),
                resolved_at.eq(&item.resolved_at),
                affected_assets.eq(&item.affected_assets),
                threat_actors.eq(&item.threat_actors),
                tags.eq(&item.tags),
                metadata.eq(&item.metadata),
            ))
            .get_result(conn)
    }

    async fn delete(&self, conn: &mut DbConnection, incident_id: &str) -> Result<bool, diesel::result::Error> {
        use schema::incidents::dsl::*;

        let deleted_rows = diesel::delete(incidents.filter(id.eq(incident_id)))
            .execute(conn)?;

        Ok(deleted_rows > 0)
    }

    async fn list(&self, conn: &mut DbConnection) -> Result<Vec<models::Incident>, diesel::result::Error> {
        use schema::incidents::dsl::*;

        incidents
            .order(created_at.desc())
            .select(models::Incident::as_select())
            .load(conn)
    }

    async fn search(&self, conn: &mut DbConnection, query: &str) -> Result<Vec<models::Incident>, diesel::result::Error> {
        use schema::incidents::dsl::*;

        incidents
            .filter(title.ilike(format!("%{}%", query)))
            .or_filter(description.ilike(format!("%{}%", query)))
            .order(created_at.desc())
            .select(models::Incident::as_select())
            .load(conn)
    }
}

/// Alert database operations
#[cfg(feature = "diesel-orm")]
pub struct AlertRepository;

#[cfg(feature = "diesel-orm")]
#[async_trait::async_trait]
impl DatabaseOperations<models::Alert> for AlertRepository {
    async fn create(&self, conn: &mut DbConnection, item: &models::Alert) -> Result<models::Alert, diesel::result::Error> {
        use schema::alerts::dsl::*;

        let new_alert = models::NewAlert {
            id: &item.id,
            rule_id: &item.rule_id,
            title: &item.title,
            description: &item.description,
            severity: &item.severity,
            status: &item.status,
            triggered_at: item.triggered_at,
            last_updated: item.last_updated,
            acknowledged: item.acknowledged,
            event_details: item.event_details.clone(),
            assigned_to: item.assigned_to.as_deref(),
            tags: &item.tags,
            escalation_level: item.escalation_level,
            response_actions: &item.response_actions,
            metadata: item.metadata.clone(),
        };

        diesel::insert_into(alerts)
            .values(&new_alert)
            .get_result(conn)
    }

    async fn find_by_id(&self, conn: &mut DbConnection, alert_id: &str) -> Result<Option<models::Alert>, diesel::result::Error> {
        use schema::alerts::dsl::*;

        alerts
            .filter(id.eq(alert_id))
            .select(models::Alert::as_select())
            .first(conn)
            .optional()
    }

    async fn update(&self, conn: &mut DbConnection, alert_id: &str, item: &models::Alert) -> Result<models::Alert, diesel::result::Error> {
        use schema::alerts::dsl::*;

        diesel::update(alerts.filter(id.eq(alert_id)))
            .set((
                rule_id.eq(&item.rule_id),
                title.eq(&item.title),
                description.eq(&item.description),
                severity.eq(&item.severity),
                status.eq(&item.status),
                last_updated.eq(item.last_updated),
                acknowledged.eq(item.acknowledged),
                event_details.eq(&item.event_details),
                assigned_to.eq(&item.assigned_to),
                tags.eq(&item.tags),
                escalation_level.eq(item.escalation_level),
                response_actions.eq(&item.response_actions),
                metadata.eq(&item.metadata),
            ))
            .get_result(conn)
    }

    async fn delete(&self, conn: &mut DbConnection, alert_id: &str) -> Result<bool, diesel::result::Error> {
        use schema::alerts::dsl::*;

        let deleted_rows = diesel::delete(alerts.filter(id.eq(alert_id)))
            .execute(conn)?;

        Ok(deleted_rows > 0)
    }

    async fn list(&self, conn: &mut DbConnection) -> Result<Vec<models::Alert>, diesel::result::Error> {
        use schema::alerts::dsl::*;

        alerts
            .filter(status.ne("resolved"))
            .order(triggered_at.desc())
            .select(models::Alert::as_select())
            .load(conn)
    }

    async fn search(&self, conn: &mut DbConnection, query: &str) -> Result<Vec<models::Alert>, diesel::result::Error> {
        use schema::alerts::dsl::*;

        alerts
            .filter(title.ilike(format!("%{}%", query)))
            .or_filter(description.ilike(format!("%{}%", query)))
            .order(triggered_at.desc())
            .select(models::Alert::as_select())
            .load(conn)
    }
}

/// Database service for high-level operations
#[cfg(feature = "diesel-orm")]
pub struct DatabaseService {
    pub threat_actors: ThreatActorRepository,
    pub incidents: IncidentRepository,
    pub alerts: AlertRepository,
}

#[cfg(feature = "diesel-orm")]
impl DatabaseService {
    /// Create a new database service
    pub fn new() -> Self {
        Self {
            threat_actors: ThreatActorRepository,
            incidents: IncidentRepository,
            alerts: AlertRepository,
        }
    }

    /// Get threat actor statistics
    pub async fn get_threat_actor_stats(&self, conn: &mut DbConnection) -> Result<serde_json::Value, diesel::result::Error> {
        use schema::threat_actors::dsl::*;

        let total_count = threat_actors.count().get_result::<i64>(conn)?;
        let active_count = threat_actors
            .filter(last_seen.gt(Utc::now() - chrono::Duration::days(30)))
            .count()
            .get_result::<i64>(conn)?;

        Ok(serde_json::json!({
            "total_threat_actors": total_count,
            "active_threat_actors": active_count,
            "inactive_threat_actors": total_count - active_count
        }))
    }

    /// Get incident statistics
    pub async fn get_incident_stats(&self, conn: &mut DbConnection) -> Result<serde_json::Value, diesel::result::Error> {
        use schema::incidents::dsl::*;

        let total_count = incidents.count().get_result::<i64>(conn)?;
        let open_count = incidents
            .filter(status.ne("resolved"))
            .count()
            .get_result::<i64>(conn)?;

        Ok(serde_json::json!({
            "total_incidents": total_count,
            "open_incidents": open_count,
            "resolved_incidents": total_count - open_count
        }))
    }

    /// Get alert statistics
    pub async fn get_alert_stats(&self, conn: &mut DbConnection) -> Result<serde_json::Value, diesel::result::Error> {
        use schema::alerts::dsl::*;

        let total_count = alerts.count().get_result::<i64>(conn)?;
        let critical_count = alerts
            .filter(severity.eq("critical"))
            .count()
            .get_result::<i64>(conn)?;

        Ok(serde_json::json!({
            "total_alerts": total_count,
            "critical_alerts": critical_count,
            "non_critical_alerts": total_count - critical_count
        }))
    }
}

#[cfg(not(feature = "diesel-orm"))]
/// Stub implementation when diesel-orm feature is not enabled
pub struct DatabaseManager {
    pub database_url: String,
}

#[cfg(not(feature = "diesel-orm"))]
impl DatabaseManager {
    pub fn new(database_url: String) -> Self {
        Self { database_url }
    }

    pub fn connect(&self) -> Result<(), Box<dyn std::error::Error>> {
        Err("Diesel ORM feature not enabled. Use --features diesel-orm to enable.".into())
    }

    pub fn run_migrations(&self) -> Result<(), Box<dyn std::error::Error>> {
        Err("Diesel ORM feature not enabled. Use --features diesel-orm to enable.".into())
    }
}

#[cfg(not(feature = "diesel-orm"))]
pub struct DatabaseService;

#[cfg(not(feature = "diesel-orm"))]
impl DatabaseService {
    pub fn new() -> Self {
        Self
    }

    pub async fn get_threat_actor_stats(&self, _conn: &mut ()) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        Err("Diesel ORM feature not enabled. Use --features diesel-orm to enable.".into())
    }

    pub async fn get_incident_stats(&self, _conn: &mut ()) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        Err("Diesel ORM feature not enabled. Use --features diesel-orm to enable.".into())
    }

    pub async fn get_alert_stats(&self, _conn: &mut ()) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        Err("Diesel ORM feature not enabled. Use --features diesel-orm to enable.".into())
    }
}
