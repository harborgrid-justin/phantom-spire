import request from 'supertest';
import { app } from '../index';

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });
});

describe('API Info', () => {
  it('should return API information', async () => {
    const response = await request(app).get('/api/v1/').expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('endpoints');
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route').expect(404);

    expect(response.body).toHaveProperty('error', 'Route not found');
  });
});
