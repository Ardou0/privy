const Conversation = require('../models/conversation');
const User = require('../models/user');

const createConversation = async (req, res) => {
  const { participantId, conversation_key } = req.body;
  const creatorId = req.user.user_id;

  try {
    const conversationId = await Conversation.create(creatorId, participantId, conversation_key);
    res.status(201).json({ conversation_id: conversationId });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la conversation' });
  }
};

const getConversations = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const conversations = await Conversation.findByUserId(userId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
};

const getConversation = async (req, res) => {
  const userId = req.user.user_id;
  const { conversationId } = req.params;
  try {
    const conversations = await Conversation.findById(conversationId);
    if (!conversations || (conversations.creator_id !== userId && conversations.participant_id !== userId)) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
};

const sendInvitation = async (req, res) => {
  const { pseudo, key } = req.body;
  const fromUserId = req.user.user_id;
  try {
    // Check if pseudo exists
    const user = await User.findByPseudo(pseudo);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    const invitationId = await Conversation.createInvitation(fromUserId, user.user_id, key);
    res.status(201).json({ invitation_id: invitationId });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'envoi de l'invitation" });
  }
};

// Get all invitations for the user
const getInvitations = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const invitations = await Conversation.findInvitationsByUser(userId);
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des invitations' });
  }
};

// Handle response to an invitation
const respondToInvitation = async (req, res) => {
  const { invitationId } = req.params;
  const { response } = req.body; // expected: 'accepted' or 'declined'
  const userId = req.user.user_id;
  try {
    const result = await Conversation.respondToInvitation(invitationId, userId, response);
    if (result.status === 'not_found') {
      return res.status(404).json({ error: 'Invitation not found or unauthorized' });
    }
    if (response === 'accepted' && result.conversation_id) {
      return res.json({ message: 'Invitation accepted, conversation created', conversation_id: result.conversation_id });
    }
    return res.json({ message: 'Invitation response recorded', status: response });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ error: 'Erreur lors de la réponse à l\'invitation' });
  }
};

module.exports = { createConversation, getConversations, getConversation, sendInvitation, getInvitations, respondToInvitation };
