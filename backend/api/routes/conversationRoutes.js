const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authenticateToken = require('../auth');

router.post('/', authenticateToken, conversationController.createConversation);
router.get('/', authenticateToken, conversationController.getConversations);
// New: Send invitation to talk
router.post('/invite', authenticateToken, conversationController.sendInvitation);
// New: Get all invitations for the user
router.get('/invitations', authenticateToken, conversationController.getInvitations);
// Handle response to an invitation
router.post('/invitations/:invitationId/respond', authenticateToken, conversationController.respondToInvitation);

module.exports = router;
