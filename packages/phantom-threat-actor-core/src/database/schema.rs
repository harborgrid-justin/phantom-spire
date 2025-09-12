//! Database schema definitions for Diesel ORM

#[cfg(feature = "diesel-orm")]
use diesel::prelude::*;
#[cfg(feature = "diesel-orm")]
use chrono::{DateTime, Utc};

#[cfg(feature = "diesel-orm")]
table! {
    threat_actors (id) {
        id -> Text,
        name -> Nullable<Text>,
        aliases -> Array<Text>,
        description -> Nullable<Text>,
        first_seen -> Nullable<Timestamptz>,
        last_seen -> Nullable<Timestamptz>,
        actor_type -> Nullable<Text>,
        campaigns -> Array<Text>,
        malware -> Array<Text>,
        techniques -> Array<Text>,
        confidence -> Nullable<Double>,
        attribution_source -> Nullable<Text>,
        attributes -> Nullable<Jsonb>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

#[cfg(feature = "diesel-orm")]
table! {
    incidents (id) {
        id -> Text,
        title -> Text,
        description -> Text,
        severity -> Text,
        status -> Text,
        priority -> Text,
        assigned_to -> Nullable<Text>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        resolved_at -> Nullable<Timestamptz>,
        affected_assets -> Array<Text>,
        threat_actors -> Array<Text>,
        tags -> Array<Text>,
        metadata -> Nullable<Jsonb>,
    }
}

#[cfg(feature = "diesel-orm")]
table! {
    alerts (id) {
        id -> Text,
        rule_id -> Text,
        title -> Text,
        description -> Text,
        severity -> Text,
        status -> Text,
        triggered_at -> Timestamptz,
        last_updated -> Timestamptz,
        acknowledged -> Bool,
        event_details -> Jsonb,
        assigned_to -> Nullable<Text>,
        tags -> Array<Text>,
        escalation_level -> Integer,
        response_actions -> Array<Jsonb>,
        metadata -> Nullable<Jsonb>,
    }
}

#[cfg(feature = "diesel-orm")]
table! {
    behavioral_patterns (id) {
        id -> Text,
        pattern_id -> Text,
        pattern_type -> Text,
        pattern_name -> Text,
        description -> Text,
        confidence -> Float,
        frequency -> Integer,
        first_observed -> Timestamp,
        last_observed -> Timestamp,
        indicators -> Array<Text>,
        related_activities -> Array<Text>,
        threat_actor_id -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

#[cfg(feature = "diesel-orm")]
table! {
    geographic_locations (id) {
        id -> Text,
        location_id -> Text,
        coordinates_lat -> Float,
        coordinates_lng -> Float,
        country -> Text,
        region -> Text,
        city -> Text,
        timezone -> Text,
        threat_activities -> Array<Text>,
        risk_score -> Float,
        last_activity -> Timestamp,
        activity_count -> Integer,
        associated_threat_actors -> Array<Text>,
        infrastructure -> Array<Text>,
        recorded_at -> Timestamp,
    }
}

#[cfg(feature = "diesel-orm")]
table! {
    intelligence_reports (id) {
        id -> Text,
        report_id -> Text,
        title -> Text,
        content -> Text,
        threat_actor -> Nullable<Text>,
        confidence -> Float,
        indicators -> Array<Text>,
        recommendations -> Array<Text>,
        source -> Text,
        published_at -> Timestamp,
        created_at -> Timestamp,
        tags -> Array<Text>,
        metadata -> Nullable<Jsonb>,
    }
}

#[cfg(feature = "diesel-orm")]
table! {
    risk_assessments (id) {
        id -> Text,
        assessment_id -> Text,
        target_entity -> Text,
        assessment_type -> Text,
        risk_scores -> Jsonb,
        impact_analysis -> Jsonb,
        mitigation_plan -> Jsonb,
        overall_risk_level -> Text,
        status -> Text,
        created_at -> Timestamp,
        completed_at -> Nullable<Timestamp>,
        assessed_by -> Text,
        review_required -> Bool,
        context_data -> Nullable<Jsonb>,
    }
}
