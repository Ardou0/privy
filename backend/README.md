# Privy - Service Backend

Ce dossier contient les services backend de Privy, divises en une API REST et un serveur WebSocket.

Ce backend presente des lacunes de conception et de securite importantes et ne doit pas etre utilise en production.

## Architecture

*   API REST (api/) : Authentification, profils et gestion des invitations.
*   Serveur WebSocket (websocket/) : Routage des messages en temps reel.

## Dette technique et bugs critiques

### 1. API REST et Securite
*   Blocage du thread principal : L'inscription et la connexion utilisent crypto.pbkdf2Sync (synchrone) avec 1 000 iterations, ce qui bloque la boucle d'evenements a chaque authentification.
*   Crash du processus : Dans conversationController.js, si une invitation n'est pas trouvee ou invalide, respondToInvitation renvoie false. Le controleur lit result.status sur ce retour, provoquant une erreur TypeError non interceptee qui fait planter le serveur Node.js.
*   Requetes SQL redondantes : Le middleware d'authentification interroge la base de donnees (User.exist) a chaque requete HTTP au lieu de se fier uniquement a la signature JWT.

### 2. WebSocket et reseau
*   Polling d'authentification : Le serveur WebSocket effectue une requete HTTP externe vers l'API REST toutes les 30 secondes pour chaque client afin de verifier le token JWT.
*   Nettoyage inefficace : A la deconnexion d'un client, le serveur parcourt l'ensemble des salons actifs en memoire (activeRooms.forEach) pour le supprimer, induisant une complexite de O(R) avec R le nombre de salons.

### 3. Base de donnees
*   Salons 1-on-1 uniques : La contrainte UNIQUE sur (creator_id, participant_id) dans la table Conversations empeche toute evolution vers des groupes de discussion.
*   Stockage binaire : Table FileChunks prevue pour des blocs de 255 octets (VARBINARY(255)) stockes dans MySQL. Cette fonctionnalite a ete abandonnee et ses routes sont desactivees.

### 4. Docker
*   Demarrage des conteneurs : Pas de sequence d'ordonnancement (depends_on) dans docker-compose.yml entre les serveurs et MySQL.
*   Exposition réseau : Le port 3306 est expose directement sur l'hote.
*   Obsoletence : Utilisation de MySQL 5.7 (EOL depuis fin 2023).

## Retrospective et alternatives techniques

*   Crypto asynchrone : Utiliser argon2 ou bcrypt de maniere asynchrone pour liberer l'Event Loop de l'API.
*   Architecture distribuee : Valider les JWT localement sur le serveur WebSocket sans appel HTTP vers l'API REST.
*   Stockage externe : Stocker les fichiers chiffres sur disque ou stockage objet (S3), en ne gardant que l'URI de telechargement dans la base SQL.
*   Groupes : Creer une table associative ConversationParticipants pour decorreler les utilisateurs des salons.
*   Nettoyage O(1) : Enregistrer les salons rejoints sur l'objet de connexion du client pour cibler le nettoyage lors de la deconnexion.