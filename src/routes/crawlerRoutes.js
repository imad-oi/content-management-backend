// Import required modules
const express = require('express');
const { body } = require('express-validator'); // For input validation
const validate = require('../middleware/validate'); // Custom validation middleware
const crawlerController = require('../controllers/crawlerController'); // Controller for crawler operations

// Create a new router instance
const router = express.Router();

// POST route for crawling and comparing content
router.post('/crawl-and-compare',
  [
    // Validate that 'urls' is an array
    body('urls').isArray().withMessage('URLs must be provided as an array'),
    // Validate that each item in the 'urls' array is a valid URL
    body('urls.*').isURL().withMessage('Each URL must be valid'),
    // Apply custom validation middleware
    validate
  ],
  // Call the crawlAndCompare controller method
  crawlerController.crawlAndCompare
);

// Export the router for use in other parts of the application
module.exports = router;