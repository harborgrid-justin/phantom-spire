/**
 * API Route: /api/cves
 * Common Vulnerabilities and Exposures management
 */
import { NextRequest, NextResponse } from 'next/server';
import { CVE } from '../../../../../../../lib/database/models/CVE.model';
import { initializeCompleteDatabase } from '../../../../../../../lib/database/database-init';

/**
 * @swagger
 * /api/cves:
 *   get:
 *     summary: List all CVEs
 *     description: Retrieve a paginated list of Common Vulnerabilities and Exposures with optional filtering
 *     tags:
 *       - CVE Management
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
 *         name: cvss_severity
 *         schema:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM, LOW, NONE]
 *         description: Filter by CVSS severity
 *       - in: query
 *         name: exploited_in_wild
 *         schema:
 *           type: boolean
 *         description: Filter by exploitation status
 *       - in: query
 *         name: has_exploit
 *         schema:
 *           type: boolean
 *         description: Filter by exploit availability
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by CVE year
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by CVE ID or description
 *     responses:
 *       200:
 *         description: List of CVEs
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
 *                     $ref: '#/components/schemas/CVE'
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
    const cvssSeverity = searchParams.get('cvss_severity');
    const exploitedInWild = searchParams.get('exploited_in_wild');
    const hasExploit = searchParams.get('has_exploit');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'published_date';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (cvssSeverity) {
      whereClause.cvss_severity = cvssSeverity;
    }
    
    if (exploitedInWild !== null) {
      whereClause.exploited_in_wild = exploitedInWild === 'true';
    }
    
    if (hasExploit !== null) {
      whereClause.has_exploit = hasExploit === 'true';
    }

    // Handle search and filtering
    let cves: CVE[];
    let totalCount: number;

    if (search) {
      cves = await CVE.searchCVEs(search);
      totalCount = cves.length;
      // Apply pagination to search results
      cves = cves.slice(offset, offset + limit);
    } else if (year) {
      cves = await CVE.findByYear(parseInt(year));
      totalCount = cves.length;
      cves = cves.slice(offset, offset + limit);
    } else {
      // Get total count
      totalCount = await CVE.count({ where: whereClause });

      // Fetch CVEs with pagination
      cves = await CVE.findAll({
        where: whereClause,
        limit,
        offset,
        order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']],
        include: [
          {
            association: 'threat_actor_cves',
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
      data: cves,
      pagination,
      count: cves.length
    });

  } catch (error) {
    console.error('API Error - cves GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch CVEs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/cves:
 *   post:
 *     summary: Create a new CVE record
 *     description: Register a new Common Vulnerability and Exposure
 *     tags:
 *       - CVE Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CVE'
 *           examples:
 *             critical_cve:
 *               summary: Critical CVE Example
 *               value:
 *                 cve_id: "CVE-2024-1234"
 *                 description: "Critical remote code execution vulnerability in popular web framework"
 *                 cvss_score: 9.8
 *                 cvss_severity: "CRITICAL"
 *                 cvss_version: "3.1"
 *                 affected_products: ["Framework X v1.0", "Framework X v2.0"]
 *                 vendor_names: ["Vendor Corp"]
 *                 cwe_ids: ["CWE-78"]
 *                 exploited_in_wild: true
 *                 has_exploit: true
 *                 references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-1234"]
 *     responses:
 *       201:
 *         description: CVE created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CVE'
 *                 message:
 *                   type: string
 *                   example: "CVE created successfully"
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: CVE already exists
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
    if (!body.cve_id || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'CVE ID and description are required'
        },
        { status: 400 }
      );
    }

    // Validate CVE ID format
    const cveIdPattern = /^CVE-/d{4}-/d{4,}$/;
    if (!cveIdPattern.test(body.cve_id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'CVE ID must follow format CVE-YYYY-NNNN'
        },
        { status: 400 }
      );
    }

    // Set defaults for optional fields
    const cveData: any = {
      cve_id: body.cve_id,
      description: body.description,
      cvss_score: body.cvss_score,
      cvss_severity: body.cvss_severity,
      cvss_version: body.cvss_version,
      cvss_vector: body.cvss_vector || {},
      cwe_ids: body.cwe_ids || [],
      affected_products: body.affected_products || [],
      vendor_names: body.vendor_names || [],
      references: body.references || [],
      status: body.status || 'PUBLISHED',
      tags: body.tags || [],
      exploited_in_wild: body.exploited_in_wild || false,
      has_exploit: body.has_exploit || false,
      threat_intelligence: body.threat_intelligence || {},
      metadata: body.metadata || {}
    };

    // Add optional date fields only if provided
    if (body.published_date) {
      cveData.published_date = new Date(body.published_date);
    }
    if (body.modified_date) {
      cveData.modified_date = new Date(body.modified_date);
    }

    // Create the CVE using the model's validation
    const cve = await CVE.createCVE(cveData);

    return NextResponse.json({
      success: true,
      data: cve,
      message: 'CVE created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - cves POST:', error);

    // Handle duplicate CVE ID error
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
      error.message.includes('format') || 
      error.message.includes('required')
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
        error: 'Failed to create CVE',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
