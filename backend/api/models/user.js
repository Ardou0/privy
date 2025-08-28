const pool = require('../config/db');

const User = {
  create: async (pseudo, public_key, salt, hashed_password) => {
    const [result] = await pool.getPool().query(
      'INSERT INTO Users (pseudo, public_key, salt, hashed_password) VALUES (?, ?, ?, ?)',
      [pseudo, public_key, salt, hashed_password]
    );
    return result.insertId;
  },
  exist: async (id) => {
    const [rows] = await pool.getPool().query('SELECT active FROM Users WHERE user_id = ?', [id]);
    if (rows[0] && rows[0].active == 1) {
      return true;
    }
    else {
      return false;
    }
  },
  findByPseudo: async (pseudo) => {
    const [rows] = await pool.getPool().query('SELECT * FROM Users WHERE pseudo = ?', [pseudo]);
    return rows[0];
  },
  findById: async (id) => {
    const [rows] = await pool.getPool().query('SELECT * FROM Users WHERE user_id = ?', [id]);
    return rows[0];
  },
  updatePassword: async (pseudo, public_key, salt, hashed_password) => {
    const [result] = await pool.getPool().query('UPDATE `Users` SET `salt`= ?,`hashed_password`= ? WHERE pseudo = ? and public_key = ?', [salt, hashed_password, pseudo, public_key]);
    return result;
  },
  searchUsers: async (pseudo, method = 'contains') => {
    let query = 'SELECT pseudo, public_key FROM Users WHERE active = 1 AND hide = 0';
    let params = [];
    switch (method) {
      case 'exact':
        query += ' AND pseudo = ?';
        params.push(pseudo);
        break;
      case 'startsWith':
        query += ' AND pseudo LIKE ?';
        params.push(pseudo + '%');
        break;
      case 'endsWith':
        query += ' AND pseudo LIKE ?';
        params.push('%' + pseudo);
        break;
      case 'contains':
        query += ' AND pseudo LIKE ?';
        params.push('%' + pseudo + '%');
        break;
      case 'pattern':
        // Pattern: replace '*' with '%' for wildcards
        query += ' AND pseudo LIKE ?';
        params.push(pseudo.replace(/\*/g, '%'));
        break;
      default:
        query += ' AND pseudo LIKE ?';
        params.push('%' + pseudo + '%');
    }
    const [rows] = await pool.getPool().query(query, params);

    return rows;
  },
  softDelete: async (id) => {
    const [result] = await pool.getPool().query("UPDATE `Users` SET `active` = ?, `hide` = 1 WHERE `user_id` = ?", [0, id]);
    return result;
  },
  toggleHide: async (id, toggle) => {
    const [result] = await pool.getPool().query('UPDATE `Users` SET `hide` = ? WHERE `user_id` = ?', [toggle, id]);
    return result;
  }
};


module.exports = User;