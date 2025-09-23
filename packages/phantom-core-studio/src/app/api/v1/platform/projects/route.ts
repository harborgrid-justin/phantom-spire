/**
 * API Route: /api/projects
 * Project management and collaboration
 */
import { NextRequest, NextResponse } from 'next/server';
import { Project } from '../../../../../../../lib/database/models/Project.model';
import { initializeCompleteDatabase } from '../../../../../../../lib/database/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects
 *     description: Retrieve a paginated list of projects with optional filtering
 *     tags:
 *       - Project Management
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
 *           enum: [active, archived, completed, on_hold]
 *         description: Filter by project status
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [private, team, organization, public]
 *         description: Filter by visibility level
 *       - in: query
 *         name: owner_id
 *         schema:
 *           type: integer
 *         description: Filter by project owner
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name or description
 *     responses:
 *       200:
 *         description: List of projects
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
 *                     $ref: '#/components/schemas/Project'
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
    const visibility = searchParams.get('visibility');
    const ownerId = searchParams.get('owner_id');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (visibility) {
      whereClause.visibility = visibility;
    }
    
    if (ownerId) {
      whereClause.owner_id = parseInt(ownerId);
    }

    // Handle search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count
    const totalCount = await Project.count({ where: whereClause });

    // Fetch projects with pagination
    const projects = await Project.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
      include: [
        {
          association: 'owner',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name'],
          required: false
        },
        {
          association: 'team_members',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name'],
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
      data: projects,
      pagination,
      count: projects.length
    });

  } catch (error) {
    console.error('API Error - projects GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Create a new collaboration project
 *     tags:
 *       - Project Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - owner_id
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Threat Hunting Initiative Q4"
 *               description:
 *                 type: string
 *                 example: "Proactive threat hunting project focusing on APT groups targeting financial sector"
 *               owner_id:
 *                 type: integer
 *                 example: 1
 *               team_members:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3, 4]
 *               status:
 *                 type: string
 *                 enum: [active, archived, completed, on_hold]
 *                 default: active
 *                 example: "active"
 *               visibility:
 *                 type: string
 *                 enum: [private, team, organization, public]
 *                 default: team
 *                 example: "team"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["threat-hunting", "apt-analysis", "financial-sector"]
 *               settings:
 *                 type: object
 *                 example: {"notifications": true, "auto_assign": false, "priority": "high"}
 *           examples:
 *             threat_hunting_project:
 *               summary: Threat Hunting Project
 *               value:
 *                 name: "APT29 Campaign Analysis"
 *                 description: "Comprehensive analysis of APT29 tactics, techniques, and procedures targeting government entities"
 *                 owner_id: 1
 *                 team_members: [1, 2, 3]
 *                 status: "active"
 *                 visibility: "team"
 *                 tags: ["apt29", "government", "attribution"]
 *                 settings: {"priority": "critical", "notifications": true}
 *             incident_response_project:
 *               summary: Incident Response Project
 *               value:
 *                 name: "Data Breach Response - Case 2024-001"
 *                 description: "Incident response project for suspected data breach affecting customer database"
 *                 owner_id: 2
 *                 team_members: [1, 2, 4, 5]
 *                 status: "active"
 *                 visibility: "organization"
 *                 tags: ["incident-response", "data-breach", "forensics"]
 *                 settings: {"priority": "critical", "confidential": true}
 *             compliance_project:
 *               summary: Compliance Assessment Project
 *               value:
 *                 name: "SOX Compliance Review Q4 2024"
 *                 description: "Quarterly compliance assessment and gap analysis for Sarbanes-Oxley requirements"
 *                 owner_id: 3
 *                 team_members: [3, 6, 7]
 *                 status: "active"
 *                 visibility: "organization"
 *                 tags: ["compliance", "sox", "assessment"]
 *                 settings: {"deadline": "2024-12-31", "automated_reports": true}
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *                 message:
 *                   type: string
 *                   example: "Project created successfully"
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: Project name already exists
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
    if (!body.name || !body.owner_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Project name and owner ID are required'
        },
        { status: 400 }
      );
    }

    // Validate status
    if (body.status) {
      const validStatuses = ['active', 'archived', 'completed', 'on_hold'];
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

    // Validate visibility
    if (body.visibility) {
      const validVisibilities = ['private', 'team', 'organization', 'public'];
      if (!validVisibilities.includes(body.visibility)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            message: `Invalid visibility. Must be one of: ${validVisibilities.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    // Set defaults for optional fields
    const projectData: any = {
      name: body.name,
      description: body.description,
      owner_id: body.owner_id,
      team_members: body.team_members || [],
      status: body.status || 'active',
      visibility: body.visibility || 'team',
      tags: body.tags || [],
      settings: body.settings || {},
      metadata: body.metadata || {}
    };

    // Create the project using the model's validation
    const project = await Project.create(projectData);

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - projects POST:', error);

    // Handle duplicate project name error
    if (error instanceof Error && (
      error.message.includes('already exists') ||
      error.message.includes('unique constraint')
    )) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Project name already exists'
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
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
