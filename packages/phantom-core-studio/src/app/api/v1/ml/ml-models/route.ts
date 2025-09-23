/**
 * API Route: /api/ml-models
 * Machine Learning model lifecycle management
 */
import { NextRequest, NextResponse } from 'next/server';
import { Experiment } from '../../../../../lib/database/models/Experiment.model';
import { initializeCompleteDatabase } from '../../../../../lib/database/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/ml-models:
 *   get:
 *     summary: List all ML models
 *     description: Retrieve a paginated list of machine learning models with filtering
 *     tags:
 *       - Models
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: model_type
 *         schema:
 *           type: string
 *           enum: [classification, regression, clustering, anomaly_detection, time_series, neural_network, ensemble]
 *         description: Filter by model type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [training, trained, deployed, archived, failed]
 *         description: Filter by model status
 *       - in: query
 *         name: framework
 *         schema:
 *           type: string
 *           enum: [scikit-learn, tensorflow, pytorch, xgboost, lightgbm, h2o, custom]
 *         description: Filter by ML framework
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by model name or description
 *     responses:
 *       200:
 *         description: List of ML models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MLModel'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 count:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/400'
 *       500:
 *         $ref: '#/components/responses/500'
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    // Filter parameters
    const modelType = searchParams.get('model_type');
    const status = searchParams.get('status');
    const framework = searchParams.get('framework');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (modelType) {
      whereClause.model_type = modelType;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (framework) {
      whereClause.framework = framework;
    }

    // Handle search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { algorithm: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count
    const totalCount = await Experiment.count({ where: whereClause });

    // Fetch models with pagination
    const models = await Experiment.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
      include: [
        {
          association: 'experiment',
          attributes: ['id', 'name', 'status'],
          required: false
        },
        {
          association: 'deployments',
          required: false
        }
      ]
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const pagination = {
      page,
      limit,
      total: totalCount,
      pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    };

    return NextResponse.json({
      success: true,
      data: models,
      pagination,
      count: models.length
    });

  } catch (error) {
    console.error('API Error - ml-models GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ML models',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/ml-models:
 *   post:
 *     summary: Create a new ML model
 *     description: Register a new machine learning model for tracking and deployment
 *     tags:
 *       - Models
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - model_type
 *               - algorithm
 *               - framework
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Threat Detection Random Forest"
 *               description:
 *                 type: string
 *                 example: "Random Forest classifier for detecting malicious network traffic patterns"
 *               model_type:
 *                 type: string
 *                 enum: [classification, regression, clustering, anomaly_detection, time_series, neural_network, ensemble]
 *                 example: "classification"
 *               algorithm:
 *                 type: string
 *                 example: "Random Forest"
 *               framework:
 *                 type: string
 *                 enum: [scikit-learn, tensorflow, pytorch, xgboost, lightgbm, h2o, custom]
 *                 example: "scikit-learn"
 *               version:
 *                 type: string
 *                 example: "1.0.0"
 *               experiment_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [training, trained, deployed, archived, failed]
 *                 default: training
 *                 example: "trained"
 *               hyperparameters:
 *                 type: object
 *                 example:
 *                   n_estimators: 100
 *                   max_depth: 10
 *                   min_samples_split: 2
 *                   random_state: 42
 *               metrics:
 *                 type: object
 *                 example:
 *                   accuracy: 0.95
 *                   precision: 0.93
 *                   recall: 0.97
 *                   f1_score: 0.95
 *                   auc_roc: 0.96
 *               feature_importance:
 *                 type: object
 *                 example:
 *                   packet_size: 0.25
 *                   connection_duration: 0.20
 *                   protocol_type: 0.18
 *                   port_number: 0.15
 *               model_size:
 *                 type: integer
 *                 description: Model size in bytes
 *                 example: 1048576
 *               training_time:
 *                 type: integer
 *                 description: Training time in seconds
 *                 example: 300
 *               artifacts:
 *                 type: object
 *                 properties:
 *                   model_path:
 *                     type: string
 *                   config_path:
 *                     type: string
 *                   preprocessing_path:
 *                     type: string
 *                 example:
 *                   model_path: "/models/threat_detection_rf_v1.pkl"
 *                   config_path: "/models/threat_detection_rf_v1_config.json"
 *                   preprocessing_path: "/models/threat_detection_rf_v1_preprocessor.pkl"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["cybersecurity", "threat-detection", "network-analysis", "production"]
 *               metadata:
 *                 type: object
 *                 example:
 *                   author: "ML Team"
 *                   use_case: "Network Security"
 *                   data_sources: ["Network Traffic", "System Logs"]
 *           examples:
 *             threat_detection_model:
 *               summary: Cybersecurity Threat Detection Model
 *               value:
 *                 name: "Advanced Threat Detection Model v2.1"
 *                 description: "Deep learning model for detecting APT activities and advanced persistent threats in network traffic"
 *                 model_type: "neural_network"
 *                 algorithm: "LSTM with Attention"
 *                 framework: "tensorflow"
 *                 version: "2.1.0"
 *                 experiment_id: 15
 *                 status: "trained"
 *                 hyperparameters:
 *                   epochs: 100
 *                   batch_size: 32
 *                   learning_rate: 0.001
 *                   dropout: 0.2
 *                   lstm_units: 128
 *                 metrics:
 *                   accuracy: 0.987
 *                   precision: 0.985
 *                   recall: 0.989
 *                   f1_score: 0.987
 *                   false_positive_rate: 0.013
 *                 model_size: 52428800
 *                 training_time: 7200
 *                 tags: ["apt-detection", "deep-learning", "network-security", "production-ready"]
 *                 metadata:
 *                   author: "Security AI Team"
 *                   use_case: "APT Detection"
 *                   threat_types: ["APT", "Zero-day", "C2 Communication"]
 *             fraud_detection_model:
 *               summary: Financial Fraud Detection Model
 *               value:
 *                 name: "Financial Fraud Ensemble Model"
 *                 description: "Ensemble model combining XGBoost and Random Forest for detecting fraudulent transactions"
 *                 model_type: "ensemble"
 *                 algorithm: "XGBoost + Random Forest"
 *                 framework: "xgboost"
 *                 version: "1.5.0"
 *                 experiment_id: 8
 *                 status: "deployed"
 *                 hyperparameters:
 *                   xgb_n_estimators: 200
 *                   xgb_max_depth: 8
 *                   rf_n_estimators: 150
 *                   rf_max_depth: 12
 *                 metrics:
 *                   accuracy: 0.992
 *                   precision: 0.988
 *                   recall: 0.995
 *                   f1_score: 0.991
 *                   auc_roc: 0.998
 *                 feature_importance:
 *                   transaction_amount: 0.28
 *                   merchant_category: 0.22
 *                   time_of_day: 0.18
 *                   location_risk: 0.16
 *                   user_behavior_score: 0.16
 *                 tags: ["fraud-detection", "financial-crimes", "ensemble", "high-accuracy"]
 *             anomaly_detection_model:
 *               summary: System Anomaly Detection Model
 *               value:
 *                 name: "System Anomaly Detector"
 *                 description: "Isolation Forest model for detecting anomalous system behavior and potential security incidents"
 *                 model_type: "anomaly_detection"
 *                 algorithm: "Isolation Forest"
 *                 framework: "scikit-learn"
 *                 version: "1.2.0"
 *                 experiment_id: 12
 *                 status: "deployed"
 *                 hyperparameters:
 *                   n_estimators: 100
 *                   contamination: 0.1
 *                   max_samples: "auto"
 *                   random_state: 42
 *                 metrics:
 *                   precision: 0.89
 *                   recall: 0.92
 *                   f1_score: 0.905
 *                   anomaly_detection_rate: 0.94
 *                 tags: ["anomaly-detection", "system-monitoring", "unsupervised", "security"]
 *     responses:
 *       201:
 *         description: ML model created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MLModel'
 *                 message:
 *                   type: string
 *                   example: "ML model created successfully"
 *       400:
 *         $ref: '#/components/responses/400'
 *       500:
 *         $ref: '#/components/responses/500'
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.model_type || !body.algorithm || !body.framework) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Name, model type, algorithm, and framework are required'
        },
        { status: 400 }
      );
    }

    // Validate model type
    const validModelTypes = ['classification', 'regression', 'clustering', 'anomaly_detection', 'time_series', 'neural_network', 'ensemble'];
    if (!validModelTypes.includes(body.model_type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid model type. Must be one of: ${validModelTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate framework
    const validFrameworks = ['scikit-learn', 'tensorflow', 'pytorch', 'xgboost', 'lightgbm', 'h2o', 'custom'];
    if (!validFrameworks.includes(body.framework)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid framework. Must be one of: ${validFrameworks.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['training', 'trained', 'deployed', 'archived', 'failed'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    // Set defaults for optional fields
    const modelData: any = {
      name: body.name,
      description: body.description,
      model_type: body.model_type,
      algorithm: body.algorithm,
      framework: body.framework,
      version: body.version || '1.0.0',
      experiment_id: body.experiment_id,
      status: body.status || 'training',
      hyperparameters: body.hyperparameters || {},
      metrics: body.metrics || {},
      feature_importance: body.feature_importance || {},
      model_size: body.model_size,
      training_time: body.training_time,
      artifacts: body.artifacts || {},
      tags: body.tags || [],
      metadata: body.metadata || {}
    };

    // Add optional date fields
    if (body.trained_at) {
      modelData.trained_at = new Date(body.trained_at);
    }

    // Create the ML model
    const model = await Experiment.create(modelData);

    return NextResponse.json({
      success: true,
      data: model,
      message: 'ML model created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - ml-models POST:', error);

    // Handle validation errors
    if (error instanceof Error && (
      error.message.includes('required') || 
      error.message.includes('must be') ||
      error.message.includes('invalid')
    )) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create ML model',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
