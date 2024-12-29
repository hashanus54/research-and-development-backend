const express = require('express');
const QuestionnaireController = require('../controllers/QuestionnaireController');
const router = express.Router();
const authorized = require('../middleware/AuthMiddleware.js');

router.post('/create', authorized(['SUPER_ADMIN', 'ADMIN', 'USER', 'DIRECTOR']), QuestionnaireController.createQuestionnaire);
router.put('/update/:id', authorized(['SUPER_ADMIN', 'ADMIN', 'USER']), QuestionnaireController.updateQuestionnaire);
router.put('/update-status/:id', authorized(['SUPER_ADMIN', 'ADMIN', 'USER']), QuestionnaireController.updateQuestionnaire);
router.get('/get-all', authorized(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), QuestionnaireController.getAllQuestionnaires);
router.get('/get-by-id/:id', authorized(['USER']), QuestionnaireController.getQuestionnaireById);
router.get('/get-by-status/:approvalStatus', authorized(['SUPER_ADMIN', 'ADMIN', 'USER', 'DIRECTOR']), QuestionnaireController.getQuestionnaireByApprovalStatus);
router.get('/get-by-user/user', authorized(['SUPER_ADMIN', 'ADMIN', 'USER', 'DIRECTOR']), QuestionnaireController.getQuestionnairesByUser);
router.get('/get-by-email/:email', authorized(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), QuestionnaireController.getQuestionnairesByEmail);
router.delete('/delete/:id', authorized(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), QuestionnaireController.deleteQuestionnaire);

module.exports = router;

