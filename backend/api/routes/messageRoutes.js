const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../auth');

router.post('/:conversationId/messages', authenticateToken, messageController.sendMessage);
router.get('/:conversationId/messages/:before', authenticateToken, messageController.getMessages);

module.exports = router;