import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Klipit Pro API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for Klipit Pro - Secure Clipboard with Pro Features',
      contact: {
        name: 'Klipit Team',
        email: 'support@klipit-pro.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.klipit-pro.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token',
        },
      },
    },
  },
  apis: [
    './src/routes/auth.ts',
    './src/routes/clipboard.ts',
    './src/routes/upload.ts',
    './src/routes/pro.ts',
    './src/index.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
