/**
 * API Route: /api/deployments
 * Model deployment and serving management
 */
import { NextRequest, NextResponse } from 'next/server';
import { Deployment } from '../../../lib/models/Deployment.model';
import { initializeCompleteDatabase } from '../../../lib/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/deployments:
 *   get:
 *     summary: List all model deployments
 *     description: Retrieve a paginated list of model deployments with filtering
 *     tags:
 *       - Deployments
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, deploying, deployed, failed, stopped, updating]
 *         description: Filter by deployment status
 *       - in: query
 *         name: environment
 *         schema:
 *           type: string
 *           enum: [development, staging, production, testing]
 *         description: Filter by deployment environment
 *       - in: query
 *         name: deployment_type
 *         schema:
 *           type: string
 *           enum: [api, batch, streaming, edge, serverless]
 *         description: Filter by deployment type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by deployment name or description
 *     responses:
 *       200:
 *         description: List of model deployments
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
 *                     $ref: '#/components/schemas/Deployment'
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
    const status = searchParams.get('status');
    const environment = searchParams.get('environment');
    const deploymentType = searchParams.get('deployment_type');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (environment) {
      whereClause.environment = environment;
    }
    
    if (deploymentType) {
      whereClause.deployment_type = deploymentType;
    }

    // Handle search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count
    const totalCount = await Deployment.count({ where: whereClause });

    // Fetch deployments with pagination
    const deployments = await Deployment.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
      include: [
        {
          association: 'experiment',
          attributes: ['id', 'name', 'status'],
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
      data: deployments,
      pagination,
      count: deployments.length
    });

  } catch (error) {
    console.error('API Error - deployments GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch deployments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/deployments:
 *   post:
 *     summary: Create a new model deployment
 *     description: Deploy a trained model to a target environment
 *     tags:
 *       - Deployments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - experiment_id
 *               - environment
 *               - deployment_type
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Threat Detection API v2.1"
 *               description:
 *                 type: string
 *                 example: "Production deployment of advanced threat detection model"
 *               experiment_id:
 *                 type: integer
 *                 example: 15
 *               environment:
 *                 type: string
 *                 enum: [development, staging, production, testing]
 *                 example: "production"
 *               deployment_type:
 *                 type: string
 *                 enum: [api, batch, streaming, edge, serverless]
 *                 example: "api"
 *               status:
 *                 type: string
 *                 enum: [pending, deploying, deployed, failed, stopped, updating]
 *                 default: pending
 *                 example: "pending"
 *               endpoint_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://api.security.company.com/v1/threat-detection"
 *               version:
 *                 type: string
 *                 example: "2.1.0"
 *               replicas:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 1
 *                 example: 3
 *               resource_requirements:
 *                 type: object
 *                 properties:
 *                   cpu:
 *                     type: string
 *                     example: "2 cores"
 *                   memory:
 *                     type: string
 *                     example: "4Gi"
 *                   gpu:
 *                     type: string
 *                     example: "1x NVIDIA T4"
 *                   storage:
 *                     type: string
 *                     example: "10Gi"
 *                 example:
 *                   cpu: "4 cores"
 *                   memory: "8Gi"
 *                   gpu: "1x NVIDIA V100"
 *                   storage: "50Gi"
 *               scaling_config:
 *                 type: object
 *                 properties:
 *                   min_replicas:
 *                     type: integer
 *                   max_replicas:
 *                     type: integer
 *                   target_cpu_utilization:
 *                     type: integer
 *                   target_memory_utilization:
 *                     type: integer
 *                 example:
 *                   min_replicas: 2
 *                   max_replicas: 10
 *                   target_cpu_utilization: 70
 *                   target_memory_utilization: 80
 *               health_checks:
 *                 type: object
 *                 properties:
 *                   readiness_probe:
 *                     type: string
 *                   liveness_probe:
 *                     type: string
 *                   startup_probe:
 *                     type: string
 *                 example:
 *                   readiness_probe: "/health/ready"
 *                   liveness_probe: "/health/live"
 *                   startup_probe: "/health/startup"
 *               monitoring_config:
 *                 type: object
 *                 properties:
 *                   metrics_enabled:
 *                     type: boolean
 *                   logging_level:
 *                     type: string
 *                   alerts_enabled:
 *                     type: boolean
 *                   dashboard_url:
 *                     type: string
 *                 example:
 *                   metrics_enabled: true
 *                   logging_level: "INFO"
 *                   alerts_enabled: true
 *                   dashboard_url: "https://monitoring.company.com/deployments/threat-detection"
 *               security_config:
 *                 type: object
 *                 properties:
 *                   authentication_required:
 *                     type: boolean
 *                   rate_limiting:
 *                     type: object
 *                   encryption_enabled:
 *                     type: boolean
 *                   network_policies:
 *                     type: array
 *                     items:
 *                       type: string
 *                 example:
 *                   authentication_required: true
 *                   rate_limiting:
 *                     requests_per_minute: 1000
 *                     burst_size: 100
 *                   encryption_enabled: true
 *                   network_policies: ["deny-all-ingress", "allow-specific-egress"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["production", "security", "high-availability", "auto-scaling"]
 *               metadata:
 *                 type: object
 *                 example:
 *                   deployed_by: "MLOps Team"
 *                   deployment_tool: "Kubernetes"
 *                   ci_cd_pipeline: "GitLab CI"
 *                   cost_center: "Security Operations"
 *           examples:
 *             production_api_deployment:
 *               summary: Production API Deployment
 *               value:
 *                 name: "Threat Detection API Production"
 *                 description: "High-availability production deployment for real-time threat detection"
 *                 experiment_id: 25
 *                 environment: "production"
 *                 deployment_type: "api"
 *                 status: "pending"
 *                 endpoint_url: "https://api.security.company.com/v2/threat-detection"
 *                 version: "2.0.0"
 *                 replicas: 5
 *                 resource_requirements:
 *                   cpu: "4 cores"
 *                   memory: "8Gi"
 *                   gpu: "1x NVIDIA V100"
 *                   storage: "100Gi"
 *                 scaling_config:
 *                   min_replicas: 3
 *                   max_replicas: 15
 *                   target_cpu_utilization: 70
 *                   target_memory_utilization: 80
 *                 health_checks:
 *                   readiness_probe: "/api/v2/health/ready"
 *                   liveness_probe: "/api/v2/health/live"
 *                   startup_probe: "/api/v2/health/startup"
 *                 monitoring_config:
 *                   metrics_enabled: true
 *                   logging_level: "INFO"
 *                   alerts_enabled: true
 *                   dashboard_url: "https://monitoring.company.com/threat-detection-prod"
 *                 security_config:
 *                   authentication_required: true
 *                   rate_limiting:
 *                     requests_per_minute: 5000
 *                     burst_size: 500
 *                   encryption_enabled: true
 *                   network_policies: ["strict-ingress", "egress-threat-intel-feeds"]
 *                 tags: ["production", "security", "critical", "auto-scaling", "gpu-enabled"]
 *                 metadata:
 *                   deployed_by: "Security MLOps Team"
 *                   deployment_tool: "Kubernetes + Helm"
 *                   compliance: ["SOC2", "PCI-DSS"]
 *             batch_processing_deployment:
 *               summary: Batch Processing Deployment
 *               value:
 *                 name: "Threat Intelligence Batch Processor"
 *                 description: "Batch deployment for processing large volumes of threat intelligence data"
 *                 experiment_id: 18
 *                 environment: "production"
 *                 deployment_type: "batch"
 *                 status: "pending"
 *                 version: "1.8.0"
 *                 replicas: 1
 *                 resource_requirements:
 *                   cpu: "16 cores"
 *                   memory: "64Gi"
 *                   storage: "1Ti"
 *                 monitoring_config:
 *                   metrics_enabled: true
 *                   logging_level: "INFO"
 *                   alerts_enabled: true
 *                 tags: ["batch-processing", "threat-intelligence", "high-memory", "scheduled"]
 *             edge_deployment:
 *               summary: Edge Deployment
 *               value:
 *                 name: "Lightweight Threat Detection Edge"
 *                 description: "Edge deployment for real-time threat detection with minimal latency"
 *                 experiment_id: 22
 *                 environment: "production"
 *                 deployment_type: "edge"
 *                 status: "pending"
 *                 version: "1.0.0"
 *                 replicas: 10
 *                 resource_requirements:
 *                   cpu: "2 cores"
 *                   memory: "2Gi"
 *                   storage: "10Gi"
 *                 tags: ["edge-computing", "low-latency", "distributed", "iot-security"]
 *     responses:
 *       201:
 *         description: Deployment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Deployment'
 *                 message:
 *                   type: string
 *                   example: "Deployment created successfully"
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
    if (!body.name || !body.experiment_id || !body.environment || !body.deployment_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Name, experiment ID, environment, and deployment type are required'
        },
        { status: 400 }
      );
    }

    // Validate environment
    const validEnvironments = ['development', 'staging', 'production', 'testing'];
    if (!validEnvironments.includes(body.environment)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid environment. Must be one of: ${validEnvironments.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate deployment type
    const validDeploymentTypes = ['api', 'batch', 'streaming', 'edge', 'serverless'];
    if (!validDeploymentTypes.includes(body.deployment_type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid deployment type. Must be one of: ${validDeploymentTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['pending', 'deploying', 'deployed', 'failed', 'stopped', 'updating'];
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

    // Validate replicas
    if (body.replicas && (body.replicas < 1 || body.replicas > 100)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Replicas must be between 1 and 100'
        },
        { status: 400 }
      );
    }

    // Set defaults for optional fields
    const deploymentData: any = {
      name: body.name,
      description: body.description,
      experiment_id: body.experiment_id,
      environment: body.environment,
      deployment_type: body.deployment_type,
      status: body.status || 'pending',
      endpoint_url: body.endpoint_url,
      version: body.version || '1.0.0',
      replicas: body.replicas || 1,
      resource_requirements: body.resource_requirements || {},
      scaling_config: body.scaling_config || {},
      health_checks: body.health_checks || {},
      monitoring_config: body.monitoring_config || {},
      security_config: body.security_config || {},
      tags: body.tags || [],
      metadata: body.metadata || {}
    };

    // Add optional date fields
    if (body.deployed_at) {
      deploymentData.deployed_at = new Date(body.deployed_at);
    }

    // Create the deployment
    const deployment = await Deployment.create(deploymentData);

    return NextResponse.json({
      success: true,
      data: deployment,
      message: 'Deployment created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - deployments POST:', error);

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
        error: 'Failed to create deployment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
