const pool = require('../config/db');

const User = {
  create: async (pseudo, public_key, salt, hashed_password) => {
    const [result] = await pool.query(
      'INSERT INTO Users (pseudo, public_key, salt, hashed_password) VALUES (?, ?, ?, ?)',
      [pseudo, public_key, salt, hashed_password]
    );
    return result.insertId;
  },
  exist: async (id) => {
    const [rows] = await pool.query('SELECT active FROM Users WHERE user_id = ?', [id]);
    if (rows[0] && rows[0].active == 1) {
      return true;
    }
    else {
      return false;
    }
  },
  findByPseudo: async (pseudo) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE pseudo = ?', [pseudo]);
    return rows[0];
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [id]);
    return rows[0];
  },
  updatePassword: async (pseudo, public_key, salt, hashed_password) => {
    const [result] = await pool.query('UPDATE `Users` SET `salt`= ?,`hashed_password`= ? WHERE pseudo = ? and public_key = ?', [salt, hashed_password, pseudo, public_key]);
    return result;
  },
  softDelete: async (id) => {
    const [result] = await pool.query("UPDATE `Users` SET `active` = ? WHERE `user_id` = ?", [0, id]);
    return result;
  }
};

module.exports = User;