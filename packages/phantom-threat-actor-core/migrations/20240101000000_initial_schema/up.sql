-- Initial schema migration for phantom-threat-actor-core
-- Create all database tables

-- Threat actors table
CREATE TABLE threat_actors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    aliases TEXT[] DEFAULT '{}',
    description TEXT,
    first_seen TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE,
    actor_type VARCHAR(100),
    campaigns TEXT[] DEFAULT '{}',
    malware TEXT[] DEFAULT '{}',
    techniques TEXT[] DEFAULT '{}',
    confidence DOUBLE PRECISION DEFAULT 0.8,
    attribution_source VARCHAR(255),
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Incidents table
CREATE TABLE incidents (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    affected_assets TEXT[] DEFAULT '{}',
    threat_actors TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB
);

-- Alerts table
CREATE TABLE alerts (
    id VARCHAR(36) PRIMARY KEY,
    rule_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    event_details JSONB NOT NULL DEFAULT '{}',
    assigned_to VARCHAR(255),
    tags TEXT[] DEFAULT '{}',
    escalation_level INTEGER NOT NULL DEFAULT 0,
    response_actions JSONB[] DEFAULT '{}',
    metadata JSONB
);

-- Behavioral patterns table
CREATE TABLE behavioral_patterns (
    id VARCHAR(36) PRIMARY KEY,
    pattern_id VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(100) NOT NULL,
    pattern_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    frequency INTEGER NOT NULL DEFAULT 1,
    first_observed TIMESTAMP WITH TIME ZONE NOT NULL,
    last_observed TIMESTAMP WITH TIME ZONE NOT NULL,
    indicators TEXT[] DEFAULT '{}',
    related_activities TEXT[] DEFAULT '{}',
    threat_actor_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (threat_actor_id) REFERENCES threat_actors(id) ON DELETE SET NULL
);

-- Geographic locations table
CREATE TABLE geographic_locations (
    id VARCHAR(36) PRIMARY KEY,
    location_id VARCHAR(255) NOT NULL,
    coordinates_lat DOUBLE PRECISION NOT NULL,
    coordinates_lng DOUBLE PRECISION NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    timezone VARCHAR(100) NOT NULL,
    threat_activities TEXT[] DEFAULT '{}',
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
    activity_count INTEGER NOT NULL DEFAULT 0,
    associated_threat_actors TEXT[] DEFAULT '{}',
    infrastructure TEXT[] DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Intelligence reports table
CREATE TABLE intelligence_reports (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    threat_actor VARCHAR(255),
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    indicators TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    source VARCHAR(255) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB
);

-- Risk assessments table
CREATE TABLE risk_assessments (
    id VARCHAR(36) PRIMARY KEY,
    assessment_id VARCHAR(255) NOT NULL,
    target_entity VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(100) NOT NULL,
    risk_scores JSONB NOT NULL DEFAULT '{}',
    impact_analysis JSONB NOT NULL DEFAULT '{}',
    mitigation_plan JSONB NOT NULL DEFAULT '{}',
    overall_risk_level VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    assessed_by VARCHAR(255) NOT NULL,
    review_required BOOLEAN NOT NULL DEFAULT FALSE,
    context_data JSONB
);

-- Create indexes for better query performance
CREATE INDEX idx_threat_actors_name ON threat_actors(name);
CREATE INDEX idx_threat_actors_type ON threat_actors(actor_type);
CREATE INDEX idx_threat_actors_last_seen ON threat_actors(last_seen);
CREATE INDEX idx_threat_actors_created_at ON threat_actors(created_at);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);

CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);

CREATE INDEX idx_behavioral_patterns_type ON behavioral_patterns(pattern_type);
CREATE INDEX idx_behavioral_patterns_threat_actor ON behavioral_patterns(threat_actor_id);
CREATE INDEX idx_behavioral_patterns_confidence ON behavioral_patterns(confidence);

CREATE INDEX idx_geographic_locations_country ON geographic_locations(country);
CREATE INDEX idx_geographic_locations_risk_score ON geographic_locations(risk_score);
CREATE INDEX idx_geographic_locations_last_activity ON geographic_locations(last_activity);

CREATE INDEX idx_intelligence_reports_threat_actor ON intelligence_reports(threat_actor);
CREATE INDEX idx_intelligence_reports_published_at ON intelligence_reports(published_at);
CREATE INDEX idx_intelligence_reports_confidence ON intelligence_reports(confidence);

CREATE INDEX idx_risk_assessments_target ON risk_assessments(target_entity);
CREATE INDEX idx_risk_assessments_type ON risk_assessments(assessment_type);
CREATE INDEX idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(overall_risk_level);