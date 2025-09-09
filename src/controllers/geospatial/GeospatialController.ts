/**
 * Geospatial Controller
 * API endpoints for geospatial threat intelligence operations
 */

import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { GeospatialService } from '../../services/geospatial/GeospatialService';
import { GeospatialBusinessLogic } from '../../services/business-logic/modules/geospatial/GeospatialBusinessLogic';

export class GeospatialController {
  private logger: typeof logger;
  private geospatialService: GeospatialService;
  private businessLogic: GeospatialBusinessLogic;

  constructor() {
    this.logger = logger;
    this.geospatialService = new GeospatialService();
    this.businessLogic = new GeospatialBusinessLogic();
  }

  /**
   * GET /api/geospatial/threats/nearby
   * Find threats near specified coordinates
   */
  findNearbyThreats = async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, radius = 50 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Missing required parameters: latitude, longitude'
        });
      }

      const threats = await this.geospatialService.findNearbyThreats(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseFloat(radius as string)
      );

      res.json({
        success: true,
        data: threats,
        count: threats.length,
        query: { latitude, longitude, radius }
      });
    } catch (error) {
      this.logger.error('Error finding nearby threats', error);
      res.status(500).json({
        error: 'Failed to find nearby threats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/geospatial/analysis
   * Perform geospatial threat analysis
   */
  performAnalysis = async (req: Request, res: Response) => {
    try {
      const { locationIds } = req.body;

      if (!locationIds || !Array.isArray(locationIds)) {
        return res.status(400).json({
          error: 'Invalid locationIds array required'
        });
      }

      const locations = await this.geospatialService.getLocationsByIds(locationIds);
      const analyses = await this.businessLogic.analyzeGeospatialThreats(locations);

      res.json({
        success: true,
        data: analyses,
        summary: {
          locationsAnalyzed: locations.length,
          analysesCompleted: analyses.length,
          averageConfidence: analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
        }
      });
    } catch (error) {
      this.logger.error('Error performing geospatial analysis', error);
      res.status(500).json({
        error: 'Failed to perform geospatial analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/geospatial/geocode
   * Geocode address to coordinates
   */
  geocodeAddress = async (req: Request, res: Response) => {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({
          error: 'Address is required'
        });
      }

      const coordinates = await this.geospatialService.geocodeAddress(address);

      res.json({
        success: true,
        data: coordinates,
        address
      });
    } catch (error) {
      this.logger.error('Error geocoding address', error);
      res.status(500).json({
        error: 'Failed to geocode address',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/geospatial/reverse-geocode
   * Reverse geocode coordinates to address
   */
  reverseGeocode = async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Latitude and longitude are required'
        });
      }

      const address = await this.geospatialService.reverseGeocode(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      res.json({
        success: true,
        data: { address },
        coordinates: { latitude, longitude }
      });
    } catch (error) {
      this.logger.error('Error reverse geocoding', error);
      res.status(500).json({
        error: 'Failed to reverse geocode',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/geospatial/geofence
   * Create a new geofence
   */
  createGeofence = async (req: Request, res: Response) => {
    try {
      const geofenceData = req.body;

      if (!geofenceData.name || !geofenceData.coordinates || !geofenceData.type) {
        return res.status(400).json({
          error: 'Name, coordinates, and type are required'
        });
      }

      const geofence = await this.geospatialService.createGeofence(geofenceData);

      res.status(201).json({
        success: true,
        data: geofence
      });
    } catch (error) {
      this.logger.error('Error creating geofence', error);
      res.status(500).json({
        error: 'Failed to create geofence',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/geospatial/ip-location/:ip
   * Get geolocation for IP address
   */
  getIpGeolocation = async (req: Request, res: Response) => {
    try {
      const { ip } = req.params;

      if (!ip) {
        return res.status(400).json({
          error: 'IP address is required'
        });
      }

      const location = await this.geospatialService.getIpGeolocation(ip);

      res.json({
        success: true,
        data: location,
        ip
      });
    } catch (error) {
      this.logger.error('Error getting IP geolocation', error);
      res.status(500).json({
        error: 'Failed to get IP geolocation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/geospatial/spatial-clusters
   * Analyze spatial clustering of locations
   */
  analyzeSpatialClusters = async (req: Request, res: Response) => {
    try {
      const { locationIds } = req.body;

      if (!locationIds || !Array.isArray(locationIds)) {
        return res.status(400).json({
          error: 'LocationIds array is required'
        });
      }

      const locations = await this.geospatialService.getLocationsByIds(locationIds);
      const clusterAnalysis = await this.geospatialService.analyzeSpatialClusters(locations);

      res.json({
        success: true,
        data: clusterAnalysis,
        inputLocations: locations.length
      });
    } catch (error) {
      this.logger.error('Error analyzing spatial clusters', error);
      res.status(500).json({
        error: 'Failed to analyze spatial clusters',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/geospatial/heat-map
   * Generate threat heat map data
   */
  generateHeatMap = async (req: Request, res: Response) => {
    try {
      const { locationIds, gridSize } = req.body;

      if (!locationIds || !Array.isArray(locationIds)) {
        return res.status(400).json({
          error: 'LocationIds array is required'
        });
      }

      // For demonstration, convert locations to mock threats
      const locations = await this.geospatialService.getLocationsByIds(locationIds);
      const mockThreats = locations.map(location => ({
        id: `threat-${location.id}`,
        location,
        threatType: 'generic',
        severity: 'medium' as const,
        description: 'Mock threat for heat map',
        indicators: [],
        firstSeen: new Date(),
        lastSeen: new Date()
      }));

      const heatMapData = await this.geospatialService.generateThreatHeatMap(
        mockThreats,
        gridSize
      );

      res.json({
        success: true,
        data: heatMapData,
        inputThreats: mockThreats.length
      });
    } catch (error) {
      this.logger.error('Error generating heat map', error);
      res.status(500).json({
        error: 'Failed to generate heat map',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/geospatial/asset-movement/:assetId
   * Track asset movement over time
   */
  trackAssetMovement = async (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;
      const { startDate, endDate } = req.query;

      if (!assetId) {
        return res.status(400).json({
          error: 'Asset ID is required'
        });
      }

      const timeRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 86400000), // 24h ago
        end: endDate ? new Date(endDate as string) : new Date()
      };

      const movementData = await this.geospatialService.trackAssetMovement(assetId, timeRange);

      res.json({
        success: true,
        data: movementData
      });
    } catch (error) {
      this.logger.error('Error tracking asset movement', error);
      res.status(500).json({
        error: 'Failed to track asset movement',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/geospatial/reports/threat-report
   * Generate comprehensive geospatial threat report
   */
  generateThreatReport = async (req: Request, res: Response) => {
    try {
      const { locationIds } = req.body;

      if (!locationIds || !Array.isArray(locationIds)) {
        return res.status(400).json({
          error: 'LocationIds array is required'
        });
      }

      const report = await this.businessLogic.generateGeospatialThreatReport(locationIds);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      this.logger.error('Error generating threat report', error);
      res.status(500).json({
        error: 'Failed to generate threat report',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}