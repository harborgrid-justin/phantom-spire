/**
 * API Route: /api/phantom-cores
 * Modular cybersecurity components management
 */
import { NextRequest, NextResponse } from 'next/server';
import { initializeCompleteDatabase } from '../../../lib/database-init';

/**
 * @swagger
 * /api/phantom-cores:
 *   get:
 *     summary: List all Phantom-Cores modules
 *     description: Retrieve a paginated list of available cybersecurity modules
 *     tags:
 *       - Phantom-Cores
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [xdr, siem, edr, ndr, soar, threat-intel, vulnerability, compliance, forensics]
 *         description: Filter by module category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, deprecated]
 *         description: Filter by module status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by module name or description
 *     responses:
 *       200:
 *         description: List of Phantom-Cores modules
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
 *                     $ref: '#/components/schemas/PhantomCore'
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
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Mock data for Phantom-Cores modules
    const allModules = [
      {
        id: 1,
        name: "XDR Core Engine",
        description: "Extended Detection and Response core processing engine with advanced threat correlation",
        category: "xdr",
        version: "3.2.1",
        status: "active",
        capabilities: ["threat_detection", "incident_correlation", "automated_response", "forensic_analysis"],
        supported_integrations: ["SIEM", "EDR", "NDR", "SOAR", "Threat Intelligence"],
        resource_requirements: {
          cpu: "8 cores",
          memory: "16GB",
          storage: "100GB"
        },
        security_features: ["end_to_end_encryption", "zero_trust_architecture", "behavioral_analytics"],
        compliance: ["SOC2", "ISO27001", "GDPR", "HIPAA"],
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z"
      },
      {
        id: 2,
        name: "SIEM Analytics Module",
        description: "Security Information and Event Management with AI-powered analytics and real-time monitoring",
        category: "siem",
        version: "2.8.4",
        status: "active",
        capabilities: ["log_aggregation", "real_time_analysis", "threat_hunting", "compliance_reporting"],
        supported_integrations: ["Splunk", "Elastic", "QRadar", "ArcSight", "Custom APIs"],
        resource_requirements: {
          cpu: "12 cores",
          memory: "32GB",
          storage: "500GB"
        },
        security_features: ["data_retention_policies", "role_based_access", "audit_logging"],
        compliance: ["SOX", "PCI-DSS", "NIST", "CIS"],
        created_at: "2024-01-10T08:15:00Z",
        updated_at: "2024-01-25T16:20:00Z"
      },
      {
        id: 3,
        name: "EDR Advanced Protection",
        description: "Endpoint Detection and Response with machine learning-based threat detection and automated remediation",
        category: "edr",
        version: "4.1.0",
        status: "active",
        capabilities: ["endpoint_monitoring", "malware_detection", "behavioral_analysis", "automatic_isolation"],
        supported_integrations: ["Windows", "macOS", "Linux", "Mobile Devices", "IoT Endpoints"],
        resource_requirements: {
          cpu: "4 cores",
          memory: "8GB",
          storage: "50GB"
        },
        security_features: ["kernel_level_protection", "memory_scanning", "fileless_attack_detection"],
        compliance: ["NIST", "MITRE ATT&CK", "ISO27001"],
        created_at: "2024-01-12T12:00:00Z",
        updated_at: "2024-01-22T10:30:00Z"
      },
      {
        id: 4,
        name: "NDR Traffic Analyzer",
        description: "Network Detection and Response for comprehensive network traffic analysis and threat detection",
        category: "ndr",
        version: "2.5.3",
        status: "active",
        capabilities: ["network_monitoring", "traffic_analysis", "anomaly_detection", "lateral_movement_detection"],
        supported_integrations: ["Wireshark", "Zeek", "Suricata", "pfSense", "Network TAPs"],
        resource_requirements: {
          cpu: "16 cores",
          memory: "64GB",
          storage: "1TB"
        },
        security_features: ["encrypted_traffic_analysis", "dns_monitoring", "protocol_analysis"],
        compliance: ["NIST", "ISO27001", "SOC2"],
        created_at: "2024-01-08T14:30:00Z",
        updated_at: "2024-01-28T11:45:00Z"
      },
      {
        id: 5,
        name: "SOAR Orchestration Platform",
        description: "Security Orchestration, Automation and Response platform for streamlined incident response",
        category: "soar",
        version: "3.0.2",
        status: "active",
        capabilities: ["workflow_automation", "playbook_execution", "case_management", "threat_intelligence_integration"],
        supported_integrations: ["Phantom", "Demisto", "XSOAR", "ServiceNow", "Jira"],
        resource_requirements: {
          cpu: "6 cores",
          memory: "12GB",
          storage: "200GB"
        },
        security_features: ["secure_api_endpoints", "credential_management", "audit_trails"],
        compliance: ["SOC2", "ISO27001", "NIST"],
        created_at: "2024-01-14T09:20:00Z",
        updated_at: "2024-01-26T15:10:00Z"
      },
      {
        id: 6,
        name: "Threat Intelligence Hub",
        description: "Centralized threat intelligence platform with automated feed processing and correlation",
        category: "threat-intel",
        version: "2.3.1",
        status: "active",
        capabilities: ["feed_aggregation", "ioc_correlation", "attribution_analysis", "threat_scoring"],
        supported_integrations: ["MISP", "TaxII", "STIX", "OpenIOC", "Custom Feeds"],
        resource_requirements: {
          cpu: "8 cores",
          memory: "16GB",
          storage: "300GB"
        },
        security_features: ["feed_validation", "data_sanitization", "access_controls"],
        compliance: ["TLP", "STIX", "TAXII", "ISO27001"],
        created_at: "2024-01-11T11:40:00Z",
        updated_at: "2024-01-24T13:25:00Z"
      },
      {
        id: 7,
        name: "Vulnerability Assessment Engine",
        description: "Comprehensive vulnerability assessment and management platform with automated scanning",
        category: "vulnerability",
        version: "3.1.5",
        status: "active",
        capabilities: ["vulnerability_scanning", "asset_discovery", "risk_assessment", "patch_management"],
        supported_integrations: ["Nessus", "OpenVAS", "Qualys", "Rapid7", "Custom Scanners"],
        resource_requirements: {
          cpu: "10 cores",
          memory: "20GB",
          storage: "150GB"
        },
        security_features: ["authenticated_scanning", "safe_scanning_modes", "report_encryption"],
        compliance: ["NIST", "ISO27001", "PCI-DSS", "SOC2"],
        created_at: "2024-01-09T16:50:00Z",
        updated_at: "2024-01-27T12:15:00Z"
      },
      {
        id: 8,
        name: "Compliance Management Suite",
        description: "Automated compliance monitoring and reporting for multiple regulatory frameworks",
        category: "compliance",
        version: "2.7.0",
        status: "active",
        capabilities: ["compliance_monitoring", "automated_reporting", "policy_management", "audit_preparation"],
        supported_integrations: ["GRC Platforms", "Policy Management", "Audit Tools", "Risk Management"],
        resource_requirements: {
          cpu: "4 cores",
          memory: "8GB",
          storage: "100GB"
        },
        security_features: ["data_privacy_controls", "audit_logging", "secure_reporting"],
        compliance: ["SOX", "GDPR", "HIPAA", "PCI-DSS", "ISO27001", "NIST"],
        created_at: "2024-01-13T13:25:00Z",
        updated_at: "2024-01-29T10:05:00Z"
      },
      {
        id: 9,
        name: "Digital Forensics Toolkit",
        description: "Advanced digital forensics and incident response toolkit for comprehensive investigation",
        category: "forensics",
        version: "1.9.2",
        status: "active",
        capabilities: ["evidence_collection", "memory_analysis", "disk_imaging", "timeline_analysis"],
        supported_integrations: ["Volatility", "Autopsy", "SIFT", "SANS Tools", "Custom Analyzers"],
        resource_requirements: {
          cpu: "12 cores",
          memory: "32GB",
          storage: "2TB"
        },
        security_features: ["chain_of_custody", "evidence_integrity", "secure_storage"],
        compliance: ["Legal Standards", "ISO27037", "NIST SP 800-86"],
        created_at: "2024-01-16T07:30:00Z",
        updated_at: "2024-01-23T14:40:00Z"
      }
    ];

    // Apply filters
    let filteredModules = allModules;

    if (category) {
      filteredModules = filteredModules.filter(module => module.category === category);
    }

    if (status) {
      filteredModules = filteredModules.filter(module => module.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredModules = filteredModules.filter(module => 
        module.name.toLowerCase().includes(searchLower) ||
        module.description.toLowerCase().includes(searchLower) ||
        module.capabilities.some(cap => cap.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const totalCount = filteredModules.length;
    const paginatedModules = filteredModules.slice(offset, offset + limit);

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
      data: paginatedModules,
      pagination,
      count: paginatedModules.length
    });

  } catch (error) {
    console.error('API Error - phantom-cores GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Phantom-Cores modules',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/phantom-cores:
 *   post:
 *     summary: Deploy a new Phantom-Core module
 *     description: Deploy and configure a new cybersecurity module
 *     tags:
 *       - Phantom-Cores
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - version
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Custom XDR Module"
 *               description:
 *                 type: string
 *                 example: "Custom extended detection and response module for specialized threat detection"
 *               category:
 *                 type: string
 *                 enum: [xdr, siem, edr, ndr, soar, threat-intel, vulnerability, compliance, forensics]
 *                 example: "xdr"
 *               version:
 *                 type: string
 *                 example: "1.0.0"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance, deprecated]
 *                 default: inactive
 *                 example: "inactive"
 *               capabilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["threat_detection", "automated_response", "correlation_analysis"]
 *               supported_integrations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["SIEM", "EDR", "Threat Intelligence"]
 *               resource_requirements:
 *                 type: object
 *                 properties:
 *                   cpu:
 *                     type: string
 *                   memory:
 *                     type: string
 *                   storage:
 *                     type: string
 *                 example:
 *                   cpu: "8 cores"
 *                   memory: "16GB"
 *                   storage: "200GB"
 *               security_features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["encryption", "access_control", "audit_logging"]
 *               compliance:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["SOC2", "ISO27001", "NIST"]
 *               configuration:
 *                 type: object
 *                 example:
 *                   api_endpoint: "https://api.company.com/xdr"
 *                   authentication_method: "oauth2"
 *                   polling_interval: 300
 *               metadata:
 *                 type: object
 *                 example:
 *                   author: "Security Team"
 *                   license: "Enterprise"
 *                   support_contact: "security@company.com"
 *           examples:
 *             custom_xdr_module:
 *               summary: Custom XDR Module
 *               value:
 *                 name: "Advanced Threat Correlation XDR"
 *                 description: "Custom XDR module with advanced threat correlation and machine learning-based detection"
 *                 category: "xdr"
 *                 version: "2.0.0"
 *                 status: "active"
 *                 capabilities: ["advanced_correlation", "ml_threat_detection", "automated_containment", "threat_hunting"]
 *                 supported_integrations: ["Splunk", "Elastic", "CrowdStrike", "SentinelOne", "Custom APIs"]
 *                 resource_requirements:
 *                   cpu: "16 cores"
 *                   memory: "32GB"
 *                   storage: "500GB"
 *                 security_features: ["end_to_end_encryption", "zero_trust", "behavioral_analytics", "deception_technology"]
 *                 compliance: ["SOC2 Type II", "ISO27001", "NIST CSF", "MITRE ATT&CK"]
 *                 configuration:
 *                   detection_sensitivity: "high"
 *                   response_automation: true
 *                   threat_intel_feeds: ["commercial", "government", "open_source"]
 *                 metadata:
 *                   author: "Advanced Security Research Team"
 *                   license: "Enterprise Premium"
 *                   deployment_type: "hybrid_cloud"
 *             soar_playbook_module:
 *               summary: SOAR Playbook Module
 *               value:
 *                 name: "Incident Response Playbook Engine"
 *                 description: "Automated incident response playbook execution with customizable workflows"
 *                 category: "soar"
 *                 version: "3.5.0"
 *                 status: "active"
 *                 capabilities: ["playbook_automation", "workflow_orchestration", "case_management", "escalation_handling"]
 *                 supported_integrations: ["ServiceNow", "Jira", "PagerDuty", "Slack", "Teams"]
 *                 resource_requirements:
 *                   cpu: "8 cores"
 *                   memory: "16GB"
 *                   storage: "100GB"
 *                 security_features: ["secure_credential_storage", "role_based_access", "audit_trails"]
 *                 compliance: ["SOC2", "ISO27001", "GDPR"]
 *                 configuration:
 *                   max_concurrent_playbooks: 50
 *                   default_escalation_time: 3600
 *                   notification_channels: ["email", "sms", "webhook"]
 *     responses:
 *       201:
 *         description: Phantom-Core module deployed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PhantomCore'
 *                 message:
 *                   type: string
 *                   example: "Phantom-Core module deployed successfully"
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
    if (!body.name || !body.category || !body.version) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Name, category, and version are required'
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['xdr', 'siem', 'edr', 'ndr', 'soar', 'threat-intel', 'vulnerability', 'compliance', 'forensics'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['active', 'inactive', 'maintenance', 'deprecated'];
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

    // Create mock response for new module deployment
    const newModule = {
      id: Date.now(), // Simple ID generation for mock
      name: body.name,
      description: body.description || '',
      category: body.category,
      version: body.version,
      status: body.status || 'inactive',
      capabilities: body.capabilities || [],
      supported_integrations: body.supported_integrations || [],
      resource_requirements: body.resource_requirements || {},
      security_features: body.security_features || [],
      compliance: body.compliance || [],
      configuration: body.configuration || {},
      metadata: body.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newModule,
      message: 'Phantom-Core module deployed successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - phantom-cores POST:', error);

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
        error: 'Failed to deploy Phantom-Core module',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
