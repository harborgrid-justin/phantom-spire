-- Rollback migration for initial schema
-- Drop all database tables and indexes

-- Drop indexes first
DROP INDEX IF EXISTS idx_risk_assessments_risk_level;
DROP INDEX IF EXISTS idx_risk_assessments_status;
DROP INDEX IF EXISTS idx_risk_assessments_type;
DROP INDEX IF EXISTS idx_risk_assessments_target;

DROP INDEX IF EXISTS idx_intelligence_reports_confidence;
DROP INDEX IF EXISTS idx_intelligence_reports_published_at;
DROP INDEX IF EXISTS idx_intelligence_reports_threat_actor;

DROP INDEX IF EXISTS idx_geographic_locations_last_activity;
DROP INDEX IF EXISTS idx_geographic_locations_risk_score;
DROP INDEX IF EXISTS idx_geographic_locations_country;

DROP INDEX IF EXISTS idx_behavioral_patterns_confidence;
DROP INDEX IF EXISTS idx_behavioral_patterns_threat_actor;
DROP INDEX IF EXISTS idx_behavioral_patterns_type;

DROP INDEX IF EXISTS idx_alerts_acknowledged;
DROP INDEX IF EXISTS idx_alerts_triggered_at;
DROP INDEX IF EXISTS idx_alerts_severity;
DROP INDEX IF EXISTS idx_alerts_status;

DROP INDEX IF EXISTS idx_incidents_assigned_to;
DROP INDEX IF EXISTS idx_incidents_created_at;
DROP INDEX IF EXISTS idx_incidents_severity;
DROP INDEX IF EXISTS idx_incidents_status;

DROP INDEX IF EXISTS idx_threat_actors_created_at;
DROP INDEX IF EXISTS idx_threat_actors_last_seen;
DROP INDEX IF EXISTS idx_threat_actors_type;
DROP INDEX IF EXISTS idx_threat_actors_name;

-- Drop tables
DROP TABLE IF EXISTS risk_assessments;
DROP TABLE IF EXISTS intelligence_reports;
DROP TABLE IF EXISTS geographic_locations;
DROP TABLE IF EXISTS behavioral_patterns;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS threat_actors;