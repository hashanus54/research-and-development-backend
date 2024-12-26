const express = require('express');
const QuestionnaireController = require('../controllers/QuestionnaireController');
const router = express.Router();
const authorized = require('../middleware/AuthMiddleware.js');

router.post('/create', authorized(['ADMIN', 'USER', 'DIRECTOR']), QuestionnaireController.createQuestionnaire);
router.put('/update/:id', authorized(['ADMIN', 'USER']), QuestionnaireController.updateQuestionnaire);
router.put('/update-status/:id', authorized(['ADMIN', 'USER']), QuestionnaireController.updateQuestionnaire);
router.get('/get-all', authorized(['ADMIN', 'DIRECTOR']), QuestionnaireController.getAllQuestionnaires);
router.get('/get-by-id/:id', authorized(['USER']), QuestionnaireController.getQuestionnaireById);
router.get('/get-by-status/:approvalStatus', authorized(['ADMIN', 'USER', 'DIRECTOR']), QuestionnaireController.getQuestionnaireByApprovalStatus);
router.get('/get-by-user/user', authorized(['ADMIN', 'USER', 'DIRECTOR']), QuestionnaireController.getQuestionnairesByUser);
router.get('/get-by-email/:email', authorized(['ADMIN', 'DIRECTOR']), QuestionnaireController.getQuestionnairesByEmail);
router.delete('/delete/:id', authorized(['ADMIN', 'DIRECTOR']), QuestionnaireController.deleteQuestionnaire);

module.exports = router;

