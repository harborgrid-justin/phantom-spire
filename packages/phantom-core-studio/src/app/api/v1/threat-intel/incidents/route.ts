/**
 * API Route: /api/incidents
 * Security incident management
 */
import { NextRequest, NextResponse } from 'next/server';
import { Incident } from '../../../../../../../lib/database/models/Incident.model';
import { initializeCompleteDatabase } from '../../../../../../../lib/database/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/incidents:
 *   get:
 *     summary: List all incidents
 *     description: Retrieve a paginated list of security incidents with optional filtering
 *     tags:
 *       - Incident Management
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
 *           enum: [new, in_progress, resolved, closed, false_positive]
 *         description: Filter by incident status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, low, medium, high, critical]
 *         description: Filter by severity level
 *       - in: query
 *         name: incident_type
 *         schema:
 *           type: string
 *           enum: [malware, phishing, data_breach, ddos, insider_threat, apt, ransomware, other]
 *         description: Filter by incident type
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: integer
 *         description: Filter by assigned analyst
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by incident title or description
 *     responses:
 *       200:
 *         description: List of incidents
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
 *                     $ref: '#/components/schemas/Incident'
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
    const severity = searchParams.get('severity');
    const incidentType = searchParams.get('incident_type');
    const assignedTo = searchParams.get('assigned_to');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (severity) {
      whereClause.severity = severity;
    }
    
    if (incidentType) {
      whereClause.incident_type = incidentType;
    }
    
    if (assignedTo) {
      whereClause.assigned_to = parseInt(assignedTo);
    }

    // Handle search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { incident_id: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count
    const totalCount = await Incident.count({ where: whereClause });

    // Fetch incidents with pagination
    const incidents = await Incident.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
      include: [
        {
          association: 'assigned_analyst',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name'],
          required: false
        },
        {
          association: 'incident_iocs',
          required: false
        },
        {
          association: 'incident_cves',
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
      data: incidents,
      pagination,
      count: incidents.length
    });

  } catch (error) {
    console.error('API Error - incidents GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch incidents',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/incidents:
 *   post:
 *     summary: Create a new incident
 *     description: Register a new security incident for investigation
 *     tags:
 *       - Incident Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - incident_type
 *               - severity
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: "Suspected APT29 Activity on Finance Server"
 *               description:
 *                 type: string
 *                 example: "Multiple suspicious processes detected on FINSERV01 with network connections to known APT29 infrastructure"
 *               incident_type:
 *                 type: string
 *                 enum: [malware, phishing, data_breach, ddos, insider_threat, apt, ransomware, other]
 *                 example: "apt"
 *               severity:
 *                 type: string
 *                 enum: [info, low, medium, high, critical]
 *                 example: "high"
 *               status:
 *                 type: string
 *                 enum: [new, in_progress, resolved, closed, false_positive]
 *                 default: new
 *                 example: "new"
 *               assigned_to:
 *                 type: integer
 *                 example: 1
 *               affected_systems:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["FINSERV01", "WORKSTATION-05", "DC01"]
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["192.168.1.100", "malicious-domain.com", "suspicious.exe"]
 *               timeline:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     event:
 *                       type: string
 *                     details:
 *                       type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["apt29", "finance", "lateral-movement"]
 *               metadata:
 *                 type: object
 *                 example: {"source": "SIEM Alert", "rule_id": "APT-001"}
 *           examples:
 *             apt_incident:
 *               summary: APT Campaign Incident
 *               value:
 *                 title: "APT29 Campaign Targeting Financial Data"
 *                 description: "Advanced persistent threat campaign detected with focus on financial systems and customer data"
 *                 incident_type: "apt"
 *                 severity: "critical"
 *                 status: "new"
 *                 assigned_to: 1
 *                 affected_systems: ["FINSERV01", "FINSERV02", "FILESERV01"]
 *                 indicators: ["203.0.113.100", "apt29-c2.example.com", "backdoor.exe"]
 *                 tags: ["apt29", "cozy-bear", "financial-sector", "espionage"]
 *                 metadata: {"campaign": "COZY-2024", "attribution_confidence": "high"}
 *             ransomware_incident:
 *               summary: Ransomware Attack
 *               value:
 *                 title: "Ransomware Encryption on Production Systems"
 *                 description: "Multiple servers encrypted by ransomware with ransom note left on desktop systems"
 *                 incident_type: "ransomware"
 *                 severity: "critical"
 *                 status: "in_progress"
 *                 assigned_to: 2
 *                 affected_systems: ["PRODSERV01", "PRODSERV02", "BACKUP01"]
 *                 indicators: ["ransom.exe", "README-DECRYPT.txt", "192.168.100.50"]
 *                 tags: ["ransomware", "encryption", "production-impact"]
 *                 metadata: {"ransom_amount": "$50000", "payment_deadline": "72 hours"}
 *             phishing_incident:
 *               summary: Phishing Campaign
 *               value:
 *                 title: "Targeted Phishing Campaign Against Executives"
 *                 description: "Spear-phishing emails sent to C-level executives with malicious attachments"
 *                 incident_type: "phishing"
 *                 severity: "high"
 *                 status: "new"
 *                 assigned_to: 3
 *                 affected_systems: ["EMAIL-GATEWAY", "WORKSTATION-CEO", "WORKSTATION-CFO"]
 *                 indicators: ["phishing@fake-bank.com", "invoice_urgent.pdf", "credential-harvest.com"]
 *                 tags: ["phishing", "executive-targeting", "credential-harvesting"]
 *                 metadata: {"email_count": 15, "opened_count": 3, "clicked_count": 1}
 *     responses:
 *       201:
 *         description: Incident created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Incident'
 *                 message:
 *                   type: string
 *                   example: "Incident created successfully"
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
    if (!body.title || !body.incident_type || !body.severity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Title, incident type, and severity are required'
        },
        { status: 400 }
      );
    }

    // Validate incident type
    const validTypes = ['malware', 'phishing', 'data_breach', 'ddos', 'insider_threat', 'apt', 'ransomware', 'other'];
    if (!validTypes.includes(body.incident_type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid incident type. Must be one of: ${validTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ['info', 'low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(body.severity)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Generate incident ID (format: INC-YYYY-NNNN)
    const now = new Date();
    const year = now.getFullYear();
    const timestamp = now.getTime().toString().slice(-4);
    const incidentId = `INC-${year}-${timestamp}`;

    // Set defaults for optional fields
    const incidentData: any = {
      incident_id: incidentId,
      title: body.title,
      description: body.description,
      incident_type: body.incident_type,
      severity: body.severity,
      status: body.status || 'new',
      assigned_to: body.assigned_to,
      affected_systems: body.affected_systems || [],
      indicators: body.indicators || [],
      timeline: body.timeline || [],
      tags: body.tags || [],
      metadata: body.metadata || {}
    };

    // Add optional date fields
    if (body.occurred_at) {
      incidentData.occurred_at = new Date(body.occurred_at);
    }
    if (body.detected_at) {
      incidentData.detected_at = new Date(body.detected_at);
    }

    // Create the incident
    const incident = await Incident.create(incidentData);

    return NextResponse.json({
      success: true,
      data: incident,
      message: 'Incident created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - incidents POST:', error);

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
        error: 'Failed to create incident',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
