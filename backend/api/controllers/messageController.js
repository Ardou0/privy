const Message = require('../models/message');
const Conversation = require('../models/conversation');

const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { messageContent } = req.body;
  const senderId = req.user.user_id;
  console.log('Sending message:', { conversationId, messageContent, senderId });
  try {
    // Vérifier si la conversation existe
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }
    // Vérifier si l'utilisateur est membre de la conversation
    if (!conversation.creator_id === senderId && !conversation.participant_id === senderId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à envoyer des messages dans cette conversation' });
    }
    // Créer le message
    const messageId = await Message.create(conversationId, senderId, messageContent);
    res.status(201).json({ message_id: messageId });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
};

const getMessages = async (req, res) => {
  console.log('Fetching messages for conversation:', req.params);
  const { conversationId, before } = req.params;
  const userId = req.user.user_id
  try {
    // Vérifier si la conversation existe
    const conversation= await Conversation.findById(conversationId);
    if (!conversation || (conversation.creator_id !== userId && conversation.participant_id !== userId)) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    // Récupérer les messages de la conversation
    const messages = await Message.findPaginated(conversation.conversation_id, 50, before ? parseInt(before) : null);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
    console.error('Erreur lors de la récupération des messages:', error);
  }
};

module.exports = { sendMessage, getMessages };
