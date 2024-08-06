const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Content Management API',
            version: '1.0.0',
            description: 'API for text submission, duplicate detection, and web crawling',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
        servers: [
            {
                url: process.env.PORT,
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to the API routes files
};

const specs = swaggerJsdoc(options);

module.exports = specs;