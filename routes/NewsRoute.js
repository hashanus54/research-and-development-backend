const express = require('express');
const NewsController = require('../controllers/NewsController');
const router = express.Router();
const authorized = require('../middleware/AuthMiddleware.js');

router.post('/create', authorized(['ADMIN', 'DIRECTOR']), NewsController.createNews);
router.get('/get-all', NewsController.getAllNews);
router.get('/get-by-id/:id', NewsController.getNewsById);
router.delete('/delete/:id', authorized(['ADMIN']), NewsController.deleteNews);

module.exports = router;