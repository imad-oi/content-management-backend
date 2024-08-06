const express = require('express');
// const { body } = require('express-validator');
// const validate = require('../middleware/validate');
const textController = require('../controllers/textController');

const router = express.Router();

router.post('/text',
//   [
//     body('content').notEmpty().withMessage('Content is required'),
//     validate
//   ],
  textController.submitText
);

router.get('/text/:uuid', textController.getTextByUuid);

router.get('/text', textController.getAllTexts);


module.exports = router;