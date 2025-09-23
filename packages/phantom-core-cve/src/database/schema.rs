//! Database Schema
//! 
//! Diesel table definitions for CVE data storage

#[cfg(feature = "diesel")]
use diesel::prelude::*;

#[cfg(feature = "diesel")]
diesel::table! {
    cves (id) {
        id -> Varchar,
        cve_id -> Varchar,
        description -> Text,
        published_date -> Nullable<Timestamp>,
        last_modified -> Nullable<Timestamp>,
        base_score -> Nullable<Float>,
        severity -> Nullable<Varchar>,
        attack_vector -> Nullable<Varchar>,
        attack_complexity -> Nullable<Varchar>,
        privileges_required -> Nullable<Varchar>,
        user_interaction -> Nullable<Varchar>,
        scope -> Nullable<Varchar>,
        confidentiality_impact -> Nullable<Varchar>,
        integrity_impact -> Nullable<Varchar>,
        availability_impact -> Nullable<Varchar>,
        temporal_score -> Nullable<Float>,
        environmental_score -> Nullable<Float>,
        references -> Nullable<Text>,
        configurations -> Nullable<Text>,
        weaknesses -> Nullable<Text>,
        tenant_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    exploit_timelines (id) {
        id -> Varchar,
        cve_id -> Varchar,
        disclosure_date -> Timestamp,
        first_exploit_date -> Nullable<Timestamp>,
        weaponization_date -> Nullable<Timestamp>,
        mass_exploitation_date -> Nullable<Timestamp>,
        patch_available_date -> Nullable<Timestamp>,
        exploitation_stages -> Text,
        risk_progression -> Text,
        tenant_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    remediation_strategies (id) {
        id -> Varchar,
        cve_id -> Varchar,
        priority -> Varchar,
        immediate_actions -> Text,
        short_term_actions -> Text,
        long_term_actions -> Text,
        compensating_controls -> Text,
        estimated_effort -> Text,
        tenant_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    vulnerability_assessments (id) {
        id -> Varchar,
        cve_id -> Varchar,
        exploitability -> Float,
        impact_score -> Float,
        risk_level -> Varchar,
        affected_systems -> Text,
        remediation_priority -> Integer,
        exploit_available -> Bool,
        public_exploits -> Bool,
        in_the_wild -> Bool,
        recommendations -> Text,
        mitigation_steps -> Text,
        tenant_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    threat_actors (id) {
        id -> Varchar,
        name -> Varchar,
        actor_type -> Varchar,
        sophistication_level -> Varchar,
        known_ttps -> Text,
        target_sectors -> Text,
        geographic_focus -> Text,
        active_since -> Nullable<Timestamp>,
        last_activity -> Nullable<Timestamp>,
        tenant_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    campaigns (id) {
        id -> Varchar,
        name -> Varchar,
        description -> Text,
        campaign_type -> Varchar,
        start_date -> Nullable<Timestamp>,
        end_date -> Nullable<Timestamp>,
        attributed_actors -> Text,
        target_industries -> Text,
        target_countries -> Text,
        techniques_used -> Text,
        associated_cves -> Text,
        tenant_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    cve_analysis_results (id) {
        id -> Varchar,
        cve_id -> Varchar,
        cve_data -> Text,
        assessment_data -> Text,
        processing_timestamp -> Timestamp,
        related_cves -> Text,
        threat_actors -> Text,
        campaigns -> Text,
        tenant_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    data_store_metrics (id) {
        id -> Varchar,
        tenant_id -> Varchar,
        total_cves -> Integer,
        total_exploits -> Integer,
        total_remediations -> Integer,
        storage_size_bytes -> BigInt,
        last_updated -> Timestamp,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    tenants (id) {
        id -> Varchar,
        tenant_id -> Varchar,
        name -> Varchar,
        description -> Nullable<Text>,
        settings -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel")]
diesel::table! {
    users (id) {
        id -> Varchar,
        user_id -> Varchar,
        tenant_id -> Varchar,
        email -> Nullable<Varchar>,
        permissions -> Text,
        last_login -> Nullable<Timestamp>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

// Define foreign key relationships
#[cfg(feature = "diesel")]
diesel::joinable!(exploit_timelines -> cves (cve_id));
#[cfg(feature = "diesel")]
diesel::joinable!(remediation_strategies -> cves (cve_id));
#[cfg(feature = "diesel")]
diesel::joinable!(vulnerability_assessments -> cves (cve_id));
#[cfg(feature = "diesel")]
diesel::joinable!(cve_analysis_results -> cves (cve_id));
#[cfg(feature = "diesel")]
diesel::joinable!(users -> tenants (tenant_id));

#[cfg(feature = "diesel")]
diesel::allow_tables_to_appear_in_same_query!(
    cves,
    exploit_timelines,
    remediation_strategies,
    vulnerability_assessments,
    threat_actors,
    campaigns,
    cve_analysis_results,
    data_store_metrics,
    tenants,
    users,
);

/// Database indexes for performance
#[cfg(feature = "diesel")]
pub const CREATE_INDEXES: &[&str] = &[
    "CREATE INDEX IF NOT EXISTS idx_cves_cve_id ON cves(cve_id);",
    "CREATE INDEX IF NOT EXISTS idx_cves_tenant_id ON cves(tenant_id);",
    "CREATE INDEX IF NOT EXISTS idx_cves_severity ON cves(severity);",
    "CREATE INDEX IF NOT EXISTS idx_cves_published_date ON cves(published_date);",
    "CREATE INDEX IF NOT EXISTS idx_exploit_timelines_cve_id ON exploit_timelines(cve_id);",
    "CREATE INDEX IF NOT EXISTS idx_exploit_timelines_tenant_id ON exploit_timelines(tenant_id);",
    "CREATE INDEX IF NOT EXISTS idx_remediation_strategies_cve_id ON remediation_strategies(cve_id);",
    "CREATE INDEX IF NOT EXISTS idx_remediation_strategies_tenant_id ON remediation_strategies(tenant_id);",
    "CREATE INDEX IF NOT EXISTS idx_vulnerability_assessments_cve_id ON vulnerability_assessments(cve_id);",
    "CREATE INDEX IF NOT EXISTS idx_vulnerability_assessments_tenant_id ON vulnerability_assessments(tenant_id);",
    "CREATE INDEX IF NOT EXISTS idx_vulnerability_assessments_risk_level ON vulnerability_assessments(risk_level);",
    "CREATE INDEX IF NOT EXISTS idx_threat_actors_tenant_id ON threat_actors(tenant_id);",
    "CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);",
    "CREATE INDEX IF NOT EXISTS idx_cve_analysis_results_cve_id ON cve_analysis_results(cve_id);",
    "CREATE INDEX IF NOT EXISTS idx_cve_analysis_results_tenant_id ON cve_analysis_results(tenant_id);",
    "CREATE INDEX IF NOT EXISTS idx_data_store_metrics_tenant_id ON data_store_metrics(tenant_id);",
    "CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);",
];

#[cfg(test)]
#[cfg(feature = "diesel")]
mod tests {
    use super::*;
    
    #[test]
    fn test_schema_compilation() {
        // This test ensures the schema compiles correctly
        // In a real application; you would test actual database operations
        assert_eq!(CREATE_INDEXES.len(), 18);
    }
}