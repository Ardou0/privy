const pool = require('../config/db');

const Message = {
  create: async (conversationId, senderId, messageContent) => {
    const [result] = await pool.query(
      'INSERT INTO Messages (conversation_id, sender_id, message_content) VALUES (?, ?, ?)',
      [conversationId, senderId, messageContent]
    );
    return result.insertId;
  },
  findByConversationId: async (conversationId) => {
    const [rows] = await pool.query(
      'SELECT * FROM Messages WHERE conversation_id = ?',
      [conversationId]
    );
    return rows;
  },
  // Ajoutez d'autres méthodes selon vos besoins
};

module.exports = Message;
