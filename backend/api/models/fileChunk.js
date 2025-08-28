const pool = require('../config/db');

const FileChunk = {
  create: async (fileId, chunkData, chunkIndex, chunkSize) => {
    const [result] = await pool.getPool().query(
      'INSERT INTO FileChunks (file_id, chunk_data, chunk_index, chunk_size) VALUES (?, ?, ?, ?)',
      [fileId, chunkData, chunkIndex, chunkSize]
    );
    return result.insertId;
  },
  findByFileId: async (fileId) => {
    const [rows] = await pool.getPool().query(
      'SELECT * FROM FileChunks WHERE file_id = ?',
      [fileId]
    );
    return rows;
  },
  // Ajoutez d'autres méthodes selon vos besoins
};

module.exports = FileChunk;
