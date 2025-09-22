/**
 * API Route: /api/iocs
 * Indicators of Compromise management
 */
import { NextRequest, NextResponse } from 'next/server';
import { IOC } from '../../../lib/models/IOC.model';
import { initializeCompleteDatabase } from '../../../lib/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/iocs:
 *   get:
 *     summary: List all IOCs
 *     description: Retrieve a paginated list of Indicators of Compromise with optional filtering
 *     tags:
 *       - IOC Management
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ip, domain, url, hash_md5, hash_sha1, hash_sha256, email, file_name, registry_key, mutex, yara_rule]
 *         description: Filter by IOC type
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, low, medium, high, critical]
 *         description: Filter by severity level
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: false_positive
 *         schema:
 *           type: boolean
 *         description: Filter by false positive status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by IOC value
 *     responses:
 *       200:
 *         description: List of IOCs
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
 *                     $ref: '#/components/schemas/IOC'
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
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const isActive = searchParams.get('is_active');
    const falsePositive = searchParams.get('false_positive');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (type) {
      whereClause.type = type;
    }
    
    if (severity) {
      whereClause.severity = severity;
    }
    
    if (isActive !== null) {
      whereClause.is_active = isActive === 'true';
    }
    
    if (falsePositive !== null) {
      whereClause.false_positive = falsePositive === 'true';
    }

    // Handle search and filtering
    let iocs: IOC[];
    let totalCount: number;

    if (search) {
      // Search for IOCs by value using LIKE query
      const searchResults = await IOC.findAll({
        where: {
          value: {
            [Op.iLike]: `%${search}%`
          }
        },
        limit: 100 // Limit search results
      });
      
      iocs = searchResults;
      totalCount = iocs.length;
      // Apply pagination to search results
      iocs = iocs.slice(offset, offset + limit);
    } else {
      // Get total count
      totalCount = await IOC.count({ where: whereClause });

      // Fetch IOCs with pagination
      iocs = await IOC.findAll({
        where: whereClause,
        limit,
        offset,
        order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
        include: [
          {
            association: 'incident_iocs',
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
      data: iocs,
      pagination,
      count: iocs.length
    });

  } catch (error) {
    console.error('API Error - iocs GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch IOCs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/iocs:
 *   post:
 *     summary: Create a new IOC
 *     description: Register a new Indicator of Compromise
 *     tags:
 *       - IOC Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IOC'
 *           examples:
 *             malicious_ip:
 *               summary: Malicious IP Address
 *               value:
 *                 value: "192.168.1.100"
 *                 type: "ip"
 *                 description: "Known malicious IP associated with APT29"
 *                 confidence: 95
 *                 severity: "high"
 *                 source: "Threat Intelligence Feed"
 *                 is_active: true
 *                 false_positive: false
 *                 tags: ["APT29", "Russia", "Malware C2"]
 *             malicious_domain:
 *               summary: Malicious Domain
 *               value:
 *                 value: "malicious-example.com"
 *                 type: "domain"
 *                 description: "Domain used for phishing campaigns"
 *                 confidence: 85
 *                 severity: "medium"
 *                 source: "Internal Analysis"
 *                 is_active: true
 *                 tags: ["phishing", "credential-harvesting"]
 *             file_hash:
 *               summary: Malicious File Hash
 *               value:
 *                 value: "d41d8cd98f00b204e9800998ecf8427e"
 *                 type: "hash_md5"
 *                 description: "Malware sample hash"
 *                 confidence: 90
 *                 severity: "critical"
 *                 source: "Sandbox Analysis"
 *                 is_active: true
 *     responses:
 *       201:
 *         description: IOC created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/IOC'
 *                 message:
 *                   type: string
 *                   example: "IOC created successfully"
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: IOC already exists
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
    if (!body.value || !body.type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'IOC value and type are required'
        },
        { status: 400 }
      );
    }

    // Validate IOC type
    const validTypes = ['ip', 'domain', 'url', 'hash_md5', 'hash_sha1', 'hash_sha256', 'email', 'file_name', 'registry_key', 'mutex', 'yara_rule'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid IOC type. Must be one of: ${validTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Set defaults for optional fields
    const iocData: any = {
      value: body.value,
      type: body.type,
      description: body.description,
      confidence: body.confidence || 50,
      severity: body.severity || 'medium',
      tags: body.tags || [],
      source: body.source,
      is_active: body.is_active !== undefined ? body.is_active : true,
      false_positive: body.false_positive !== undefined ? body.false_positive : false,
      context: body.context || {},
      metadata: body.metadata || {}
    };

    // Add optional date fields only if provided
    if (body.first_seen) {
      iocData.first_seen = new Date(body.first_seen);
    }
    if (body.last_seen) {
      iocData.last_seen = new Date(body.last_seen);
    }

    // Create the IOC using the model's validation
    const ioc = await IOC.createIOC(iocData);

    return NextResponse.json({
      success: true,
      data: ioc,
      message: 'IOC created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - iocs POST:', error);

    // Handle duplicate IOC error
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
      error.message.includes('must be between') ||
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
        error: 'Failed to create IOC',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
