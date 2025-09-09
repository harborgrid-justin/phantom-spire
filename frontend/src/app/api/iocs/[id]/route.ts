// API routes for individual IOC operations
import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/database';
import { IOCCore, IOCType, Severity, IOC } from 'phantom-ioc-core';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/iocs/[id] - Get single IOC
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const ioc = await models.IOC.findByPk(id, {
      include: [
        {
          model: models.AnalysisResult,
          as: 'analysis_results',
          order: [['processing_timestamp', 'DESC']],
          limit: 1
        }
      ]
    });

    if (!ioc) {
      return NextResponse.json(
        { error: 'IOC not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedIOC = {
      id: ioc.id,
      indicator_type: ioc.indicator_type,
      value: ioc.value,
      confidence: ioc.confidence,
      severity: ioc.severity,
      source: ioc.source,
      timestamp: ioc.timestamp,
      tags: ioc.tags,
      context: ioc.context,
      status: ioc.status,
      analysis: ioc.analysis_results?.[0] ? {
        threat_actors: ioc.analysis_results[0].threat_actors,
        campaigns: ioc.analysis_results[0].campaigns,
        malware_families: ioc.analysis_results[0].malware_families,
        attack_vectors: ioc.analysis_results[0].attack_vectors,
        impact_assessment: ioc.analysis_results[0].impact_assessment,
        recommendations: ioc.analysis_results[0].recommendations
      } : null
    };

    return NextResponse.json({ ioc: transformedIOC });
  } catch (error) {
    console.error('Error fetching IOC:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IOC' },
      { status: 500 }
    );
  }
}

// PUT /api/iocs/[id] - Update IOC
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { confidence, severity, tags, context, status } = body;

    // Find IOC
    const ioc = await models.IOC.findByPk(id);
    if (!ioc) {
      return NextResponse.json(
        { error: 'IOC not found' },
        { status: 404 }
      );
    }

    // Update IOC
    await ioc.update({
      confidence: confidence !== undefined ? confidence : ioc.confidence,
      severity: severity !== undefined ? severity : ioc.severity,
      tags: tags !== undefined ? tags : ioc.tags,
      context: context !== undefined ? context : ioc.context,
      status: status !== undefined ? status : ioc.status
    });

    // If re-analysis is requested, process again
    if (body.reanalyze) {
      const core = await IOCCore.new();
      const iocData: IOC = {
        id: ioc.id,
        indicator_type: ioc.indicator_type as IOCType,
        value: ioc.value,
        confidence: ioc.confidence,
        severity: ioc.severity as Severity,
        source: ioc.source,
        timestamp: ioc.timestamp,
        tags: ioc.tags,
        context: ioc.context
      };

      const result = await core.process_ioc(iocData);

      // Save new analysis result
      await models.AnalysisResult.create({
        ioc_id: ioc.id,
        threat_actors: result.analysis.threat_actors,
        campaigns: result.analysis.campaigns,
        malware_families: result.analysis.malware_families,
        attack_vectors: result.analysis.attack_vectors,
        impact_assessment: result.analysis.impact_assessment,
        recommendations: result.analysis.recommendations,
        processing_timestamp: result.processing_timestamp
      });
    }

    // Return updated IOC with latest analysis
    const updatedIOC = await models.IOC.findByPk(id, {
      include: [
        {
          model: models.AnalysisResult,
          as: 'analysis_results',
          order: [['processing_timestamp', 'DESC']],
          limit: 1
        }
      ]
    });

    const transformedIOC = {
      id: updatedIOC!.id,
      indicator_type: updatedIOC!.indicator_type,
      value: updatedIOC!.value,
      confidence: updatedIOC!.confidence,
      severity: updatedIOC!.severity,
      source: updatedIOC!.source,
      timestamp: updatedIOC!.timestamp,
      tags: updatedIOC!.tags,
      context: updatedIOC!.context,
      status: updatedIOC!.status,
      analysis: updatedIOC!.analysis_results?.[0] ? {
        threat_actors: updatedIOC!.analysis_results[0].threat_actors,
        campaigns: updatedIOC!.analysis_results[0].campaigns,
        malware_families: updatedIOC!.analysis_results[0].malware_families,
        attack_vectors: updatedIOC!.analysis_results[0].attack_vectors,
        impact_assessment: updatedIOC!.analysis_results[0].impact_assessment,
        recommendations: updatedIOC!.analysis_results[0].recommendations
      } : null
    };

    return NextResponse.json({ ioc: transformedIOC });
  } catch (error) {
    console.error('Error updating IOC:', error);
    return NextResponse.json(
      { error: 'Failed to update IOC' },
      { status: 500 }
    );
  }
}

// DELETE /api/iocs/[id] - Delete IOC
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const ioc = await models.IOC.findByPk(id);
    if (!ioc) {
      return NextResponse.json(
        { error: 'IOC not found' },
        { status: 404 }
      );
    }

    await ioc.destroy();

    return NextResponse.json({ message: 'IOC deleted successfully' });
  } catch (error) {
    console.error('Error deleting IOC:', error);
    return NextResponse.json(
      { error: 'Failed to delete IOC' },
      { status: 500 }
    );
  }
}
