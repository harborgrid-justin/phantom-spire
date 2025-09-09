/**
 * Geospatial API Routes
 * RESTful API endpoints for geospatial operations
 */

import { Router } from 'express';
import { GeospatialController } from '../../controllers/geospatial/GeospatialController';

const router = Router();
const geospatialController = new GeospatialController();

// Threat analysis endpoints
router.get('/threats/nearby', geospatialController.findNearbyThreats);
router.post('/analysis', geospatialController.performAnalysis);

// Geocoding endpoints
router.post('/geocode', geospatialController.geocodeAddress);
router.post('/reverse-geocode', geospatialController.reverseGeocode);

// Geofencing endpoints
router.post('/geofence', geospatialController.createGeofence);

// IP geolocation endpoints
router.get('/ip-location/:ip', geospatialController.getIpGeolocation);

// Spatial analysis endpoints
router.post('/spatial-clusters', geospatialController.analyzeSpatialClusters);
router.post('/heat-map', geospatialController.generateHeatMap);

// Asset tracking endpoints
router.get('/asset-movement/:assetId', geospatialController.trackAssetMovement);

// Reporting endpoints
router.post('/reports/threat-report', geospatialController.generateThreatReport);

export default router;