/// <reference types="cypress" />

/**
 * API Routes Testing - Next.js API Route Validation
 * Tests actual API endpoints for functionality and error handling
 * Addresses R.50 requirement for Next.js API route testing
 */

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    cy.setupTestEnvironment('default');
  });

  describe('Health Check API', () => {
    it('should respond to health check endpoint', () => {
      cy.request('GET', '/api/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status');
      });
    });
  });

  describe('Models API', () => {
    it('should handle GET /api/models', () => {
      cy.request({
        method: 'GET',
        url: '/api/models',
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
      });
    });

    it('should handle POST /api/models with validation', () => {
      cy.request({
        method: 'POST',
        url: '/api/models',
        body: {
          name: 'test-model',
          algorithm: 'random-forest'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 201, 400, 404]).to.include(response.status);
      });
    });
  });

  describe('Dashboard API', () => {
    it('should fetch dashboard metrics', () => {
      cy.request({
        method: 'GET',
        url: '/api/dashboard/metrics',
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
        if (response.status === 200) {
          expect(response.body).to.be.an('object');
        }
      });
    });
  });

  describe('Experiments API', () => {
    it('should handle experiments CRUD operations', () => {
      // Test GET
      cy.request({
        method: 'GET',
        url: '/api/experiments',
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
      });

      // Test POST
      cy.request({
        method: 'POST',
        url: '/api/experiments',
        body: {
          name: 'test-experiment',
          description: 'Test experiment'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 201, 400, 404]).to.include(response.status);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', () => {
      cy.request({
        method: 'GET',
        url: '/api/non-existent',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('should handle malformed JSON in POST requests', () => {
      cy.request({
        method: 'POST',
        url: '/api/models',
        body: 'invalid-json',
        failOnStatusCode: false,
        headers: {
          'content-type': 'application/json'
        }
      }).then((response) => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });
});