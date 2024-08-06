const express = require('express');
// const { body } = require('express-validator');
// const validate = require('../middleware/validate');
const textController = require('../controllers/textController');

const router = express.Router();

router.post('/',
//   [
//     body('content').notEmpty().withMessage('Content is required'),
//     validate
//   ],
  textController.submitText
);

router.get('/:uuid', textController.getTextByUuid);

router.get('/', textController.getAllTexts);

module.exports = router;