const pool = require('../config/db');

const File = {
  create: async (conversationId, uploaderId, fileName, fileSize, fileType) => {
    const [result] = await pool.getPool().query(
      'INSERT INTO Files (conversation_id, uploader_id, file_name, file_size, file_type) VALUES (?, ?, ?, ?, ?)',
      [conversationId, uploaderId, fileName, fileSize, fileType]
    );
    return result.insertId;
  },
  findByConversationId: async (conversationId) => {
    const [rows] = await pool.getPool().query(
      'SELECT * FROM Files WHERE conversation_id = ?',
      [conversationId]
    );
    return rows;
  },
  // Ajoutez d'autres méthodes selon vos besoins
};

module.exports = File;
