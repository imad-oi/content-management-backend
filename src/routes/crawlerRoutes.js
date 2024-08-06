// Import required modules
const express = require('express');
const { body } = require('express-validator'); // For input validation
const validate = require('../middleware/validate'); // Custom validation middleware
const crawlerController = require('../controllers/crawlerController'); // Controller for crawler operations

// Create a new router instance
const router = express.Router();

/**
 * @swagger
 * /api/crawl-and-compare:
 *   post:
 *     summary: Crawl specified URLs and compare content with existing entries
 *     tags: [Crawler]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - urls
 *             properties:
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 minItems: 1
 *     responses:
 *       200:
 *         description: Crawl and comparison results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                   duplicates:
 *                     type: object
 *                     properties:
 *                       internal:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Duplicate'
 *                       external:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Duplicate'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin rights
 * 
 * components:
 *   schemas:
 *     Duplicate:
 *       type: object
 *       properties:
 *         index:
 *           type: integer
 *         paragraph:
 *           type: string
 *         originalIndex:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [exact, similar]
 */
router.post('/crawl-and-compare',
  [
    body('urls').isArray().withMessage('URLs must be provided as an array'),
    body('urls.*').isURL().withMessage('Each URL must be valid'),
    validate
  ],
  crawlerController.crawlAndCompare
);

module.exports = router;