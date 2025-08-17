const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authenticateToken = require('../auth');

router.post('/:conversationId/files', authenticateToken, fileController.uploadFile);
router.get('/:conversationId/files', authenticateToken, fileController.getFiles);
router.post('/:conversationId/files/:fileId/chunks', authenticateToken, fileController.uploadChunk);

module.exports = router;
