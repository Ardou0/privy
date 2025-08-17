const File = require('../models/file');
const FileChunk = require('../models/fileChunk');

const uploadFile = async (req, res) => {
  const { conversationId, fileName, fileSize, fileType } = req.body;
  const uploaderId = req.user.user_id;

  try {
    const fileId = await File.create(conversationId, uploaderId, fileName, fileSize, fileType);
    res.status(201).json({ file_id: fileId });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
  }
};

const getFiles = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const files = await File.findByConversationId(conversationId);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des fichiers' });
  }
};

const uploadChunk = async (req, res) => {
  const { fileId, chunkData, chunkIndex, chunkSize } = req.body;

  try {
    const chunkId = await FileChunk.create(fileId, chunkData, chunkIndex, chunkSize);
    res.status(201).json({ chunk_id: chunkId });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'upload du chunk' });
  }
};

module.exports = { uploadFile, getFiles, uploadChunk };
