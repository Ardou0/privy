const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const register = async (req, res) => {
  const { pseudo, public_key, password } = req.body;

  // Vérification des champs requis
  if (!pseudo || !public_key || !password) {
    return res.status(400).json({ error: 'Tous les champs (pseudo, public_key, password) sont requis.' });
  }

  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashed_password = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    const userId = await User.create(pseudo, public_key, salt, hashed_password);
    res.status(201).json({ user_id: userId });
  } catch (error) {
    // Gestion des erreurs spécifiques
    if (error.message.includes('Duplicate')) {
      if (error.message.includes('pseudo')) {
        return res.status(409).json({ error: 'Pseudo déjà utilisé.' });
      }
      else {
        return res.status(409).json({ error: 'Données erronées.' });
      }
    }

    res.status(500).json({ error: 'Erreur interne lors de l\'enregistrement de l\'utilisateur.' });
  }
};

const login = async (req, res) => {
  const { pseudo, password } = req.body;

  // Vérification des champs requis
  if (!pseudo || !password) {
    return res.status(400).json({ error: 'Tous les champs (pseudo, password) sont requis.' });
  }

  try {
    const user = await User.findByPseudo(pseudo);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    const active = await User.exist(user.user_id)
    if (!active) {
      return res.sendStatus(403);
    }

    const hashed_password = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    if (hashed_password != user.hashed_password) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }
    
    const token = jwt.sign({ user_id: user.user_id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION
    });
    res.json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur interne lors de la connexion de l\'utilisateur.' });
  }
};

const checkAuth = async (req, res) => {
  if (req.user) {
    const { pseudo } = await User.findById(req.user.user_id);
    res.status(200).json({ user_id: req.user.user_id, pseudo: pseudo });
  } else {
    res.status(401).json({ error: 'Utilisateur non authentifié.' });
  }
}

module.exports = { register, login, checkAuth };
