// IOC Service Layer with caching and performance optimization
import { models } from '@/lib/database';
import { IOCCore, IOCType, Severity, IOC } from 'phantom-ioc-core';
import { Op } from 'sequelize';

// Simple in-memory cache for performance
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

export class IOCService {
  private static iocCore: IOCCore | null = null;

  private static async getIOCCore(): Promise<IOCCore> {
    if (!this.iocCore) {
      this.iocCore = await IOCCore.new();
    }
    return this.iocCore;
  }

  // Get IOCs with caching and parallel processing
  static async getIOCs(filters: any = {}, pagination: any = {}): Promise<any> {
    const cacheKey = `iocs:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.type) where.indicator_type = filters.type;
    if (filters.severity) where.severity = filters.severity;
    if (filters.minConfidence) where.confidence = { [Op.gte]: parseFloat(filters.minConfidence) };
    if (filters.status) where.status = filters.status;

    if (filters.search) {
      where[Op.or] = [
        { value: { [Op.iLike]: `%${filters.search}%` } },
        { source: { [Op.iLike]: `%${filters.search}%` } },
        { tags: { [Op.contains]: [filters.search] } }
      ];
    }

    // Parallel fetch of IOCs and count
    const [iocsResult, countResult] = await Promise.all([
      models.IOC.findAll({
        where,
        include: [
          {
            model: models.AnalysisResult,
            as: 'analysis_results',
            order: [['processing_timestamp', 'DESC']],
            limit: 1
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      }),
      models.IOC.count({ where })
    ]);

    // Transform data
    const transformedIOCs = iocsResult.map((ioc: any) => ({
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
    }));

    const result = {
      iocs: transformedIOCs,
      pagination: {
        page,
        limit,
        total: countResult,
        pages: Math.ceil(countResult / limit)
      }
    };

    cache.set(cacheKey, result);
    return result;
  }

  // Create IOC with analysis
  static async createIOC(iocData: any): Promise<any> {
    const { indicator_type, value, confidence, severity, source, tags, context } = iocData;

    // Create IOC in database
    const ioc = await models.IOC.create({
      indicator_type,
      value,
      confidence: confidence || 0.5,
      severity: severity || 'medium',
      source,
      tags: tags || [],
      context: context || { metadata: {} }
    });

    // Process with IOC Core
    const core = await this.getIOCCore();
    const processedIOC: IOC = {
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

    const result = await core.process_ioc(processedIOC);

    // Save analysis result
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

    // Clear cache
    cache.clear();

    return await this.getIOCById(ioc.id);
  }

  // Get single IOC by ID
  static async getIOCById(id: string): Promise<any> {
    const cacheKey = `ioc:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

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

    if (!ioc) return null;

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

    cache.set(cacheKey, transformedIOC);
    return transformedIOC;
  }

  // Bulk operations with parallel processing
  static async bulkOperation(operation: string, iocIds: string[], updates?: any): Promise<any> {
    const results: any[] = [];
    const errors: any[] = [];

    switch (operation) {
      case 'delete':
        // Parallel delete operations
        const deletePromises = iocIds.map(async (id) => {
          try {
            const ioc = await models.IOC.findByPk(id);
            if (ioc) {
              await ioc.destroy();
              return { id, status: 'deleted' };
            } else {
              return { id, error: 'IOC not found' };
            }
          } catch (error) {
            console.error(`Error deleting IOC ${id}:`, error);
            return { id, error: 'Failed to delete IOC' };
          }
        });

        const deleteResults = await Promise.all(deletePromises);
        results.push(...deleteResults.filter(r => !r.error));
        errors.push(...deleteResults.filter(r => r.error));
        break;

      case 'reanalyze':
        const core = await this.getIOCCore();

        // Parallel re-analysis
        const reanalyzePromises = iocIds.map(async (id) => {
          try {
            const ioc = await models.IOC.findByPk(id);
            if (ioc) {
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

              return { id, status: 'reanalyzed' };
            } else {
              return { id, error: 'IOC not found' };
            }
          } catch (error) {
            console.error(`Error reanalyzing IOC ${id}:`, error);
            return { id, error: 'Failed to reanalyze IOC' };
          }
        });

        const reanalyzeResults = await Promise.all(reanalyzePromises);
        results.push(...reanalyzeResults.filter(r => !r.error));
        errors.push(...reanalyzeResults.filter(r => r.error));
        break;

      case 'update':
        // Parallel update operations
        const updatePromises = iocIds.map(async (id) => {
          try {
            const ioc = await models.IOC.findByPk(id);
            if (ioc) {
              await ioc.update(updates);
              return { id, status: 'updated' };
            } else {
              return { id, error: 'IOC not found' };
            }
          } catch (error) {
            console.error(`Error updating IOC ${id}:`, error);
            return { id, error: 'Failed to update IOC' };
          }
        });

        const updateResults = await Promise.all(updatePromises);
        results.push(...updateResults.filter(r => !r.error));
        errors.push(...updateResults.filter(r => r.error));
        break;
    }

    // Clear cache after bulk operations
    cache.clear();

    return {
      operation,
      results,
      errors,
      summary: {
        total: iocIds.length,
        successful: results.length,
        failed: errors.length
      }
    };
  }

  // Get IOC statistics
  static async getStatistics(): Promise<any> {
    const cacheKey = 'ioc_stats';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const [totalIOCs, severityStats, typeStats, statusStats] = await Promise.all([
      models.IOC.count(),
      models.IOC.findAll({
        attributes: [
          'severity',
          [models.IOC.sequelize!.fn('COUNT', models.IOC.sequelize!.col('id')), 'count']
        ],
        group: ['severity']
      }),
      models.IOC.findAll({
        attributes: [
          'indicator_type',
          [models.IOC.sequelize!.fn('COUNT', models.IOC.sequelize!.col('id')), 'count']
        ],
        group: ['indicator_type']
      }),
      models.IOC.findAll({
        attributes: [
          'status',
          [models.IOC.sequelize!.fn('COUNT', models.IOC.sequelize!.col('id')), 'count']
        ],
        group: ['status']
      })
    ]);

    const stats = {
      total: totalIOCs,
      bySeverity: severityStats.reduce((acc: any, stat: any) => {
        acc[stat.severity] = parseInt(stat.dataValues.count);
        return acc;
      }, {}),
      byType: typeStats.reduce((acc: any, stat: any) => {
        acc[stat.indicator_type] = parseInt(stat.dataValues.count);
        return acc;
      }, {}),
      byStatus: statusStats.reduce((acc: any, stat: any) => {
        acc[stat.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {})
    };

    cache.set(cacheKey, stats, 10 * 60 * 1000); // Cache for 10 minutes
    return stats;
  }

  // Clear cache (useful for maintenance)
  static clearCache(): void {
    cache.clear();
  }
}
