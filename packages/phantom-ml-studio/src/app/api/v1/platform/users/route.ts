/**
 * API Route: /api/users
 * User management and authentication
 */
import { NextRequest, NextResponse } from 'next/server';
import { User } from '../../../lib/models/User.model';
import { initializeCompleteDatabase } from '../../../lib/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Retrieve a paginated list of system users with optional filtering
 *     tags:
 *       - User Management
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, analyst, user, readonly]
 *         description: Filter by user role
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or email
 *     responses:
 *       200:
 *         description: List of users
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
 *                     $ref: '#/components/schemas/User'
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
    const role = searchParams.get('role');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (isActive !== null) {
      whereClause.is_active = isActive === 'true';
    }

    // Handle search functionality
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count
    const totalCount = await User.count({ where: whereClause });

    // Fetch users with pagination
    const users = await User.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
      attributes: { exclude: ['password_hash'] }, // Never return password hashes
      include: [
        {
          association: 'projects',
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
      data: users,
      pagination,
      count: users.length
    });

  } catch (error) {
    console.error('API Error - users GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new system user with proper authentication
 *     tags:
 *       - User Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "analyst1"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "analyst@company.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePassword123!"
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Doe"
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, user, readonly]
 *                 example: "analyst"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["read_threats", "write_iocs", "manage_incidents"]
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               preferences:
 *                 type: object
 *                 example: {"theme": "dark", "notifications": true}
 *           examples:
 *             admin_user:
 *               summary: Administrator User
 *               value:
 *                 username: "admin"
 *                 email: "admin@company.com"
 *                 password: "AdminPassword123!"
 *                 first_name: "System"
 *                 last_name: "Administrator"
 *                 role: "admin"
 *                 permissions: ["*"]
 *                 is_active: true
 *             analyst_user:
 *               summary: Security Analyst
 *               value:
 *                 username: "analyst1"
 *                 email: "analyst@company.com"
 *                 password: "AnalystPass123!"
 *                 first_name: "Jane"
 *                 last_name: "Smith"
 *                 role: "analyst"
 *                 permissions: ["read_threats", "write_iocs", "manage_incidents", "view_dashboards"]
 *                 is_active: true
 *             readonly_user:
 *               summary: Read-only User
 *               value:
 *                 username: "viewer1"
 *                 email: "viewer@company.com"
 *                 password: "ViewerPass123!"
 *                 first_name: "Bob"
 *                 last_name: "Johnson"
 *                 role: "readonly"
 *                 permissions: ["read_threats", "view_dashboards"]
 *                 is_active: true
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: User already exists
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
    if (!body.username || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Username, email, password, and role are required'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Password must be at least 8 characters long'
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'analyst', 'user', 'readonly'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Set defaults for optional fields
    const userData: any = {
      username: body.username,
      email: body.email,
      password_hash: body.password, // Will be hashed by the model
      first_name: body.first_name,
      last_name: body.last_name,
      role: body.role,
      permissions: body.permissions || [],
      is_active: body.is_active !== undefined ? body.is_active : true,
      preferences: body.preferences || {},
      metadata: body.metadata || {}
    };

    // Create the user using the model's validation and password hashing
    const user = await User.createUser(userData);

    // Remove password hash from response
    const userResponse: any = { ...user.toJSON() };
    delete userResponse.password_hash;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - users POST:', error);

    // Handle duplicate username/email error
    if (error instanceof Error && (
      error.message.includes('already exists') ||
      error.message.includes('unique constraint')
    )) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Username or email already exists'
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
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
