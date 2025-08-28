const pool = require('../config/db');
const { findById } = require('./user');

const Conversation = {
  create: async (creatorId, participantId) => {
    const [result] = await pool.getPool().query(
      'INSERT INTO Conversations (creator_id, participant_id, created_at) VALUES (?, ?, NOW())',
      [creatorId, participantId]
    );
    return result.insertId;
  },
  findById: async (conversationId) => {
    const [rows] = await pool.getPool().query(
      'SELECT c.*, creator.pseudo AS creator_pseudo, participant.pseudo AS participant_pseudo FROM Conversations c JOIN Users creator ON c.creator_id = creator.user_id JOIN Users participant ON c.participant_id = participant.user_id WHERE c.conversation_id = ?',
      [conversationId]
    );
    return rows[0];
  },
  findByUserId: async (userId) => {
    const [rows] = await pool.getPool().query(
      'SELECT c.*, creator.pseudo AS creator_pseudo, participant.pseudo AS participant_pseudo, (SELECT timestamp FROM Messages WHERE conversation_id = c.conversation_id ORDER BY timestamp DESC LIMIT 1 ) AS last_message FROM Conversations c JOIN Users creator ON c.creator_id = creator.user_id JOIN Users participant ON c.participant_id = participant.user_id WHERE c.creator_id = ? OR c.participant_id = ?; ',
      [userId, userId]
    );
return rows;
  },
// Create an invitation to talk
createInvitation: async (fromUserId, toUserId, key) => {
  const [result] = await pool.getPool().query(
    'INSERT INTO Invitations (creator_id, participant_id, status, payload, created_at) VALUES (?, ?, ?, ?, NOW())',
    [fromUserId, toUserId, 'pending', key]
  );
  return result.insertId;
},
  // Find all invitations for a user (by id)
  findInvitationsByUser: async (userId) => {
    const [rows] = await pool.getPool().query(
      'SELECT i.invitation_id, i.payload, i.created_at, i.status, u1.pseudo as creator_pseudo, u2.pseudo as participant_pseudo FROM `Invitations` i JOIN Users u1 on u1.user_id = i.creator_id JOIN Users u2 on u2.user_id = i.participant_id WHERE i.participant_id = ? AND (i.status = "pending" OR i.status="accepted") AND u1.active = 1 AND u2.active = 1;',
      [userId]
    );
    return rows;
  },
    // Respond to an invitation
    respondToInvitation: async (invitationId, userId, response) => {
      const [invRows] = await pool.getPool().query('SELECT * FROM Invitations WHERE invitation_id = ? AND participant_id = ?', [invitationId, userId]);
      if (!invRows[0]) return false;
      // Update status
      await pool.getPool().query('UPDATE Invitations SET status = ? WHERE invitation_id = ?', [response, invitationId]);
      if (response === 'accepted') {
        // Find inviter's user_id
        const fromUserId = invRows[0].creator_id;
        // Create conversation between inviter and invitee
        const [convResult] = await pool.getPool().query(
          'INSERT INTO Conversations (creator_id, participant_id, created_at) VALUES (?, ?, NOW())',
          [fromUserId, userId]
        );
        return { status: 'ok', conversation_id: convResult.insertId };
      }
      return { status: 'ok' };
    }
};

module.exports = Conversation;
