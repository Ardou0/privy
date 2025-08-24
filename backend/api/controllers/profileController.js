const User = require('../models/user');
const crypto = require('crypto');

const update = async (req, res) => {
    const { password, new_password } = req.body;
    const userId = req.user.user_id;

    // Vérification des champs requis
    if (!new_password || !password || !userId) {
        return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        const previous_hashed_password = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');

        if (previous_hashed_password != user.hashed_password) {
            return res.status(403).json({ error: 'Mot de passe incorrect.' });
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const new_hashed_password = crypto.pbkdf2Sync(new_password, salt, 1000, 64, 'sha512').toString('hex');

        await User.updatePassword(user.pseudo, user.public_key, salt, new_hashed_password);

        res.status(200).json({ success: "L'opération a réussi." });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne lors de l\'enregistrement des modifications.' + error });
    }
};

const remove = async (req, res) => {
    const userId = req.user.user_id;
    try {
        await User.softDelete(userId);

        res.status(200).json({ success: "L'opération a réussi." });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne lors de l\'enregistrement des modifications.' + error });
    }
};

const search = async (req, res) => {
    const { pseudo } = req.params;
    const method = req.query.method
    // Vérification des champs requis
    if (!pseudo) {
        return res.status(400).json({ error: 'Le pseudo est requis.' });
    }

    try {
        console.log('Searching for user:', pseudo, 'with method:', method);
        const users = await User.searchUsers(pseudo, method);
        if (!users) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne lors de la recherche de l\'utilisateur.' });
    }
}

module.exports = { update, remove, search };
