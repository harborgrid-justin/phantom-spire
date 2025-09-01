import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Phantom Spire CTI Platform API',
      version: '1.0.0',
      description: 'Enterprise-grade Cyber Threat Intelligence Platform API',
      contact: {
        name: 'Phantom Spire Team',
        email: 'support@phantom-spire.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}/api/${config.API_VERSION}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        IOC: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            value: {
              type: 'string',
            },
            type: {
              type: 'string',
              enum: ['ip', 'domain', 'url', 'hash', 'email'],
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            source: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
