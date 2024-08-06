// Import required modules
const express = require('express');
const { body } = require('express-validator'); // For input validation
const validate = require('../middleware/validate'); // Custom validation middleware
const textController = require('../controllers/textController'); // Controller for text-related operations
const { protect } = require('../middleware/auth');

// Create a new router instance
const router = express.Router();

/**
 * @swagger
 * /api/text:
 *   post:
 *     summary: Submit a new text
 *     tags: [Texts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: The submitted text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uuid:
 *                   type: string
 *                 internalDuplicates:
 *                   type: array
 *                 externalDuplicates:
 *                   type: array
 */
router.post('/',
  [
    body('content').notEmpty().withMessage('Content is required'),
    validate
  ],
  textController.submitText
);

/**
 * @swagger
 * /api/text/{uuid}:
 *   get:
 *     summary: Retrieve a specific text entry by UUID
 *     tags: [Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the text entry to retrieve
 *     responses:
 *       200:
 *         description: The requested text entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uuid:
 *                   type: string
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 duplicates:
 *                   type: object
 *                   properties:
 *                     internal:
 *                       type: array
 *                     external:
 *                       type: array
 *       404:
 *         description: Text entry not found
 *       403:
 *         description: Not authorized to access this text entry
 */
router.get('/:uuid', textController.getTextByUuid);

/**
 * @swagger
 * /api/text:
 *   get:
 *     summary: Retrieve all texts for the authenticated user
 *     tags: [Texts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of text entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 textEntries:
 *                   type: array
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalEntries:
 *                   type: integer
 */
router.get('/', textController.getAllTexts);

// Export the router for use in other parts of the application
module.exports = router;