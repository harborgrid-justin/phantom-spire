/**
 * API Route: /api/threat-intelligence
 * Comprehensive threat intelligence operations
 */
import { NextRequest, NextResponse } from 'next/server';
import { ThreatIntelligence } from '../../../lib/models/ThreatIntelligence.model';
import { initializeCompleteDatabase } from '../../../lib/database-init';
import { Op } from 'sequelize';

/**
 * @swagger
 * /api/threat-intelligence:
 *   get:
 *     summary: List all threat intelligence data
 *     description: Retrieve a paginated list of threat intelligence with advanced filtering
 *     tags:
 *       - Threat Intelligence
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
 *         name: intel_type
 *         schema:
 *           type: string
 *           enum: [indicator, threat_actor, campaign, malware, vulnerability, tool, technique, infrastructure, report]
 *         description: Filter by intelligence type
 *       - in: query
 *         name: confidence_level
 *         schema:
 *           type: string
 *           enum: [very_low, low, medium, high, very_high]
 *         description: Filter by confidence level
 *       - in: query
 *         name: threat_level
 *         schema:
 *           type: string
 *           enum: [info, low, medium, high, critical]
 *         description: Filter by threat level
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by intelligence source
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, description, or indicators
 *     responses:
 *       200:
 *         description: List of threat intelligence data
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
 *                     $ref: '#/components/schemas/ThreatIntelligence'
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
    const intelType = searchParams.get('intel_type');
    const confidenceLevel = searchParams.get('confidence_level');
    const threatLevel = searchParams.get('threat_level');
    const source = searchParams.get('source');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Build where clause
    const whereClause: any = {};
    
    if (intelType) {
      whereClause.intel_type = intelType;
    }
    
    if (confidenceLevel) {
      whereClause.confidence_level = confidenceLevel;
    }
    
    if (threatLevel) {
      whereClause.threat_level = threatLevel;
    }
    
    if (source) {
      whereClause.source = source;
    }
    
    if (isActive !== null) {
      whereClause.is_active = isActive === 'true';
    }

    // Handle search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { indicators: { [Op.contains]: [search] } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    // Get total count
    const totalCount = await ThreatIntelligence.count({ where: whereClause });

    // Fetch threat intelligence with pagination
    const intelligence = await ThreatIntelligence.findAll({
      where: whereClause,
      limit,
      offset,
      order: [[sort, order.toUpperCase() as 'ASC' | 'DESC']]
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
      data: intelligence,
      pagination,
      count: intelligence.length
    });

  } catch (error) {
    console.error('API Error - threat-intelligence GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch threat intelligence',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/threat-intelligence:
 *   post:
 *     summary: Create new threat intelligence
 *     description: Submit new threat intelligence data for analysis and correlation
 *     tags:
 *       - Threat Intelligence
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - intel_type
 *               - source
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: "APT29 Cozy Bear Campaign Targeting Healthcare"
 *               description:
 *                 type: string
 *                 example: "Comprehensive analysis of APT29 targeting healthcare organizations with COVID-19 research"
 *               intel_type:
 *                 type: string
 *                 enum: [indicator, threat_actor, campaign, malware, vulnerability, tool, technique, infrastructure, report]
 *                 example: "campaign"
 *               source:
 *                 type: string
 *                 example: "Internal Research Team"
 *               confidence_level:
 *                 type: string
 *                 enum: [very_low, low, medium, high, very_high]
 *                 default: medium
 *                 example: "high"
 *               threat_level:
 *                 type: string
 *                 enum: [info, low, medium, high, critical]
 *                 default: medium
 *                 example: "critical"
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["203.0.113.100", "cozy-bear-c2.example.com", "wellmess.exe"]
 *               ttps:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["T1566.001", "T1003.001", "T1055"]
 *               affected_sectors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Healthcare", "Government", "Research"]
 *               geographical_regions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["North America", "Europe"]
 *               timeline:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     event:
 *                       type: string
 *                     details:
 *                       type: string
 *               attribution:
 *                 type: object
 *                 properties:
 *                   threat_actor:
 *                     type: string
 *                   country:
 *                     type: string
 *                   motivation:
 *                     type: string
 *                   confidence:
 *                     type: string
 *                 example:
 *                   threat_actor: "APT29"
 *                   country: "Russia"
 *                   motivation: "Espionage"
 *                   confidence: "high"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["apt29", "cozy-bear", "healthcare", "covid-19", "espionage"]
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               metadata:
 *                 type: object
 *                 example: {"classification": "TLP:AMBER", "report_id": "RPT-2024-001", "analyst": "security_team"}
 *           examples:
 *             apt_campaign:
 *               summary: APT Campaign Intelligence
 *               value:
 *                 title: "APT29 Targeting COVID-19 Research Organizations"
 *                 description: "Russian state-sponsored group APT29 conducting espionage campaign against vaccine research facilities"
 *                 intel_type: "campaign"
 *                 source: "Government Intelligence Sharing"
 *                 confidence_level: "very_high"
 *                 threat_level: "critical"
 *                 indicators: ["203.0.113.50", "wellmess-backdoor.exe", "covid-research-portal.com"]
 *                 ttps: ["T1566.001", "T1003.001", "T1055", "T1071.001"]
 *                 affected_sectors: ["Healthcare", "Pharmaceuticals", "Research"]
 *                 geographical_regions: ["North America", "Europe", "Asia"]
 *                 attribution:
 *                   threat_actor: "APT29 / Cozy Bear"
 *                   country: "Russia"
 *                   motivation: "State Espionage"
 *                   confidence: "very_high"
 *                 tags: ["apt29", "cozy-bear", "russia", "covid-19", "vaccine-research", "espionage"]
 *                 is_active: true
 *                 metadata:
 *                   classification: "TLP:AMBER"
 *                   campaign_name: "Operation COVID Intelligence"
 *                   first_observed: "2020-03-15"
 *             malware_analysis:
 *               summary: Malware Intelligence Report
 *               value:
 *                 title: "LockBit 3.0 Ransomware Analysis and IOCs"
 *                 description: "Technical analysis of LockBit 3.0 ransomware with indicators of compromise and defense recommendations"
 *                 intel_type: "malware"
 *                 source: "Malware Research Lab"
 *                 confidence_level: "high"
 *                 threat_level: "critical"
 *                 indicators: ["d1b2c3e4f5a6b7c8d9e0f1a2b3c4d5e6", "lockbit-payment-portal.onion", "lockbit3.exe"]
 *                 ttps: ["T1486", "T1490", "T1083", "T1135"]
 *                 affected_sectors: ["Financial", "Healthcare", "Manufacturing", "Government"]
 *                 geographical_regions: ["Global"]
 *                 tags: ["lockbit", "ransomware", "financial-crime", "encryption", "extortion"]
 *                 is_active: true
 *                 metadata:
 *                   malware_family: "LockBit"
 *                   version: "3.0"
 *                   analysis_date: "2024-01-15"
 *             vulnerability_intel:
 *               summary: Vulnerability Intelligence
 *               value:
 *                 title: "Zero-Day Exploitation in Microsoft Exchange"
 *                 description: "Active exploitation of previously unknown vulnerability in Microsoft Exchange servers"
 *                 intel_type: "vulnerability"
 *                 source: "Threat Hunting Team"
 *                 confidence_level: "high"
 *                 threat_level: "critical"
 *                 indicators: ["webshell.aspx", "/owa/auth/", "ProxyLogon"]
 *                 ttps: ["T1190", "T1505.003", "T1114.002"]
 *                 affected_sectors: ["All sectors using Exchange"]
 *                 geographical_regions: ["Global"]
 *                 tags: ["zero-day", "microsoft-exchange", "webshell", "apt", "proxylogon"]
 *                 is_active: true
 *                 metadata:
 *                   cve_id: "pending"
 *                   patch_available: false
 *                   exploit_complexity: "low"
 *     responses:
 *       201:
 *         description: Threat intelligence created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ThreatIntelligence'
 *                 message:
 *                   type: string
 *                   example: "Threat intelligence created successfully"
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
    if (!body.title || !body.intel_type || !body.source) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Title, intelligence type, and source are required'
        },
        { status: 400 }
      );
    }

    // Validate intelligence type
    const validIntelTypes = ['indicator', 'threat_actor', 'campaign', 'malware', 'vulnerability', 'tool', 'technique', 'infrastructure', 'report'];
    if (!validIntelTypes.includes(body.intel_type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: `Invalid intelligence type. Must be one of: ${validIntelTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate confidence level if provided
    if (body.confidence_level) {
      const validConfidenceLevels = ['very_low', 'low', 'medium', 'high', 'very_high'];
      if (!validConfidenceLevels.includes(body.confidence_level)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            message: `Invalid confidence level. Must be one of: ${validConfidenceLevels.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    // Validate threat level if provided
    if (body.threat_level) {
      const validThreatLevels = ['info', 'low', 'medium', 'high', 'critical'];
      if (!validThreatLevels.includes(body.threat_level)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            message: `Invalid threat level. Must be one of: ${validThreatLevels.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    // Set defaults for optional fields
    const intelligenceData: any = {
      title: body.title,
      description: body.description,
      intel_type: body.intel_type,
      source: body.source,
      confidence_level: body.confidence_level || 'medium',
      threat_level: body.threat_level || 'medium',
      indicators: body.indicators || [],
      ttps: body.ttps || [],
      affected_sectors: body.affected_sectors || [],
      geographical_regions: body.geographical_regions || [],
      timeline: body.timeline || [],
      attribution: body.attribution || {},
      tags: body.tags || [],
      is_active: body.is_active !== undefined ? body.is_active : true,
      metadata: body.metadata || {}
    };

    // Add optional date fields
    if (body.first_observed) {
      intelligenceData.first_observed = new Date(body.first_observed);
    }
    if (body.last_observed) {
      intelligenceData.last_observed = new Date(body.last_observed);
    }

    // Create the threat intelligence entry
    const intelligence = await ThreatIntelligence.create(intelligenceData);

    return NextResponse.json({
      success: true,
      data: intelligence,
      message: 'Threat intelligence created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error - threat-intelligence POST:', error);

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
        error: 'Failed to create threat intelligence',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
