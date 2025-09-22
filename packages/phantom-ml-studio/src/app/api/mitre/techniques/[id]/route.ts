/**
 * MITRE Technique Detail API Route
 * GET /api/mitre/techniques/[id] - Get detailed information about a specific technique
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Get technique details
    const techniqueResult = await query(
      'SELECT * FROM mitre_techniques WHERE mitre_id = $1',
      [id]
    );

    if (techniqueResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Technique not found', techniqueId: id },
        { status: 404 }
      );
    }

    const technique = techniqueResult.rows[0];

    // Get related data
    const [tacticsResult, mitigationsResult, groupsResult, softwareResult] = await Promise.all([
      // Get tactics for this technique
      query(
        `SELECT * FROM mitre_tactics WHERE mitre_id = ANY($1)`,
        [technique.tactics || []]
      ),
      // Get mitigations that address this technique
      query(
        `SELECT * FROM mitre_mitigations WHERE $1 = ANY(techniques_addressed)`,
        [id]
      ),
      // Get groups that use this technique
      query(
        `SELECT * FROM mitre_groups WHERE $1 = ANY(techniques_used)`,
        [id]
      ),
      // Get software that uses this technique
      query(
        `SELECT * FROM mitre_software WHERE $1 = ANY(techniques_used)`,
        [id]
      )
    ]);

    // Get sub-techniques if this is a parent technique
    const subTechniquesResult = await query(
      'SELECT * FROM mitre_techniques WHERE parent_technique = $1',
      [id]
    );

    // Get parent technique if this is a sub-technique
    let parentTechnique = null;
    if (technique.parent_technique) {
      const parentResult = await query(
        'SELECT * FROM mitre_techniques WHERE mitre_id = $1',
        [technique.parent_technique]
      );
      parentTechnique = parentResult.rows[0] || null;
    }

    const response = {
      technique,
      relatedData: {
        tactics: tacticsResult.rows,
        mitigations: mitigationsResult.rows,
        groups: groupsResult.rows,
        software: softwareResult.rows,
        subTechniques: subTechniquesResult.rows,
        parentTechnique
      },
      metadata: {
        hasSubTechniques: subTechniquesResult.rows.length > 0,
        isSubTechnique: technique.is_sub_technique,
        relatedCount: {
          tactics: tacticsResult.rows.length,
          mitigations: mitigationsResult.rows.length,
          groups: groupsResult.rows.length,
          software: softwareResult.rows.length,
          subTechniques: subTechniquesResult.rows.length
        }
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Technique detail API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        techniqueId: params.id 
      },
      { status: 500 }
    );
  }
}