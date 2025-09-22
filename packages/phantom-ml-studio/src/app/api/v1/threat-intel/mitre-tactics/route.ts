/**
 * API Route: /api/mitre-tactics
 * MITRE ATT&CK Tactics management
 */
import { NextRequest, NextResponse } from 'next/server';
import { MitreTactic } from '../../../../../../../lib/database/models/MitreTactic.model';
import { initializeCompleteDatabase } from '../../../../../../../lib/database/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/mitre-tactics:
 *   get:
 *     summary: List all MITRE ATT&CK tactics
 *     description: Retrieve a paginated list of MITRE ATT&CK tactics with optional filtering
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by tactic name or description
 *     responses:
 *       200:
 *         description: List of MITRE tactics
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
 *                     $ref: '#/components/schemas/MitreTactic'
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
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'tactic_id';
    const order = searchParams.get('order') || 'asc';

    // Build where clause
    const whereClause: any = {};

    // Handle search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tactic_id: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count
    const totalCount = await MitreTactic.count({ where: whereClause });

    // Fetch tactics with pagination
    const tactics = await MitreTactic.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
      include: [
        {
          association: 'techniques',
          required: false
        },
        {
          association: 'threat_actor_tactics',
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
      data: tactics,
      pagination,
      count: tactics.length
    });

  } catch (error) {
    console.error('API Error - mitre-tactics GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch MITRE tactics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/mitre-tactics:
 *   post:
 *     summary: Create a new MITRE ATT&CK tactic
 *     description: Register a new MITRE ATT&CK tactic
 *     tags:
 *       - MITRE ATT&CK
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tactic_id
 *               - name
 *               - description
 *             properties:
 *               tactic_id:
 *                 type: string
 *                 pattern: "^TA[0-9]{4}$"
 *                 example: "TA0001"
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Initial Access"
 *               description:
 *                 type: string
 *                 example: "The adversary is trying to get into your network"
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://attack.mitre.org/tactics/TA0001/"
 *               external_id:
 *                 type: string
 *                 example: "TA0001"
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
 *               metadata:
 *                 type: object
 *                 example: {"version": "1.0", "created": "2017-05-31T21:30:19.735Z"}
 *           examples:
 *             initial_access:
 *               summary: Initial Access Tactic
 *               value:
 *                 tactic_id: "TA0001"
 *                 name: "Initial Access"
 *                 description: "The adversary is trying to get into your network. Initial Access consists of techniques that use various entry vectors to gain their initial foothold within a network."
 *                 url: "https://attack.mitre.org/tactics/TA0001/"
 *                 external_id: "TA0001"
 *                 kill_chain_phases: ["mitre-attack:initial-access"]
 *                 platforms: ["Windows", "macOS", "Linux", "PRE", "Network", "Containers", "IaaS", "SaaS"]
 *             persistence:
 *               summary: Persistence Tactic
 *               value:
 *                 tactic_id: "TA0003"
 *                 name: "Persistence"
 *                 description: "The adversary is trying to maintain their foothold. Persistence consists of techniques that adversaries use to keep access to systems across restarts, changed credentials, and other interruptions."
 *                 url: "https://attack.mitre.org/tactics/TA0003/"
 *                 external_id: "TA0003"
 *                 kill_chain_phases: ["mitre-attack:persistence"]
 *                 platforms: ["Windows", "macOS", "Linux", "Containers", "IaaS", "SaaS"]
 *     responses:
 *       201:
 *         description: MITRE tactic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MitreTactic'
 *                 message:
 *                   type: string
 *                   example: "MITRE tactic created successfully"
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: Tactic already exists
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
    if (!body.tactic_id || !body.name || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Tactic ID, name, and description are required'
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
    const tacticData: any = {
      tactic_id: body.tactic_id,
      name: body.name,
      description: body.description,
      url: body.url,
      external_id: body.external_id || body.tactic_id,
      kill_chain_phases: body.kill_chain_phases || [],
      platforms: body.platforms || [],
      metadata: body.metadata || {}
    };

    // Create the MITRE tactic
    const tactic = await MitreTactic.create(tacticData);

    return NextResponse.json({
      success: true,
      data: tactic,
      message: 'MITRE tactic created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - mitre-tactics POST:', error);

    // Handle duplicate tactic error
    if (error instanceof Error && (
      error.message.includes('already exists') ||
      error.message.includes('unique constraint')
    )) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'MITRE tactic with this ID already exists'
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
        error: 'Failed to create MITRE tactic',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
