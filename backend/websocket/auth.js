const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const verifyToken = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) return reject(err);
      try {
        const result = await axios.get(
          `${API_URL}/auth/check`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (result.status !== 200 || !result.data.user_id) {
          return reject(new Error('Utilisateur non trouvé ou erreur de vérification'));
        }
        decoded.pseudo = result.data.pseudo;
        resolve(decoded);
      } catch (axiosError) {
        reject(axiosError);
      }
    });
  });
};


module.exports = { verifyToken };
