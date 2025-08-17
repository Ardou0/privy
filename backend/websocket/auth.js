const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const verifyToken = (token, callback) => {
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return callback(err);
    // Vérifier si l'utilisateur existe dans la base de données
    let result = await axios.get(
      `${API_URL}/auth/check`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if(!result.data.user_id) {
      return callback(new Error('Utilisateur non trouvé'));
    }
    callback(null, decoded);
  });
};

module.exports = { verifyToken };
