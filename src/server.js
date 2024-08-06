// Import required modules
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const connectDB = require('./config/database');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

/* Import route modules */
const authRoutes = require('./routes/authRoutes')
const textRoutes = require('./routes/textRoutes');
const crawlerRoutes = require('./routes/crawlerRoutes');
const { protect, authorize } = require('./middleware/auth');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Add security headers
app.use(helmet());

// Set up rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to database
connectDB();

// Parse JSON bodies (limit to 10kb)
app.use(express.json({ limit: '10kb' }));

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// Use authentication routes (unprotected)
app.use('/auth', authRoutes)

// Protect all routes below this middleware
app.use(protect)

// Use text-related routes (protected)
app.use('/api/text', textRoutes)

// Use crawler routes (protected and admin-only)
app.use('/api/', authorize('admin'), crawlerRoutes)

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
    })
})