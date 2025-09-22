/**
 * SEQUELIZE DATABASE SEEDER
 * Seeds the database with initial data using Sequelize models
 */
import 'server-only';
import { getSequelize } from 'sequelize';
import { Dataset, DatasetColumn, SampleData, Experiment, TrainingHistory, Model, Deployment, MetricsData } from 'models';

/**
 * Seed datasets
 */
async function seedDatasets() {
  console.log('🌱 Seeding datasets...');
  
  const datasetsToSeed = [
    {
      name: 'Customer Churn Analysis',
      rows: 10000,
      columns: 12,
      type: 'Classification',
      uploaded: 'Today'
    },
    {
      name: 'Fraud Detection Dataset',
      rows: 15000,
      columns: 18,
      type: 'Binary Classification',
      uploaded: '2 days ago'
    },
    {
      name: 'Revenue Forecasting',
      rows: 8500,
      columns: 8,
      type: 'Regression',
      uploaded: '1 week ago'
    },
    {
      name: 'Network Traffic Analysis',
      rows: 25000,
      columns: 15,
      type: 'Anomaly Detection',
      uploaded: '3 days ago'
    },
    {
      name: 'Employee Performance',
      rows: 5000,
      columns: 10,
      type: 'Classification',
      uploaded: '5 days ago'
    }
  ];

  for (const datasetData of datasetsToSeed) {
    await Dataset.findOrCreate({
      where: { name: datasetData.name },
      defaults: datasetData
    });
  }
  
  console.log('✅ Datasets seeded');
}

/**
 * Seed dataset columns
 */
async function seedDatasetColumns() {
  console.log('🌱 Seeding dataset columns...');
  
  const datasets = await Dataset.findAll();
  
  for (const dataset of datasets) {
    const columnCount = dataset.columns;
    const columnsToSeed = [];
    
    for (let i = 1; i <= columnCount; i++) {
      const columnTypes = ['string', 'number', 'boolean', 'date'];
      const randomType = columnTypes[Math.floor(Math.random() * columnTypes.length)];
      
      columnsToSeed.push({
        dataset_id: dataset.id,
        name: `column_${i}`,
        type: randomType,
        missing: Math.floor(Math.random() * 100),
        unique_count: Math.floor(Math.random() * 1000) + 1
      });
    }
    
    for (const columnData of columnsToSeed) {
      await DatasetColumn.findOrCreate({
        where: { 
          dataset_id: columnData.dataset_id, 
          name: columnData.name 
        },
        defaults: columnData
      });
    }
  }
  
  console.log('✅ Dataset columns seeded');
}

/**
 * Seed sample data
 */
async function seedSampleData() {
  console.log('🌱 Seeding sample data...');
  
  const datasets = await Dataset.findAll();
  
  for (const dataset of datasets) {
    const sampleCount = Math.min(100, Math.floor(dataset.rows * 0.01)); // 1% sample or max 100
    
    for (let i = 0; i < sampleCount; i++) {
      const sampleData = {
        dataset_id: dataset.id,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last 30 days
        source_ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        destination_ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        port: Math.floor(Math.random() * 65535),
        protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)],
        bytes_sent: Math.floor(Math.random() * 10000),
        is_threat: Math.random() < 0.1 // 10% are threats
      };
      
      await SampleData.findOrCreate({
        where: { 
          dataset_id: sampleData.dataset_id,
          source_ip: sampleData.source_ip,
          destination_ip: sampleData.destination_ip,
          timestamp: sampleData.timestamp
        },
        defaults: sampleData
      });
    }
  }
  
  console.log('✅ Sample data seeded');
}

/**
 * Seed ML models
 */
async function seedModels() {
  console.log('🌱 Seeding ML models...');
  
  const modelsToSeed = [
    // Original 3 models
    {
      name: 'Customer Churn Predictor v2.1',
      type: 'Classification',
      algorithm: 'Random Forest',
      accuracy: 0.94,
      f1_score: 0.89,
      auc: 0.96,
      status: 'Production',
      version: '2.1.0',
      size: '12.5 MB',
      framework: 'phantom-ml-core',
      features: ['customer_tenure', 'monthly_charges', 'total_charges', 'contract_type'],
      metrics: { precision: 0.92, recall: 0.87 },
      security_score: 95,
      performance_score: 88,
      deployments: 3,
      predictions: 15420,
      starred: true
    },
    {
      name: 'Fraud Detection Model',
      type: 'Binary Classification',
      algorithm: 'XGBoost',
      accuracy: 0.98,
      f1_score: 0.97,
      auc: 0.99,
      status: 'Production',
      version: '1.5.2',
      size: '8.2 MB',
      framework: 'phantom-ml-core',
      features: ['transaction_amount', 'merchant_category', 'time_of_day', 'location'],
      metrics: { precision: 0.98, recall: 0.96 },
      security_score: 97,
      performance_score: 92,
      deployments: 2,
      predictions: 8930,
      starred: true
    },
    {
      name: 'Revenue Forecasting Model',
      type: 'Regression',
      algorithm: 'LSTM Neural Network',
      accuracy: 0.91,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Staging',
      version: '1.2.0',
      size: '15.8 MB',
      framework: 'tensorflow',
      features: ['historical_revenue', 'seasonal_trends', 'market_indicators'],
      metrics: { mae: 0.05, rmse: 0.08 },
      security_score: 85,
      performance_score: 90,
      deployments: 1,
      predictions: 245,
      starred: false
    },
    // 30 Additional Models
    {
      name: 'Cybersecurity Threat Detection v3.0',
      type: 'Binary Classification',
      algorithm: 'Deep Neural Network',
      accuracy: 0.97,
      f1_score: 0.95,
      auc: 0.98,
      status: 'Production',
      version: '3.0.1',
      size: '24.8 MB',
      framework: 'tensorflow',
      features: ['packet_size', 'protocol_type', 'connection_duration', 'bytes_transferred', 'port_scan_indicator'],
      metrics: { precision: 0.96, recall: 0.94, specificity: 0.98 },
      security_score: 99,
      performance_score: 93,
      deployments: 5,
      predictions: 48923,
      starred: true
    },
    {
      name: 'Email Spam Classifier Pro',
      type: 'Classification',
      algorithm: 'Support Vector Machine',
      accuracy: 0.96,
      f1_score: 0.94,
      auc: 0.97,
      status: 'Production',
      version: '2.3.4',
      size: '6.8 MB',
      framework: 'scikit-learn',
      features: ['word_count', 'special_chars', 'sender_reputation', 'subject_keywords', 'attachment_type'],
      metrics: { precision: 0.95, recall: 0.93 },
      security_score: 88,
      performance_score: 95,
      deployments: 4,
      predictions: 234567,
      starred: true
    },
    {
      name: 'Predictive Maintenance Engine',
      type: 'Regression',
      algorithm: 'Gradient Boosting',
      accuracy: 0.89,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Production',
      version: '1.8.2',
      size: '11.2 MB',
      framework: 'xgboost',
      features: ['vibration_frequency', 'temperature', 'pressure', 'runtime_hours', 'maintenance_history'],
      metrics: { mae: 0.12, rmse: 0.18, r2: 0.89 },
      security_score: 82,
      performance_score: 87,
      deployments: 3,
      predictions: 12890,
      starred: false
    },
    {
      name: 'Image Recognition - Medical Diagnostics',
      type: 'Classification',
      algorithm: 'Convolutional Neural Network',
      accuracy: 0.93,
      f1_score: 0.91,
      auc: 0.95,
      status: 'Staging',
      version: '4.1.0',
      size: '185.6 MB',
      framework: 'pytorch',
      features: ['pixel_intensity', 'edge_detection', 'texture_analysis', 'shape_features', 'color_histogram'],
      metrics: { precision: 0.92, recall: 0.90, sensitivity: 0.91 },
      security_score: 94,
      performance_score: 78,
      deployments: 1,
      predictions: 4567,
      starred: true
    },
    {
      name: 'Stock Price Prediction AI',
      type: 'Regression',
      algorithm: 'LSTM Neural Network',
      accuracy: 0.84,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Development',
      version: '0.9.3',
      size: '28.4 MB',
      framework: 'tensorflow',
      features: ['historical_prices', 'volume', 'market_sentiment', 'economic_indicators', 'news_sentiment'],
      metrics: { mae: 0.08, rmse: 0.14, directional_accuracy: 0.84 },
      security_score: 76,
      performance_score: 82,
      deployments: 0,
      predictions: 0,
      starred: false
    },
    {
      name: 'Natural Language Sentiment Analyzer',
      type: 'Classification',
      algorithm: 'Transformer Model',
      accuracy: 0.92,
      f1_score: 0.90,
      auc: 0.94,
      status: 'Production',
      version: '2.5.7',
      size: '312.8 MB',
      framework: 'huggingface',
      features: ['word_embeddings', 'attention_weights', 'context_analysis', 'emotion_indicators', 'syntax_patterns'],
      metrics: { precision: 0.91, recall: 0.89, macro_f1: 0.90 },
      security_score: 85,
      performance_score: 74,
      deployments: 6,
      predictions: 89234,
      starred: true
    },
    {
      name: 'Supply Chain Optimization Model',
      type: 'Optimization',
      algorithm: 'Genetic Algorithm',
      accuracy: 0.88,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Production',
      version: '3.2.1',
      size: '19.7 MB',
      framework: 'phantom-ml-core',
      features: ['demand_forecast', 'inventory_levels', 'supplier_reliability', 'transport_costs', 'lead_times'],
      metrics: { cost_reduction: 0.23, efficiency_gain: 0.18 },
      security_score: 79,
      performance_score: 91,
      deployments: 2,
      predictions: 5678,
      starred: false
    },
    {
      name: 'Voice Recognition Assistant',
      type: 'Classification',
      algorithm: 'Recurrent Neural Network',
      accuracy: 0.95,
      f1_score: 0.93,
      auc: 0.96,
      status: 'Production',
      version: '1.7.4',
      size: '67.3 MB',
      framework: 'tensorflow',
      features: ['audio_frequency', 'spectogram_analysis', 'phoneme_detection', 'speaker_characteristics', 'background_noise'],
      metrics: { precision: 0.94, recall: 0.92, word_error_rate: 0.05 },
      security_score: 88,
      performance_score: 86,
      deployments: 8,
      predictions: 156789,
      starred: true
    },
    {
      name: 'Energy Consumption Predictor',
      type: 'Regression',
      algorithm: 'Random Forest',
      accuracy: 0.86,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Staging',
      version: '2.1.8',
      size: '14.6 MB',
      framework: 'scikit-learn',
      features: ['weather_data', 'occupancy_levels', 'time_of_day', 'historical_usage', 'building_characteristics'],
      metrics: { mae: 0.14, rmse: 0.22, mape: 0.12 },
      security_score: 73,
      performance_score: 89,
      deployments: 1,
      predictions: 2345,
      starred: false
    },
    {
      name: 'Autonomous Vehicle Navigation',
      type: 'Reinforcement Learning',
      algorithm: 'Deep Q-Network',
      accuracy: 0.91,
      f1_score: 0.89,
      auc: 0.93,
      status: 'Development',
      version: '0.8.1',
      size: '156.9 MB',
      framework: 'pytorch',
      features: ['lidar_data', 'camera_feed', 'gps_coordinates', 'speed_sensors', 'traffic_conditions'],
      metrics: { collision_avoidance: 0.99, path_efficiency: 0.91 },
      security_score: 96,
      performance_score: 71,
      deployments: 0,
      predictions: 0,
      starred: true
    },
    {
      name: 'Recommendation Engine - E-commerce',
      type: 'Collaborative Filtering',
      algorithm: 'Matrix Factorization',
      accuracy: 0.83,
      f1_score: 0.81,
      auc: 0.87,
      status: 'Production',
      version: '4.3.2',
      size: '45.7 MB',
      framework: 'phantom-ml-core',
      features: ['user_behavior', 'product_features', 'purchase_history', 'ratings', 'demographic_data'],
      metrics: { precision_at_k: 0.78, recall_at_k: 0.85, ndcg: 0.83 },
      security_score: 81,
      performance_score: 92,
      deployments: 12,
      predictions: 987654,
      starred: true
    },
    {
      name: 'Credit Risk Assessment Model',
      type: 'Classification',
      algorithm: 'Logistic Regression',
      accuracy: 0.89,
      f1_score: 0.85,
      auc: 0.91,
      status: 'Production',
      version: '3.5.6',
      size: '5.4 MB',
      framework: 'scikit-learn',
      features: ['credit_score', 'income', 'debt_to_income_ratio', 'employment_history', 'loan_amount'],
      metrics: { precision: 0.87, recall: 0.83, auc_roc: 0.91 },
      security_score: 94,
      performance_score: 96,
      deployments: 7,
      predictions: 45678,
      starred: true
    },
    {
      name: 'Weather Prediction System',
      type: 'Regression',
      algorithm: 'Ensemble Methods',
      accuracy: 0.87,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Production',
      version: '2.8.3',
      size: '33.2 MB',
      framework: 'scikit-learn',
      features: ['atmospheric_pressure', 'humidity', 'wind_speed', 'temperature_history', 'satellite_imagery'],
      metrics: { mae: 2.1, rmse: 3.4, forecast_accuracy: 0.87 },
      security_score: 71,
      performance_score: 88,
      deployments: 3,
      predictions: 78901,
      starred: false
    },
    {
      name: 'Facial Recognition Security System',
      type: 'Classification',
      algorithm: 'Convolutional Neural Network',
      accuracy: 0.98,
      f1_score: 0.97,
      auc: 0.99,
      status: 'Production',
      version: '5.1.2',
      size: '234.5 MB',
      framework: 'pytorch',
      features: ['facial_landmarks', 'skin_texture', 'eye_patterns', 'face_geometry', 'lighting_conditions'],
      metrics: { precision: 0.98, recall: 0.96, false_acceptance_rate: 0.001 },
      security_score: 98,
      performance_score: 83,
      deployments: 15,
      predictions: 234567,
      starred: true
    },
    {
      name: 'Drug Discovery Molecular Predictor',
      type: 'Classification',
      algorithm: 'Graph Neural Network',
      accuracy: 0.85,
      f1_score: 0.82,
      auc: 0.88,
      status: 'Development',
      version: '1.2.4',
      size: '78.9 MB',
      framework: 'pytorch',
      features: ['molecular_structure', 'chemical_properties', 'binding_affinity', 'toxicity_indicators', 'bioavailability'],
      metrics: { precision: 0.84, recall: 0.80, hit_rate: 0.15 },
      security_score: 92,
      performance_score: 76,
      deployments: 0,
      predictions: 0,
      starred: true
    },
    {
      name: 'Social Media Analytics Engine',
      type: 'Classification',
      algorithm: 'Naive Bayes',
      accuracy: 0.79,
      f1_score: 0.76,
      auc: 0.82,
      status: 'Staging',
      version: '2.4.7',
      size: '12.8 MB',
      framework: 'scikit-learn',
      features: ['hashtag_analysis', 'engagement_metrics', 'follower_count', 'post_frequency', 'content_type'],
      metrics: { precision: 0.78, recall: 0.74, viral_prediction: 0.23 },
      security_score: 68,
      performance_score: 94,
      deployments: 2,
      predictions: 67890,
      starred: false
    },
    {
      name: 'Industrial Quality Control Classifier',
      type: 'Classification',
      algorithm: 'Support Vector Machine',
      accuracy: 0.94,
      f1_score: 0.92,
      auc: 0.96,
      status: 'Production',
      version: '3.7.1',
      size: '16.4 MB',
      framework: 'scikit-learn',
      features: ['dimensional_measurements', 'surface_roughness', 'material_density', 'color_consistency', 'weight_variance'],
      metrics: { precision: 0.93, recall: 0.91, defect_detection_rate: 0.96 },
      security_score: 86,
      performance_score: 91,
      deployments: 4,
      predictions: 123456,
      starred: false
    },
    {
      name: 'Traffic Flow Optimization AI',
      type: 'Reinforcement Learning',
      algorithm: 'Policy Gradient',
      accuracy: 0.88,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Staging',
      version: '1.5.3',
      size: '89.7 MB',
      framework: 'tensorflow',
      features: ['vehicle_count', 'traffic_density', 'signal_timing', 'weather_conditions', 'accident_reports'],
      metrics: { congestion_reduction: 0.34, average_wait_time: 0.78 },
      security_score: 77,
      performance_score: 85,
      deployments: 1,
      predictions: 8901,
      starred: false
    },
    {
      name: 'Genomic Sequence Analyzer',
      type: 'Classification',
      algorithm: 'Convolutional Neural Network',
      accuracy: 0.91,
      f1_score: 0.88,
      auc: 0.93,
      status: 'Development',
      version: '2.1.0',
      size: '145.3 MB',
      framework: 'tensorflow',
      features: ['dna_sequences', 'gene_expression', 'protein_coding', 'mutation_patterns', 'regulatory_elements'],
      metrics: { precision: 0.90, recall: 0.86, variant_call_accuracy: 0.94 },
      security_score: 95,
      performance_score: 72,
      deployments: 0,
      predictions: 0,
      starred: true
    },
    {
      name: 'Document Classification System',
      type: 'Classification',
      algorithm: 'Random Forest',
      accuracy: 0.87,
      f1_score: 0.84,
      auc: 0.90,
      status: 'Production',
      version: '2.9.4',
      size: '21.6 MB',
      framework: 'scikit-learn',
      features: ['text_features', 'document_structure', 'metadata', 'file_size', 'creation_date'],
      metrics: { precision: 0.86, recall: 0.82, processing_speed: 0.95 },
      security_score: 83,
      performance_score: 93,
      deployments: 6,
      predictions: 345678,
      starred: false
    },
    {
      name: 'Cryptocurrency Price Predictor',
      type: 'Regression',
      algorithm: 'LSTM Neural Network',
      accuracy: 0.76,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Development',
      version: '1.3.2',
      size: '42.1 MB',
      framework: 'tensorflow',
      features: ['price_history', 'trading_volume', 'market_sentiment', 'social_mentions', 'technical_indicators'],
      metrics: { mae: 0.18, rmse: 0.31, sharpe_ratio: 1.23 },
      security_score: 69,
      performance_score: 79,
      deployments: 0,
      predictions: 0,
      starred: false
    },
    {
      name: 'Smart Home Automation Controller',
      type: 'Reinforcement Learning',
      algorithm: 'Deep Deterministic Policy Gradient',
      accuracy: 0.85,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Staging',
      version: '3.4.1',
      size: '56.8 MB',
      framework: 'pytorch',
      features: ['sensor_data', 'user_preferences', 'energy_consumption', 'time_patterns', 'weather_forecast'],
      metrics: { energy_savings: 0.28, user_satisfaction: 0.89 },
      security_score: 91,
      performance_score: 87,
      deployments: 2,
      predictions: 12345,
      starred: true
    },
    {
      name: 'Language Translation Engine',
      type: 'Sequence-to-Sequence',
      algorithm: 'Transformer Model',
      accuracy: 0.89,
      f1_score: 0.87,
      auc: 0.0,
      status: 'Production',
      version: '4.2.8',
      size: '512.4 MB',
      framework: 'huggingface',
      features: ['source_embeddings', 'attention_mechanisms', 'language_models', 'context_vectors', 'beam_search'],
      metrics: { bleu_score: 0.42, meteor_score: 0.38, human_evaluation: 0.85 },
      security_score: 87,
      performance_score: 68,
      deployments: 9,
      predictions: 567890,
      starred: true
    },
    {
      name: 'Agricultural Crop Yield Predictor',
      type: 'Regression',
      algorithm: 'Gradient Boosting',
      accuracy: 0.82,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Production',
      version: '2.6.3',
      size: '18.9 MB',
      framework: 'xgboost',
      features: ['soil_quality', 'weather_patterns', 'seed_variety', 'fertilizer_usage', 'irrigation_levels'],
      metrics: { mae: 0.16, rmse: 0.24, yield_accuracy: 0.82 },
      security_score: 74,
      performance_score: 90,
      deployments: 3,
      predictions: 23456,
      starred: false
    },
    {
      name: 'Anomaly Detection for IoT Devices',
      type: 'Anomaly Detection',
      algorithm: 'Isolation Forest',
      accuracy: 0.93,
      f1_score: 0.90,
      auc: 0.95,
      status: 'Production',
      version: '1.8.7',
      size: '9.3 MB',
      framework: 'scikit-learn',
      features: ['device_metrics', 'network_traffic', 'power_consumption', 'response_times', 'error_rates'],
      metrics: { precision: 0.92, recall: 0.88, false_positive_rate: 0.02 },
      security_score: 96,
      performance_score: 94,
      deployments: 8,
      predictions: 789012,
      starred: true
    },
    {
      name: 'Sports Performance Analytics',
      type: 'Regression',
      algorithm: 'Neural Network',
      accuracy: 0.78,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Staging',
      version: '1.4.6',
      size: '25.7 MB',
      framework: 'tensorflow',
      features: ['player_stats', 'training_data', 'injury_history', 'game_conditions', 'team_dynamics'],
      metrics: { mae: 0.22, rmse: 0.35, performance_correlation: 0.78 },
      security_score: 71,
      performance_score: 84,
      deployments: 1,
      predictions: 3456,
      starred: false
    },
    {
      name: 'Real Estate Price Estimator',
      type: 'Regression',
      algorithm: 'Random Forest',
      accuracy: 0.91,
      f1_score: 0.0,
      auc: 0.0,
      status: 'Production',
      version: '3.1.5',
      size: '22.4 MB',
      framework: 'scikit-learn',
      features: ['property_size', 'location_score', 'market_trends', 'property_age', 'nearby_amenities'],
      metrics: { mae: 0.09, rmse: 0.13, price_accuracy: 0.91 },
      security_score: 80,
      performance_score: 89,
      deployments: 5,
      predictions: 456789,
      starred: true
    },
    {
      name: 'Network Intrusion Detection System',
      type: 'Binary Classification',
      algorithm: 'Ensemble Methods',
      accuracy: 0.96,
      f1_score: 0.94,
      auc: 0.98,
      status: 'Production',
      version: '4.7.2',
      size: '34.6 MB',
      framework: 'phantom-ml-core',
      features: ['packet_headers', 'connection_patterns', 'payload_analysis', 'timing_features', 'geographical_data'],
      metrics: { precision: 0.95, recall: 0.93, detection_rate: 0.97 },
      security_score: 99,
      performance_score: 91,
      deployments: 11,
      predictions: 1234567,
      starred: true
    },
    {
      name: 'Healthcare Diagnosis Assistant',
      type: 'Classification',
      algorithm: 'Deep Neural Network',
      accuracy: 0.94,
      f1_score: 0.92,
      auc: 0.96,
      status: 'Development',
      version: '2.3.1',
      size: '167.8 MB',
      framework: 'tensorflow',
      features: ['symptom_analysis', 'medical_history', 'lab_results', 'imaging_data', 'vital_signs'],
      metrics: { precision: 0.93, recall: 0.91, diagnostic_accuracy: 0.94 },
      security_score: 97,
      performance_score: 79,
      deployments: 0,
      predictions: 0,
      starred: true
    },
    {
      name: 'Music Recommendation Algorithm',
      type: 'Collaborative Filtering',
      algorithm: 'Deep Learning',
      accuracy: 0.81,
      f1_score: 0.78,
      auc: 0.84,
      status: 'Production',
      version: '2.7.9',
      size: '78.2 MB',
      framework: 'tensorflow',
      features: ['listening_history', 'audio_features', 'user_demographics', 'social_connections', 'playlist_data'],
      metrics: { precision_at_10: 0.76, recall_at_10: 0.82, user_engagement: 0.74 },
      security_score: 73,
      performance_score: 86,
      deployments: 4,
      predictions: 234567,
      starred: false
    }
  ];

  for (const modelData of modelsToSeed) {
    await Model.findOrCreate({
      where: { name: modelData.name },
      defaults: modelData
    });
  }
  
  console.log('✅ ML models seeded');
}

/**
 * Seed experiments
 */
async function seedExperiments() {
  console.log('🌱 Seeding experiments...');
  
  const datasets = await Dataset.findAll();
  const algorithms = ['Random Forest', 'XGBoost', 'Neural Network', 'SVM', 'Logistic Regression'];
  const statuses = ['completed', 'running', 'failed', 'scheduled'];
  
  for (let i = 0; i < 10; i++) {
    if (datasets.length === 0) break;
    
    const randomDataset = datasets[Math.floor(Math.random() * datasets.length)];
    const randomAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const experiment = {
      name: `${randomAlgorithm} Experiment ${i + 1}`,
      status: randomStatus,
      accuracy: randomStatus === 'completed' ? Math.random() * 0.3 + 0.7 : 0,
      f1_score: randomStatus === 'completed' ? Math.random() * 0.3 + 0.7 : 0,
      auc: randomStatus === 'completed' ? Math.random() * 0.3 + 0.7 : 0,
      algorithm: randomAlgorithm,
      dataset: randomDataset!.name,
      duration: randomStatus === 'completed' ? `${Math.floor(Math.random() * 60) + 5} min` : '',
      hyperparameters: {
        learning_rate: Math.random() * 0.01 + 0.001,
        max_depth: Math.floor(Math.random() * 10) + 3,
        n_estimators: Math.floor(Math.random() * 500) + 100
      }
    };
    
    await Experiment.findOrCreate({
      where: { name: experiment.name },
      defaults: experiment
    });
  }
  
  console.log('✅ Experiments seeded');
}

/**
 * Seed training history
 */
async function seedTrainingHistory() {
  console.log('🌱 Seeding training history...');
  
  const experiments = await Experiment.findAll({ where: { status: 'completed' } });
  
  for (const experiment of experiments) {
    const epochCount = Math.floor(Math.random() * 50) + 10;
    
    for (let epoch = 1; epoch <= epochCount; epoch++) {
      const baseAccuracy = experiment.accuracy;
      const baseLoss = 1 - baseAccuracy;
      
      const trainingHistory = {
        experiment_id: experiment.id,
        epoch,
        training_loss: Math.max(0.01, baseLoss + Math.random() * 0.5 - epoch * 0.01),
        validation_loss: Math.max(0.01, baseLoss + Math.random() * 0.3 - epoch * 0.008),
        accuracy: Math.min(0.99, Math.max(0.1, baseAccuracy - 0.2 + epoch * 0.01))
      };
      
      await TrainingHistory.findOrCreate({
        where: {
          experiment_id: trainingHistory.experiment_id,
          epoch: trainingHistory.epoch
        },
        defaults: trainingHistory
      });
    }
  }
  
  console.log('✅ Training history seeded');
}

/**
 * Seed deployments
 */
async function seedDeployments() {
  console.log('🌱 Seeding deployments...');
  
  const models = await Model.findAll();
  const environments = ['production', 'staging', 'development'];
  const statuses = ['running', 'stopped', 'scaling', 'error'];
  const healthStatuses = ['healthy', 'degraded', 'critical'];
  
  for (const model of models) {
    for (let i = 0; i < model.deployments; i++) {
      const randomEnv = environments[Math.floor(Math.random() * environments.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomHealth = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
      
      const deployment = {
        name: `${model.name} - ${randomEnv}`,
        model_name: model.name,
        model_version: model.version,
        status: randomStatus,
        environment: randomEnv,
        endpoint: `https://api.phantom-ml.com/v1/models/${model.name.toLowerCase().replace(/\s+/g, '-')}`,
        instances: Math.floor(Math.random() * 5) + 1,
        cpu: Math.random() * 2 + 0.5,
        memory: Math.random() * 4 + 1,
        requests_per_minute: Math.floor(Math.random() * 1000) + 100,
        total_requests: Math.floor(Math.random() * 10000) + 1000,
        uptime: `${Math.floor(Math.random() * 100)}%`,
        avg_response_time: Math.floor(Math.random() * 200) + 50,
        error_rate: Math.random() * 5,
        deployed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        health: randomHealth,
        auto_scaling: Math.random() < 0.5,
        min_instances: 1,
        max_instances: Math.floor(Math.random() * 10) + 3
      };
      
      await Deployment.findOrCreate({
        where: {
          name: deployment.name,
          model_name: deployment.model_name
        },
        defaults: deployment
      });
    }
  }
  
  console.log('✅ Deployments seeded');
}

/**
 * Seed metrics data
 */
async function seedMetricsData() {
  console.log('🌱 Seeding metrics data...');
  
  const deployments = await Deployment.findAll();
  
  for (const deployment of deployments) {
    // Generate 24 hours of metrics (one per hour)
    for (let hour = 0; hour < 24; hour++) {
      const time = String(hour).padStart(2, '0') + ':00';
      const baseRequests = deployment.requests_per_minute;
      
      const metricsData = {
        deployment_id: deployment.id,
        time,
        requests: Math.floor(baseRequests + Math.random() * 200 - 100),
        response_time: deployment.avg_response_time + Math.floor(Math.random() * 100 - 50),
        errors: Math.floor(Math.random() * 20)
      };
      
      await MetricsData.findOrCreate({
        where: {
          deployment_id: metricsData.deployment_id,
          time: metricsData.time
        },
        defaults: metricsData
      });
    }
  }
  
  console.log('✅ Metrics data seeded');
}

/**
 * Main seed function
 */
export async function seedSequelizeDatabase() {
  try {
    console.log('🌱 Starting Sequelize database seeding...');
    
    // Initialize database connection
    await getSequelize();
    
    // Seed data in order (respecting foreign key constraints)
    await seedDatasets();
    await seedDatasetColumns();
    await seedSampleData();
    await seedModels();
    await seedExperiments();
    await seedTrainingHistory();
    await seedDeployments();
    await seedMetricsData();
    
    console.log('✅ Sequelize database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Run seeder if called directly
 */
if (require.main === module) {
  seedSequelizeDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
