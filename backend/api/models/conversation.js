const pool = require('../config/db');
const { findById } = require('./user');

const Conversation = {
  create: async (creatorId, participantId) => {
    const [result] = await pool.query(
      'INSERT INTO Conversations (creator_id, participant_id, created_at) VALUES (?, ?, NOW())',
      [creatorId, participantId]
    );
    return result.insertId;
  },
  findById: async (conversationId) => {
    const [rows] = await pool.query(
      'SELECT * FROM Conversations WHERE conversation_id = ?',
      [conversationId]
    );
    return rows[0];
  },
  findByUserId: async (userId) => {
    const [rows] = await pool.query(
      'SELECT c.*, creator.pseudo AS creator_pseudo, participant.pseudo AS participant_pseudo FROM Conversations c JOIN Users creator ON c.creator_id = creator.user_id JOIN Users participant ON c.participant_id = participant.user_id WHERE c.creator_id = ? OR c.participant_id = ?;',
      [userId, userId]
    );
    return rows;
  },
  // Create an invitation to talk
  createInvitation: async (fromUserId, toUserId, key) => {
    const [result] = await pool.query(
      'INSERT INTO Invitations (creator_id, participant_id, status, payload, created_at) VALUES (?, ?, ?, ?, NOW())',
      [fromUserId, toUserId, 'pending', key]
    );
    return result.insertId;
  },
  // Find all invitations for a user (by id)
  findInvitationsByUser: async (userId) => {
    const [rows] = await pool.query(
      'SELECT * FROM Invitations WHERE participant_id = ?',
      [userId]
    );
    return rows;
  },
  // Respond to an invitation
  respondToInvitation: async (invitationId, userId, response) => {
    const [invRows] = await pool.query('SELECT * FROM Invitations WHERE invitation_id = ? AND participant_id = ?', [invitationId, userId]);
    if (!invRows[0]) return false;
    // Update status
    await pool.query('UPDATE Invitations SET status = ? WHERE invitation_id = ?', [response, invitationId]);
    if (response === 'accepted') {
      // Find inviter's user_id
      const fromUserId = invRows[0].creator_id;
      // Create conversation between inviter and invitee
      const [convResult] = await pool.query(
        'INSERT INTO Conversations (creator_id, participant_id, created_at) VALUES (?, ?, NOW())',
        [fromUserId, userId]
      );
      return { status: 'ok', conversation_id: convResult.insertId };
    }
    return { status: 'ok' };
  }
};

module.exports = Conversation;
