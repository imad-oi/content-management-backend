// Import required modules
const express = require('express');
const { body } = require('express-validator'); // For input validation
const validate = require('../middleware/validate'); // Custom validation middleware
const textController = require('../controllers/textController'); // Controller for text-related operations

// Create a new router instance
const router = express.Router();

// POST route to submit new text
router.post('/',
  [
    // Validate that the content field is not empty
    body('content').notEmpty().withMessage('Content is required'),
    // Apply custom validation middleware
    validate
  ],
  // Call the submitText controller method
  textController.submitText
);

// GET route to retrieve a specific text entry by UUID
router.get('/:uuid', textController.getTextByUuid);

// GET route to retrieve all text entries
router.get('/', textController.getAllTexts);

// Export the router for use in other parts of the application
module.exports = router;