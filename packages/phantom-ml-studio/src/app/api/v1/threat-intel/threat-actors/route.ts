/**
 * API Route: /api/threat-actors
 * Comprehensive threat actor and APT group management
 */
import { NextRequest, NextResponse } from 'next/server';
import { ThreatActor } from '..\..\..\..\..\..\..\lib\database\models\ThreatActor.model';
import { initializeCompleteDatabase } from '..\..\..\..\..\..\..\lib\database\database-init';

/**
 * @swagger
 * /api/threat-actors:
 *   get:
 *     summary: List all threat actors
 *     description: Retrieve a paginated list of threat actors and APT groups with optional filtering
 *     tags:
 *       - Threat Actors
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
 *         name: actor_type
 *         schema:
 *           type: string
 *           enum: [APT, Criminal, Hacktivist, State-sponsored, Insider, Script-kiddie, Unknown]
 *         description: Filter by actor type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, dormant, unknown, neutralized]
 *         description: Filter by actor status
 *       - in: query
 *         name: sophistication_level
 *         schema:
 *           type: string
 *           enum: [minimal, intermediate, advanced, expert]
 *         description: Filter by sophistication level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or alias
 *     responses:
 *       200:
 *         description: List of threat actors
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
 *                     $ref: '#/components/schemas/ThreatActor'
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
    const actorType = searchParams.get('actor_type');
    const status = searchParams.get('status');
    const sophisticationLevel = searchParams.get('sophistication_level');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (actorType) {
      whereClause.actor_type = actorType;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (sophisticationLevel) {
      whereClause.sophistication_level = sophisticationLevel;
    }

    // Handle search
    let threatActors: ThreatActor[];
    let totalCount: number;

    if (search) {
      const searchResult = await ThreatActor.findByName(search);
      if (searchResult) {
        threatActors = [searchResult];
        totalCount = 1;
      } else {
        threatActors = [];
        totalCount = 0;
      }
    } else {
      // Get total count
      totalCount = await ThreatActor.count({ where: whereClause });

      // Fetch threat actors with pagination
      threatActors = await ThreatActor.findAll({
        where: whereClause,
        limit,
        offset,
        order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
        include: [
          {
            association: 'threat_actor_tactics',
            required: false
          },
          {
            association: 'threat_actor_techniques',
            required: false
          },
          {
            association: 'campaigns',
            required: false
          }
        ]
      });
    }

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
      data: threatActors,
      pagination,
      count: threatActors.length
    });

  } catch (error) {
    console.error('API Error - threat-actors GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch threat actors',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/threat-actors:
 *   post:
 *     summary: Create a new threat actor
 *     description: Register a new threat actor or APT group
 *     tags:
 *       - Threat Actors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ThreatActor'
 *           examples:
 *             apt_group:
 *               summary: APT Group Example
 *               value:
 *                 name: "APT29"
 *                 aliases: ["Cozy Bear", "The Dukes"]
 *                 description: "Russian state-sponsored threat group"
 *                 actor_type: "State-sponsored"
 *                 attributed_countries: ["Russia"]
 *                 target_countries: ["United States", "United Kingdom"]
 *                 target_industries: ["Government", "Defense", "Healthcare"]
 *                 sophistication_level: "expert"
 *                 status: "active"
 *                 threat_score: 95
 *                 activity_level: 85
 *     responses:
 *       201:
 *         description: Threat actor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ThreatActor'
 *                 message:
 *                   type: string
 *                   example: "Threat actor created successfully"
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: Threat actor already exists
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
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Threat actor name is required'
        },
        { status: 400 }
      );
    }

    // Set defaults for optional fields
    const threatActorData: any = {
      name: body.name,
      aliases: body.aliases || [],
      description: body.description,
      actor_type: body.actor_type || 'Unknown',
      attributed_countries: body.attributed_countries || [],
      target_countries: body.target_countries || [],
      target_industries: body.target_industries || [],
      motivations: body.motivations || [],
      sophistication_level: body.sophistication_level || 'intermediate',
      status: body.status || 'active',
      tools_used: body.tools_used || [],
      malware_families: body.malware_families || [],
      infrastructure: body.infrastructure || {},
      attribution_confidence: body.attribution_confidence || {},
      references: body.references || [],
      threat_score: body.threat_score || 50,
      activity_level: body.activity_level || 50,
      known_victims: body.known_victims || [],
      attack_patterns: body.attack_patterns || [],
      operating_regions: body.operating_regions || [],
      resource_level: body.resource_level || 'medium',
      tags: body.tags || [],
      metadata: body.metadata || {},
      threatgroup_id: body.threatgroup_id
    };

    // Add optional date fields only if provided
    if (body.first_seen) {
      threatActorData.first_seen = new Date(body.first_seen);
    }
    if (body.last_seen) {
      threatActorData.last_seen = new Date(body.last_seen);
    }

    // Create the threat actor using the model's validation
    const threatActor = await ThreatActor.createActor(threatActorData);

    return NextResponse.json({
      success: true,
      data: threatActor,
      message: 'Threat actor created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - threat-actors POST:', error);

    // Handle duplicate name error
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: error.message
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error instanceof Error && (
      error.message.includes('required') || 
      error.message.includes('must be between')
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
        error: 'Failed to create threat actor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
