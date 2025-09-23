/**
 * API Documentation Route - Swagger/OpenAPI UI
 * Comprehensive API documentation for all endpoints
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateOpenAPISpec } from '../../../../../../../lib/api-docs/swagger/openapi-spec';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Get OpenAPI specification
 *     description: Returns the complete OpenAPI 3.0 specification for the API
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET(request: NextRequest) {
  try {
    // Generate OpenAPI specification
    const openApiSpec = generateOpenAPISpec();
    
    return NextResponse.json(openApiSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('API Documentation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate API documentation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
