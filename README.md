# Privy - Messagerie securisee (Projet d'apprentissage)

Derniere mise a jour (Retrospective) : Juillet 2026

Note de contexte : Cette analyse technique a ete redigee a l'issue de ma premiere annee en ecole d'ingenieur en informatique. Elle constitue une mise en perspective critique de ce que j'ai appris au cours de cette annee par rapport au code de ce projet, que j'avais entierement concu avant d'entrer en ecole d'ingenieur.

Ce projet est une preuve de concept (PoC) educative. Il presente d'importantes faiblesses de conception, de securite et de performances qui le rendent impropre a une utilisation en production ou a une maintenance a long terme.

## Structure du projet

*   [frontend/](frontend/README.md) : Client en Vue 3 (Vite, Pinia) package avec Capacitor pour mobile.
*   [backend/](backend/README.md) : API REST (api/) et serveur WebSocket (websocket/).
*   [capacitor/](capacitor/README.md) : Configuration de packaging mobile.

## Stack technique

*   Frontend : Vue 3, Vite, Pinia, Axios.
*   Mobile Wrapper : Capacitor.
*   Backend : Node.js, Express, ws.
*   Base de donnees : MySQL 5.7.

## Dette technique et limites majeures

1.  Stockage des cles : Les cles privees RSA et les cles symetriques sont stockees en clair dans le localStorage, exposant l'utilisateur aux failles XSS.
2.  Performances reseau : Le serveur WebSocket n'a pas d'acces direct a la base de donnees et requete l'API REST toutes les 30 secondes pour chaque utilisateur connecte afin de valider le token JWT. De plus, le routeur frontend valide l'authentification a chaque changement de page.
3.  Hachage bloquant : L'API utilise crypto.pbkdf2Sync avec 1 000 iterations. Ce traitement synchrone bloque le thread principal de Node.js lors des inscriptions et connexions.
4.  Modele relationnel : La table Conversations restreint les echanges a un format strictement 1-on-1. Les groupes ne sont pas geres.
5.  Gestion de fichiers : Le systeme prevoyait un decoupage en blocs de 255 octets stockes directement dans MySQL. Cette fonctionnalite n'est pas finalisee et les routes sont commentees.

## Retrospective et alternatives techniques

*   Securisation des cles : Stocker les cles dans IndexedDB via l'API Web Crypto avec l'option extractable positionnee a false, ou chiffrer la cle privee localement a l'aide d'un mot de passe utilisateur (derive via Argon2id).
*   Securite : Remplacer PBKDF2 synchrone par un algorithme asynchrone (Argon2 ou bcrypt) pour eviter le blocage de l'Event Loop.
*   Architecture temps reel : Valider les tokens localement sur le serveur WebSocket en partageant le secret de signature JWT, sans passer par des appels HTTP repetitifs vers l'API.
*   Conception BDD : Utiliser une table d'association (Many-to-Many) ConversationParticipants pour integrer les groupes.
*   Stockage de fichiers : Stocker les fichiers chiffres sur un espace de stockage externe (S3, disque local) et n'enregistrer que les metadonnees et l'URI chiffree en base de donnees.
*   Gestion des etats : Utiliser des intercepteurs de requetes Axios plutot que de lire le token une unique fois au chargement des modules JS.
