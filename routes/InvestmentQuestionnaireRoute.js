const express = require('express');
const InvestmentQuestionnaireController = require('../controllers/InvestmentQuestionnaireController');
const router = express.Router();
const authorized = require('../middleware/AuthMiddleware.js');

router.post('/create', authorized(['USER']), InvestmentQuestionnaireController.createQuestionnaire);

module.exports = router;

