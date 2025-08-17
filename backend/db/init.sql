-- Créer la base de données
CREATE DATABASE IF NOT EXISTS privy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer un utilisateur spécifique pour l'application
CREATE USER IF NOT EXISTS 'privy_user'@'%' IDENTIFIED BY 'password';

-- Accorder les privilèges nécessaires à l'utilisateur
GRANT ALL PRIVILEGES ON privy.* TO 'privy_user'@'%';

-- Rafraîchir les privilèges
FLUSH PRIVILEGES;