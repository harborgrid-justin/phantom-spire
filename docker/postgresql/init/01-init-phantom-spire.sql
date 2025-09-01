-- PostgreSQL initialization script for Phantom Spire CTI Platform
-- This script creates the database schema, tables, indexes, and initial data

\echo 'Initializing Phantom Spire PostgreSQL database...'

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS threat_intelligence;
CREATE SCHEMA IF NOT EXISTS evidence_management;
CREATE SCHEMA IF NOT EXISTS workflow_engine;
CREATE SCHEMA IF NOT EXISTS system_monitoring;

-- Set search path
SET search_path = threat_intelligence, evidence_management, workflow_engine, system_monitoring, public;

-- ==============================================================================
-- THREAT INTELLIGENCE SCHEMA
-- ==============================================================================

CREATE TABLE threat_intelligence.indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('ip', 'domain', 'url', 'hash', 'email', 'file')),
    value TEXT NOT NULL,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_id UUID,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE threat_intelligence.sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    url TEXT,
    api_key_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE threat_intelligence.relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_indicator_id UUID REFERENCES threat_intelligence.indicators(id) ON DELETE CASCADE,
    target_indicator_id UUID REFERENCES threat_intelligence.indicators(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- EVIDENCE MANAGEMENT SCHEMA
-- ==============================================================================

CREATE TABLE evidence_management.evidence_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    source_system VARCHAR(255),
    file_path TEXT,
    file_hash SHA256,
    file_size BIGINT,
    content_type VARCHAR(100),
    retention_policy JSONB,
    legal_hold BOOLEAN DEFAULT false,
    chain_of_custody JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evidence_management.chain_of_custody (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID REFERENCES evidence_management.evidence_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- WORKFLOW ENGINE SCHEMA
-- ==============================================================================

CREATE TABLE workflow_engine.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_engine.workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflow_engine.workflows(id),
    status VARCHAR(50) CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_engine.workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID REFERENCES workflow_engine.workflow_instances(id) ON DELETE CASCADE,
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- SYSTEM MONITORING SCHEMA
-- ==============================================================================

CREATE TABLE system_monitoring.health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details JSONB,
    response_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_monitoring.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC,
    metric_unit VARCHAR(50),
    tags JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_monitoring.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- CREATE INDEXES
-- ==============================================================================

-- Threat Intelligence indexes
CREATE INDEX idx_indicators_type_value ON threat_intelligence.indicators USING btree (type, value);
CREATE INDEX idx_indicators_severity ON threat_intelligence.indicators USING btree (severity);
CREATE INDEX idx_indicators_confidence ON threat_intelligence.indicators USING btree (confidence DESC);
CREATE INDEX idx_indicators_created_at ON threat_intelligence.indicators USING btree (created_at DESC);
CREATE INDEX idx_indicators_value_trgm ON threat_intelligence.indicators USING gin (value gin_trgm_ops);
CREATE INDEX idx_indicators_tags ON threat_intelligence.indicators USING gin (tags);
CREATE INDEX idx_indicators_metadata ON threat_intelligence.indicators USING gin (metadata);

-- Evidence Management indexes
CREATE INDEX idx_evidence_type ON evidence_management.evidence_items USING btree (type);
CREATE INDEX idx_evidence_source_system ON evidence_management.evidence_items USING btree (source_system);
CREATE INDEX idx_evidence_created_at ON evidence_management.evidence_items USING btree (created_at DESC);
CREATE INDEX idx_evidence_legal_hold ON evidence_management.evidence_items USING btree (legal_hold) WHERE legal_hold = true;
CREATE INDEX idx_custody_evidence_id ON evidence_management.chain_of_custody USING btree (evidence_id);
CREATE INDEX idx_custody_timestamp ON evidence_management.chain_of_custody USING btree (timestamp DESC);

-- Workflow Engine indexes
CREATE INDEX idx_workflows_name ON workflow_engine.workflows USING btree (name);
CREATE INDEX idx_workflows_active ON workflow_engine.workflows USING btree (is_active) WHERE is_active = true;
CREATE INDEX idx_workflow_instances_status ON workflow_engine.workflow_instances USING btree (status);
CREATE INDEX idx_workflow_instances_created_at ON workflow_engine.workflow_instances USING btree (created_at DESC);
CREATE INDEX idx_workflow_steps_instance_id ON workflow_engine.workflow_steps USING btree (instance_id);
CREATE INDEX idx_workflow_steps_status ON workflow_engine.workflow_steps USING btree (status);

-- System Monitoring indexes
CREATE INDEX idx_health_checks_component ON system_monitoring.health_checks USING btree (component);
CREATE INDEX idx_health_checks_timestamp ON system_monitoring.health_checks USING btree (timestamp DESC);
CREATE INDEX idx_health_checks_status ON system_monitoring.health_checks USING btree (status);
CREATE INDEX idx_performance_metrics_name ON system_monitoring.performance_metrics USING btree (metric_name);
CREATE INDEX idx_performance_metrics_timestamp ON system_monitoring.performance_metrics USING btree (timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON system_monitoring.audit_logs USING btree (user_id);
CREATE INDEX idx_audit_logs_action ON system_monitoring.audit_logs USING btree (action);
CREATE INDEX idx_audit_logs_timestamp ON system_monitoring.audit_logs USING btree (timestamp DESC);

-- ==============================================================================
-- INSERT INITIAL DATA
-- ==============================================================================

-- Insert initial threat intelligence sources
INSERT INTO threat_intelligence.sources (name, type, url, is_active, config) VALUES
('MISP Default', 'misp', 'https://misp.local', true, '{"version": "2.4", "authkey": "sample"}'),
('AlienVault OTX', 'otx', 'https://otx.alienvault.com', true, '{"api_version": "v1"}'),
('VirusTotal', 'virustotal', 'https://www.virustotal.com/api/v3', true, '{"rate_limit": 4}'),
('Local Feeds', 'csv', null, true, '{"format": "csv", "delimiter": ","}');

-- Insert sample workflows
INSERT INTO workflow_engine.workflows (name, description, definition, created_by) VALUES
('Indicator Enrichment', 'Enrich indicators with threat intelligence data', 
 '{"steps": [{"name": "validate_indicator", "type": "validation"}, {"name": "enrich_with_sources", "type": "enrichment"}, {"name": "calculate_risk_score", "type": "scoring"}], "triggers": ["new_indicator"]}', 
 uuid_generate_v4()),
('Evidence Processing', 'Process and analyze digital evidence',
 '{"steps": [{"name": "hash_calculation", "type": "forensics"}, {"name": "malware_analysis", "type": "analysis"}, {"name": "generate_report", "type": "reporting"}], "triggers": ["new_evidence"]}',
 uuid_generate_v4());

-- Insert initial health check record
INSERT INTO system_monitoring.health_checks (component, status, details) VALUES
('postgresql', 'healthy', '{"version": "14", "connections": 1, "database_size": "small"}');

\echo 'Phantom Spire PostgreSQL initialization completed successfully!';