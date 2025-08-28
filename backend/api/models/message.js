const pool = require('../config/db');

const Message = {
  create: async (conversationId, senderId, messageContent) => {
    const [result] = await pool.getPool().query(
      'INSERT INTO Messages (conversation_id, sender_id, message_content) VALUES (?, ?, ?)',
      [conversationId, senderId, messageContent]
    );
    return result.insertId;
  },
  
  // New paginated method
  findPaginated: async (conversationId, limit = 50, beforeMessageId = null) => {
    let query = `
      SELECT m.*, u.pseudo FROM Messages m JOIN Users u ON m.sender_id = u.user_id
      WHERE conversation_id = ?
    `;
    const params = [conversationId];

    // If beforeMessageId is provided, only get messages with id < beforeMessageId
    if (beforeMessageId) {
      query += ' AND message_id < ?';
      params.push(beforeMessageId);
    }

    query += ' ORDER BY message_id DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.getPool().query(query, params);
    return rows;
  }
};

module.exports = Message;
