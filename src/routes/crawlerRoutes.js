const express = require('express');
// const { body } = require('express-validator');
// const validate = require('../middleware/validate');
const crawlerController = require('../controllers/crawlerController');


const router = express.Router();

router.post('/crawl-and-compare',
  // [
  //   body('urls').isArray().withMessage('URLs must be provided as an array'),
  //   body('urls.*').isURL().withMessage('Each URL must be valid'),
  //   validate
  // ],
  crawlerController.crawlAndCompare
);


module.exports = router;