// Import required modules
const express = require('express');
const authController = require('../controllers/authController'); // Controller for authentication operations
const { body } = require('express-validator'); // For input validation
const validate = require('../middleware/validate'); // Custom validation middleware

// Create a new router instance
const router = express.Router();

// POST route for user registration
router.post('/register', [
    // Validate username: must be at least 3 characters long
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    // Validate email: must be a valid email address
    body('email').isEmail().withMessage('Must be a valid email address'),
    // Validate password: must be at least 6 characters long
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    // Apply custom validation middleware
    validate
],
    // Call the register controller method
    authController.register);

// POST route for user login
router.post('/login', [
    // Validate username: must not be empty
    body('username').notEmpty().withMessage('Username is required'),
    // Validate password: must not be empty
    body('password').notEmpty().withMessage('Password is required'),
    // Apply custom validation middleware
    validate
], 
    // Call the login controller method
    authController.login);

// Export the router for use in other parts of the application
module.exports = router;