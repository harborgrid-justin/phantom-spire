-- MySQL initialization script for Phantom Spire CTI Platform
-- This script creates the database schema, tables, indexes, and initial data

SELECT 'Initializing Phantom Spire MySQL database...' AS Message;

-- Use the phantom_spire database
USE phantom_spire;

-- Set SQL modes for strict data integrity
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- ==============================================================================
-- THREAT INTELLIGENCE TABLES
-- ==============================================================================

CREATE TABLE threat_feeds (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL UNIQUE,
    feed_type ENUM('rss', 'json', 'xml', 'csv', 'stix') NOT NULL,
    url TEXT,
    polling_interval INT DEFAULT 3600,
    last_poll_time TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    parser_config JSON,
    authentication JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_threat_feeds_active (is_active),
    INDEX idx_threat_feeds_type (feed_type),
    INDEX idx_threat_feeds_last_poll (last_poll_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE threat_indicators (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    feed_id CHAR(36),
    indicator_type ENUM('ip', 'domain', 'url', 'hash', 'email', 'file', 'registry') NOT NULL,
    indicator_value TEXT NOT NULL,
    confidence_score TINYINT UNSIGNED DEFAULT 50 CHECK (confidence_score <= 100),
    threat_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    tags JSON,
    context JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (feed_id) REFERENCES threat_feeds(id) ON DELETE SET NULL,
    INDEX idx_threat_indicators_type_value (indicator_type, indicator_value(255)),
    INDEX idx_threat_indicators_level (threat_level),
    INDEX idx_threat_indicators_confidence (confidence_score DESC),
    INDEX idx_threat_indicators_first_seen (first_seen),
    INDEX idx_threat_indicators_active (is_active),
    FULLTEXT idx_threat_indicators_value_fulltext (indicator_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE threat_campaigns (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    attribution JSON,
    start_date DATE,
    end_date DATE,
    confidence_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    threat_actors JSON,
    tactics JSON,
    techniques JSON,
    indicators JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_threat_campaigns_name (name),
    INDEX idx_threat_campaigns_dates (start_date, end_date),
    INDEX idx_threat_campaigns_confidence (confidence_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- ANALYTICS AND REPORTING TABLES
-- ==============================================================================

CREATE TABLE analytics_reports (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    report_name VARCHAR(255) NOT NULL,
    report_type ENUM('daily', 'weekly', 'monthly', 'custom', 'incident') NOT NULL,
    parameters JSON,
    generated_data LONGTEXT,
    format ENUM('json', 'csv', 'pdf', 'html') DEFAULT 'json',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by CHAR(36),
    file_path VARCHAR(500),
    file_size BIGINT UNSIGNED,
    retention_days INT DEFAULT 90,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_analytics_reports_type (report_type),
    INDEX idx_analytics_reports_generated_at (generated_at DESC),
    INDEX idx_analytics_reports_generated_by (generated_by),
    INDEX idx_analytics_reports_archived (is_archived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE trend_analysis (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    analysis_type ENUM('indicator_trends', 'threat_actor_activity', 'campaign_evolution', 'geographic_distribution') NOT NULL,
    time_period ENUM('hourly', 'daily', 'weekly', 'monthly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    data_points JSON NOT NULL,
    statistical_summary JSON,
    anomalies_detected JSON,
    confidence_metrics JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_trend_analysis_type (analysis_type),
    INDEX idx_trend_analysis_period (time_period),
    INDEX idx_trend_analysis_dates (start_date, end_date),
    INDEX idx_trend_analysis_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DATA QUALITY AND GOVERNANCE TABLES
-- ==============================================================================

CREATE TABLE data_quality_metrics (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    source_table VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,4),
    threshold_min DECIMAL(10,4),
    threshold_max DECIMAL(10,4),
    is_passing BOOLEAN,
    measurement_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSON,
    
    INDEX idx_data_quality_table (source_table),
    INDEX idx_data_quality_metric (metric_name),
    INDEX idx_data_quality_timestamp (measurement_timestamp DESC),
    INDEX idx_data_quality_passing (is_passing)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE data_lineage (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    source_system VARCHAR(100) NOT NULL,
    source_table VARCHAR(100),
    source_record_id VARCHAR(255),
    transformation_type ENUM('extract', 'transform', 'load', 'enrich', 'validate', 'aggregate') NOT NULL,
    destination_system VARCHAR(100),
    destination_table VARCHAR(100),
    destination_record_id VARCHAR(255),
    transformation_details JSON,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_duration_ms INT UNSIGNED,
    
    INDEX idx_data_lineage_source (source_system, source_table),
    INDEX idx_data_lineage_destination (destination_system, destination_table),
    INDEX idx_data_lineage_type (transformation_type),
    INDEX idx_data_lineage_processed (processed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SYSTEM MONITORING TABLES
-- ==============================================================================

CREATE TABLE system_performance (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    component VARCHAR(100) NOT NULL,
    metric_type ENUM('cpu', 'memory', 'disk', 'network', 'database', 'custom') NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6),
    unit VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    
    INDEX idx_system_performance_component (component),
    INDEX idx_system_performance_metric (metric_type, metric_name),
    INDEX idx_system_performance_timestamp (timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE error_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    service_name VARCHAR(100) NOT NULL,
    error_level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL') DEFAULT 'ERROR',
    error_message TEXT NOT NULL,
    error_code VARCHAR(50),
    stack_trace LONGTEXT,
    request_id VARCHAR(255),
    user_id CHAR(36),
    context JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    
    INDEX idx_error_logs_service (service_name),
    INDEX idx_error_logs_level (error_level),
    INDEX idx_error_logs_timestamp (timestamp DESC),
    INDEX idx_error_logs_resolved (resolved),
    INDEX idx_error_logs_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- INSERT INITIAL DATA
-- ==============================================================================

-- Insert sample threat feeds
INSERT INTO threat_feeds (name, feed_type, url, polling_interval, is_active, parser_config) VALUES
('AlienVault OTX', 'json', 'https://otx.alienvault.com/api/v1/pulses/subscribed', 1800, TRUE, 
 JSON_OBJECT('format', 'otx', 'indicators_path', '$.results[*].indicators[*]')),
('Emerging Threats', 'csv', 'https://rules.emergingthreats.net/blockrules/compromised-ips.txt', 3600, TRUE,
 JSON_OBJECT('format', 'csv', 'delimiter', ',', 'indicator_column', 0)),
('MISP Feed', 'json', 'https://misp.local/events/csv/download', 7200, TRUE,
 JSON_OBJECT('format', 'misp', 'auth_key', 'sample_key'));

-- Insert sample threat campaigns
INSERT INTO threat_campaigns (name, description, confidence_level, tactics, techniques) VALUES
('APT1 Campaign 2024', 'Advanced persistent threat campaign targeting financial institutions', 'high',
 JSON_ARRAY('Initial Access', 'Persistence', 'Privilege Escalation'),
 JSON_ARRAY('Spearphishing Link', 'Valid Accounts', 'Process Injection')),
('Ransomware Campaign Alpha', 'Ransomware deployment via compromised RDP credentials', 'medium',
 JSON_ARRAY('Initial Access', 'Impact'),
 JSON_ARRAY('Remote Desktop Protocol', 'Data Encrypted for Impact'));

-- Insert initial performance baseline
INSERT INTO system_performance (component, metric_type, metric_name, metric_value, unit) VALUES
('mysql', 'database', 'connections', 1, 'count'),
('mysql', 'database', 'queries_per_second', 0, 'qps'),
('mysql', 'database', 'innodb_buffer_pool_size', 134217728, 'bytes'),
('application', 'custom', 'initialization_complete', 1, 'boolean');

-- Insert data quality baseline
INSERT INTO data_quality_metrics (source_table, metric_name, metric_value, threshold_min, threshold_max, is_passing) VALUES
('threat_indicators', 'completeness_percentage', 100.0, 95.0, 100.0, TRUE),
('threat_feeds', 'availability_percentage', 100.0, 99.0, 100.0, TRUE),
('system_performance', 'data_freshness_minutes', 0.0, 0.0, 5.0, TRUE);

SELECT 'Phantom Spire MySQL initialization completed successfully!' AS Message;
SELECT CONCAT('Total tables created: ', COUNT(*)) AS TableCount FROM information_schema.tables WHERE table_schema = 'phantom_spire';