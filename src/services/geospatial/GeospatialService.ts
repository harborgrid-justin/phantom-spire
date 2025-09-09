/**
 * Geospatial Service
 * Core service for geospatial operations and data management
 */

import { logger } from '../../utils/logger';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeospatialLocation {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  country: string;
  region: string;
  timezone: string;
}

interface GeospatialThreat {
  id: string;
  location: GeospatialLocation;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  indicators: string[];
  firstSeen: Date;
  lastSeen: Date;
}

interface GeofenceRegion {
  id: string;
  name: string;
  coordinates: Coordinates[];
  radius?: number;
  type: 'circle' | 'polygon';
  alertsEnabled: boolean;
}

export class GeospatialService {
  private logger: typeof logger;

  constructor() {
    this.logger = logger;
  }

  /**
   * Find threats within a specified radius of coordinates
   */
  async findNearbyThreats(latitude: number, longitude: number, radiusKm: number): Promise<GeospatialThreat[]> {
    try {
      this.logger.info('Finding nearby threats', { latitude, longitude, radiusKm });

      // In a real implementation, this would query a geospatial database
      const mockThreats: GeospatialThreat[] = [
        {
          id: 'threat-1',
          location: {
            id: 'loc-1',
            latitude: latitude + 0.01,
            longitude: longitude + 0.01,
            address: 'Nearby Location 1',
            country: 'US',
            region: 'California',
            timezone: 'America/Los_Angeles'
          },
          threatType: 'malware',
          severity: 'high',
          description: 'Malware activity detected',
          indicators: ['suspicious_file_hash', 'network_communication'],
          firstSeen: new Date(Date.now() - 86400000),
          lastSeen: new Date()
        }
      ];

      return mockThreats.filter(threat => 
        this.calculateDistance(latitude, longitude, threat.location.latitude, threat.location.longitude) <= radiusKm
      );
    } catch (error) {
      this.logger.error('Error finding nearby threats', error);
      throw new Error('Failed to find nearby threats');
    }
  }

  /**
   * Get locations by IDs
   */
  async getLocationsByIds(locationIds: string[]): Promise<GeospatialLocation[]> {
    try {
      this.logger.info('Getting locations by IDs', { locationIds });

      // Mock implementation
      return locationIds.map(id => ({
        id,
        latitude: 37.7749 + Math.random() * 0.1,
        longitude: -122.4194 + Math.random() * 0.1,
        address: `Location ${id}`,
        country: 'US',
        region: 'California',
        timezone: 'America/Los_Angeles'
      }));
    } catch (error) {
      this.logger.error('Error getting locations', error);
      throw new Error('Failed to get locations');
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<Coordinates> {
    try {
      this.logger.info('Geocoding address', { address });
      
      // Mock implementation - in practice would use Google Maps, OpenStreetMap, etc.
      return {
        latitude: 37.7749 + Math.random() * 0.1,
        longitude: -122.4194 + Math.random() * 0.1
      };
    } catch (error) {
      this.logger.error('Error geocoding address', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      this.logger.info('Reverse geocoding coordinates', { latitude, longitude });
      
      // Mock implementation
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      this.logger.error('Error reverse geocoding', error);
      throw new Error('Failed to reverse geocode');
    }
  }

  /**
   * Check if coordinates are within a geofence
   */
  isWithinGeofence(coordinates: Coordinates, geofence: GeofenceRegion): boolean {
    try {
      if (geofence.type === 'circle' && geofence.radius && geofence.coordinates.length === 1) {
        const distance = this.calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          geofence.coordinates[0].latitude,
          geofence.coordinates[0].longitude
        );
        return distance <= geofence.radius;
      }

      if (geofence.type === 'polygon') {
        return this.pointInPolygon(coordinates, geofence.coordinates);
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking geofence', error);
      return false;
    }
  }

  /**
   * Point-in-polygon algorithm for complex geofences
   */
  private pointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].latitude > point.latitude) !== (polygon[j].latitude > point.latitude)) &&
          (point.longitude < (polygon[j].longitude - polygon[i].longitude) * 
           (point.latitude - polygon[i].latitude) / (polygon[j].latitude - polygon[i].latitude) + polygon[i].longitude)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  /**
   * Create a new geofence region
   */
  async createGeofence(geofence: Omit<GeofenceRegion, 'id'>): Promise<GeofenceRegion> {
    try {
      this.logger.info('Creating geofence', { name: geofence.name, type: geofence.type });

      const newGeofence: GeofenceRegion = {
        id: `geofence-${Date.now()}`,
        ...geofence
      };

      // In a real implementation, this would save to database
      this.logger.info('Geofence created successfully', { id: newGeofence.id });
      
      return newGeofence;
    } catch (error) {
      this.logger.error('Error creating geofence', error);
      throw new Error('Failed to create geofence');
    }
  }

  /**
   * Get IP geolocation data
   */
  async getIpGeolocation(ipAddress: string): Promise<GeospatialLocation> {
    try {
      this.logger.info('Getting IP geolocation', { ipAddress });

      // Mock implementation - in practice would use MaxMind, IPStack, etc.
      const mockLocation: GeospatialLocation = {
        id: `ip-${ipAddress}`,
        latitude: 37.7749 + (Math.random() - 0.5) * 10,
        longitude: -122.4194 + (Math.random() - 0.5) * 10,
        address: 'Unknown Location',
        country: 'US',
        region: 'Unknown',
        timezone: 'America/Los_Angeles'
      };

      return mockLocation;
    } catch (error) {
      this.logger.error('Error getting IP geolocation', error);
      throw new Error('Failed to get IP geolocation');
    }
  }

  /**
   * Analyze spatial clustering of locations
   */
  async analyzeSpatialClusters(locations: GeospatialLocation[]): Promise<any> {
    try {
      this.logger.info('Analyzing spatial clusters', { locationCount: locations.length });

      // Simple clustering algorithm for demonstration
      const clusters = [];
      const clusterRadius = 10; // 10km

      for (const location of locations) {
        let assignedToCluster = false;

        for (const cluster of clusters) {
          const distanceToCenter = this.calculateDistance(
            location.latitude,
            location.longitude,
            cluster.center.latitude,
            cluster.center.longitude
          );

          if (distanceToCenter <= clusterRadius) {
            cluster.locations.push(location);
            assignedToCluster = true;
            break;
          }
        }

        if (!assignedToCluster) {
          clusters.push({
            center: { latitude: location.latitude, longitude: location.longitude },
            locations: [location],
            radius: clusterRadius
          });
        }
      }

      return {
        clusterCount: clusters.length,
        clusters: clusters.map(cluster => ({
          center: cluster.center,
          locationCount: cluster.locations.length,
          radius: cluster.radius,
          density: cluster.locations.length / (Math.PI * Math.pow(cluster.radius, 2))
        }))
      };
    } catch (error) {
      this.logger.error('Error analyzing spatial clusters', error);
      throw new Error('Failed to analyze spatial clusters');
    }
  }

  /**
   * Generate heat map data for threat density
   */
  async generateThreatHeatMap(threats: GeospatialThreat[], gridSize: number = 0.01): Promise<any> {
    try {
      this.logger.info('Generating threat heat map', { threatCount: threats.length, gridSize });

      const heatMapData = new Map<string, number>();

      for (const threat of threats) {
        const gridLat = Math.floor(threat.location.latitude / gridSize) * gridSize;
        const gridLng = Math.floor(threat.location.longitude / gridSize) * gridSize;
        const gridKey = `${gridLat},${gridLng}`;

        const weight = this.getThreatWeight(threat.severity);
        heatMapData.set(gridKey, (heatMapData.get(gridKey) || 0) + weight);
      }

      const heatMapPoints = Array.from(heatMapData.entries()).map(([key, intensity]) => {
        const [lat, lng] = key.split(',').map(Number);
        return {
          latitude: lat,
          longitude: lng,
          intensity
        };
      });

      return {
        gridSize,
        points: heatMapPoints,
        maxIntensity: Math.max(...heatMapPoints.map(p => p.intensity)),
        totalThreats: threats.length
      };
    } catch (error) {
      this.logger.error('Error generating threat heat map', error);
      throw new Error('Failed to generate threat heat map');
    }
  }

  /**
   * Get threat weight based on severity
   */
  private getThreatWeight(severity: string): number {
    const weights = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
    return weights[severity as keyof typeof weights] || 1;
  }

  /**
   * Track asset movement over time
   */
  async trackAssetMovement(assetId: string, timeRange: { start: Date; end: Date }): Promise<any> {
    try {
      this.logger.info('Tracking asset movement', { assetId, timeRange });

      // Mock movement data
      const movements = [];
      const startTime = timeRange.start.getTime();
      const endTime = timeRange.end.getTime();
      const interval = (endTime - startTime) / 10; // 10 data points

      for (let i = 0; i <= 10; i++) {
        movements.push({
          timestamp: new Date(startTime + (interval * i)),
          latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
          address: `Location ${i + 1}`,
          speed: Math.random() * 60, // km/h
          heading: Math.random() * 360 // degrees
        });
      }

      return {
        assetId,
        timeRange,
        movements,
        totalDistance: this.calculateTotalDistance(movements),
        averageSpeed: movements.reduce((sum, m) => sum + m.speed, 0) / movements.length
      };
    } catch (error) {
      this.logger.error('Error tracking asset movement', error);
      throw new Error('Failed to track asset movement');
    }
  }

  /**
   * Calculate total distance traveled
   */
  private calculateTotalDistance(movements: any[]): number {
    let totalDistance = 0;

    for (let i = 1; i < movements.length; i++) {
      const distance = this.calculateDistance(
        movements[i - 1].latitude,
        movements[i - 1].longitude,
        movements[i].latitude,
        movements[i].longitude
      );
      totalDistance += distance;
    }

    return totalDistance;
  }
}