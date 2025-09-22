/**
 * API Route: /api/mitre-techniques
 * MITRE ATT&CK Techniques management
 */
import { NextRequest, NextResponse } from 'next/server';
import { MitreTechnique } from '../../../lib/models/MitreTechnique.model';
import { initializeCompleteDatabase } from '../../../lib/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/mitre-techniques:
 *   get:
 *     summary: List all MITRE ATT&CK techniques
 *     description: Retrieve a paginated list of MITRE ATT&CK techniques with optional filtering
 *     tags:
 *       - MITRE ATT&CK
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
 *         name: tactic_id
 *         schema:
 *           type: string
 *         description: Filter by MITRE tactic ID
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [Windows, macOS, Linux, Network, PRE, Containers, IaaS, SaaS, Office365, Azure, AWS, GCP]
 *         description: Filter by platform
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by technique name or description
 *     responses:
 *       200:
 *         description: List of MITRE techniques
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
 *                     $ref: '#/components/schemas/MitreTechnique'
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
    const tacticId = searchParams.get('tactic_id');
    const platform = searchParams.get('platform');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'technique_id';
    const order = searchParams.get('order') || 'asc';

    // Build where clause
    const whereClause: any = {};

    if (tacticId) {
      whereClause.tactic_id = tacticId;
    }

    if (platform) {
      whereClause.platforms = {
        [Op.contains]: [platform]
      };
    }

    // Handle search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { technique_id: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count
    const totalCount = await MitreTechnique.count({ where: whereClause });

    // Fetch techniques with pagination
    const techniques = await MitreTechnique.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
      include: [
        {
          association: 'tactic',
          attributes: ['tactic_id', 'name'],
          required: false
        },
        {
          association: 'subtechniques',
          required: false
        },
        {
          association: 'threat_actor_techniques',
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
      data: techniques,
      pagination,
      count: techniques.length
    });

  } catch (error) {
    console.error('API Error - mitre-techniques GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch MITRE techniques',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/mitre-techniques:
 *   post:
 *     summary: Create a new MITRE ATT&CK technique
 *     description: Register a new MITRE ATT&CK technique
 *     tags:
 *       - MITRE ATT&CK
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technique_id
 *               - name
 *               - description
 *               - tactic_id
 *             properties:
 *               technique_id:
 *                 type: string
 *                 pattern: "^T[0-9]{4}$"
 *                 example: "T1566"
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: "Phishing"
 *               description:
 *                 type: string
 *                 example: "Adversaries may send phishing messages to gain access to victim systems"
 *               tactic_id:
 *                 type: string
 *                 pattern: "^TA[0-9]{4}$"
 *                 example: "TA0001"
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://attack.mitre.org/techniques/T1566/"
 *               external_id:
 *                 type: string
 *                 example: "T1566"
 *               kill_chain_phases:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["mitre-attack:initial-access"]
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Windows", "macOS", "Linux"]
 *               data_sources:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Application Log: Application Log Content", "Network Traffic: Network Traffic Content"]
 *               detection:
 *                 type: string
 *                 example: "Monitor for suspicious email attachments and URLs"
 *               defenses_bypassed:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Anti-virus", "Email Gateway"]
 *               permissions_required:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["User"]
 *               effective_permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["User"]
 *               system_requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Email client or web browser"]
 *               network_requirements:
 *                 type: boolean
 *                 example: true
 *               remote_support:
 *                 type: boolean
 *                 example: true
 *               metadata:
 *                 type: object
 *                 example: {"version": "2.1", "created": "2020-03-02T19:05:18.137Z"}
 *           examples:
 *             phishing_technique:
 *               summary: Phishing Technique
 *               value:
 *                 technique_id: "T1566"
 *                 name: "Phishing"
 *                 description: "Adversaries may send phishing messages to gain access to victim systems. All forms of phishing are electronically delivered social engineering."
 *                 tactic_id: "TA0001"
 *                 url: "https://attack.mitre.org/techniques/T1566/"
 *                 external_id: "T1566"
 *                 kill_chain_phases: ["mitre-attack:initial-access"]
 *                 platforms: ["Linux", "macOS", "Windows", "Office365", "SaaS", "Google Workspace"]
 *                 data_sources: ["Application Log: Application Log Content", "Network Traffic: Network Traffic Content", "Network Traffic: Network Traffic Flow"]
 *                 detection: "Network intrusion detection systems and email gateways can be used to detect phishing"
 *                 defenses_bypassed: ["Anti-virus", "Application control", "Email Gateway"]
 *                 permissions_required: ["User"]
 *                 network_requirements: true
 *                 remote_support: true
 *             credential_dumping:
 *               summary: Credential Dumping Technique
 *               value:
 *                 technique_id: "T1003"
 *                 name: "OS Credential Dumping"
 *                 description: "Adversaries may attempt to dump credentials to obtain account login and credential material"
 *                 tactic_id: "TA0006"
 *                 url: "https://attack.mitre.org/techniques/T1003/"
 *                 external_id: "T1003"
 *                 kill_chain_phases: ["mitre-attack:credential-access"]
 *                 platforms: ["Windows", "Linux", "macOS"]
 *                 data_sources: ["Command: Command Execution", "File: File Access", "Process: Process Creation"]
 *                 detection: "Monitor for unexpected processes accessing LSASS memory or SAM database"
 *                 permissions_required: ["Administrator", "SYSTEM", "root"]
 *                 effective_permissions: ["Administrator", "SYSTEM", "root"]
 *                 network_requirements: false
 *                 remote_support: false
 *     responses:
 *       201:
 *         description: MITRE technique created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MitreTechnique'
 *                 message:
 *                   type: string
 *                   example: "MITRE technique created successfully"
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: Technique already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/500'
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeCompleteDatabase();

    const body = await request.json();

    // Validate required fields
    if (!body.technique_id || !body.name || !body.description || !body.tactic_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Technique ID, name, description, and tactic ID are required'
        },
        { status: 400 }
      );
    }

    // Validate technique ID format
    if (!/^T[0-9]{4}$/.test(body.technique_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid technique ID format. Must be in format Txxxx (e.g., T1566)'
        },
        { status: 400 }
      );
    }

    // Validate tactic ID format
    if (!/^TA[0-9]{4}$/.test(body.tactic_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid tactic ID format. Must be in format TAxxxx (e.g., TA0001)'
        },
        { status: 400 }
      );
    }

    // Set defaults for optional fields
    const techniqueData: any = {
      technique_id: body.technique_id,
      name: body.name,
      description: body.description,
      tactic_id: body.tactic_id,
      url: body.url,
      external_id: body.external_id || body.technique_id,
      kill_chain_phases: body.kill_chain_phases || [],
      platforms: body.platforms || [],
      data_sources: body.data_sources || [],
      detection: body.detection,
      defenses_bypassed: body.defenses_bypassed || [],
      permissions_required: body.permissions_required || [],
      effective_permissions: body.effective_permissions || [],
      system_requirements: body.system_requirements || [],
      network_requirements: body.network_requirements !== undefined ? body.network_requirements : false,
      remote_support: body.remote_support !== undefined ? body.remote_support : false,
      metadata: body.metadata || {}
    };

    // Create the MITRE technique
    const technique = await MitreTechnique.create(techniqueData);

    return NextResponse.json({
      success: true,
      data: technique,
      message: 'MITRE technique created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - mitre-techniques POST:', error);

    // Handle duplicate technique error
    if (error instanceof Error && (
      error.message.includes('already exists') ||
      error.message.includes('unique constraint')
    )) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'MITRE technique with this ID already exists'
        },
        { status: 409 }
      );
    }

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
        error: 'Failed to create MITRE technique',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
