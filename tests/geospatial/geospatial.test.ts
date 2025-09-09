/**
 * Geospatial Service Tests
 * Unit tests for geospatial functionality
 */

import { GeospatialService } from '../../src/services/geospatial/GeospatialService';
import { GeospatialBusinessLogic } from '../../src/services/business-logic/modules/geospatial/GeospatialBusinessLogic';

describe('GeospatialService', () => {
  let geospatialService: GeospatialService;

  beforeEach(() => {
    geospatialService = new GeospatialService();
  });

  describe('findNearbyThreats', () => {
    it('should find threats within specified radius', async () => {
      const latitude = 37.7749;
      const longitude = -122.4194;
      const radius = 50;

      const threats = await geospatialService.findNearbyThreats(latitude, longitude, radius);

      expect(Array.isArray(threats)).toBe(true);
      expect(threats.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('geocodeAddress', () => {
    it('should return coordinates for an address', async () => {
      const address = '123 Main St, San Francisco, CA';

      const coordinates = await geospatialService.geocodeAddress(address);

      expect(coordinates).toHaveProperty('latitude');
      expect(coordinates).toHaveProperty('longitude');
      expect(typeof coordinates.latitude).toBe('number');
      expect(typeof coordinates.longitude).toBe('number');
    });
  });

  describe('reverseGeocode', () => {
    it('should return address for coordinates', async () => {
      const latitude = 37.7749;
      const longitude = -122.4194;

      const address = await geospatialService.reverseGeocode(latitude, longitude);

      expect(typeof address).toBe('string');
      expect(address.length).toBeGreaterThan(0);
    });
  });

  describe('getIpGeolocation', () => {
    it('should return location data for IP address', async () => {
      const ipAddress = '8.8.8.8';

      const location = await geospatialService.getIpGeolocation(ipAddress);

      expect(location).toHaveProperty('id');
      expect(location).toHaveProperty('latitude');
      expect(location).toHaveProperty('longitude');
      expect(location).toHaveProperty('country');
    });
  });

  describe('createGeofence', () => {
    it('should create a new geofence', async () => {
      const geofenceData = {
        name: 'Test Geofence',
        coordinates: [{ latitude: 37.7749, longitude: -122.4194 }],
        radius: 10,
        type: 'circle' as const,
        alertsEnabled: true
      };

      const geofence = await geospatialService.createGeofence(geofenceData);

      expect(geofence).toHaveProperty('id');
      expect(geofence.name).toBe(geofenceData.name);
      expect(geofence.type).toBe(geofenceData.type);
      expect(geofence.alertsEnabled).toBe(geofenceData.alertsEnabled);
    });
  });
});

describe('GeospatialBusinessLogic', () => {
  let businessLogic: GeospatialBusinessLogic;

  beforeEach(() => {
    businessLogic = new GeospatialBusinessLogic();
  });

  describe('analyzeGeospatialThreats', () => {
    it('should analyze threats for given locations', async () => {
      const locations = [
        {
          id: 'loc-1',
          latitude: 37.7749,
          longitude: -122.4194,
          address: 'San Francisco, CA',
          country: 'US',
          region: 'California',
          timezone: 'America/Los_Angeles'
        }
      ];

      const analyses = await businessLogic.analyzeGeospatialThreats(locations);

      expect(Array.isArray(analyses)).toBe(true);
      expect(analyses).toHaveLength(1);
      expect(analyses[0]).toHaveProperty('locationId');
      expect(analyses[0]).toHaveProperty('confidence');
      expect(analyses[0]).toHaveProperty('results');
      expect(analyses[0].confidence).toBeGreaterThan(0);
      expect(analyses[0].confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('generateGeospatialThreatReport', () => {
    it('should generate comprehensive threat report', async () => {
      const locationIds = ['loc-1', 'loc-2'];

      const report = await businessLogic.generateGeospatialThreatReport(locationIds);

      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('locations');
      expect(report).toHaveProperty('analyses');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('recommendations');
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.locations).toBe(locationIds.length);
    });
  });
});