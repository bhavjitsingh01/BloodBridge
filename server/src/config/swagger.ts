import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BloodBridge API',
      description: 'AI-powered blood management ecosystem API documentation',
      version,
      contact: {
        name: 'BloodBridge Team',
        email: 'support@bloodbridge.com',
        url: 'https://bloodbridge.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.API_SERVER_URL || 'http://localhost:5001',
        description: 'Development Server',
      },
      {
        url: 'https://api.bloodbridge.com',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['Donor', 'Hospital', 'BloodBank', 'Admin'] },
          },
        },
        Hospital: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Point' },
                coordinates: { type: 'array', items: { type: 'number' } },
              },
            },
          },
        },
        BloodGroup: {
          type: 'string',
          enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
        },
        EmergencyRequest: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            requesterId: { type: 'string' },
            requesterType: { type: 'string', enum: ['Hospital', 'BloodBank'] },
            bloodGroup: { $ref: '#/components/schemas/BloodGroup' },
            unitsRequired: { type: 'number' },
            priority: { type: 'string', enum: ['Normal', 'High', 'Critical'] },
            status: { type: 'string', enum: ['Pending', 'Accepted', 'Completed', 'Cancelled'] },
            requiredBefore: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        BloodInventory: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            hospitalId: { type: 'string' },
            bloodGroup: { $ref: '#/components/schemas/BloodGroup' },
            units: { type: 'number' },
            status: { type: 'string', enum: ['Available', 'Reserved', 'Expired'] },
            expiryDate: { type: 'string', format: 'date-time' },
            collectionDate: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
