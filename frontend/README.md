# Privy - Client Frontend

Ce dossier contient l'interface utilisateur de Privy (Single Page Application sous Vue 3) et sa configuration Capacitor.

## Structure

*   src/components/ : Vues et composants de l'interface.
*   src/composables/ : Logique métier (useAuth, useEncryption, useConversations, useMessages).
*   src/stores/ : Store Pinia pour le WebSocket.

## Dette technique et defauts de conception

### 1. Bug de connexion (Stale Token)
*   Token non reactif : Le JWT est lu une seule fois au chargement du fichier dans useConversations.js et useMessages.js. Si l'utilisateur se connecte, la valeur en memoire reste null et les requetes suivantes echouent (401) jusqu'au rechargement manuel de la page.

### 2. Reconnexion WebSocket
*   Boucle infinie : L'evenement onclose dans le store websocket.js tente de se reconnecter toutes les 5 secondes sans verifier si la deconnexion a ete demandee par l'utilisateur (logout), ce qui genere des tentatives de reconnexion en boucle apres une deconnexion.

### 3. Routeur et performances
*   Auth synchrone : Le guard beforeEach du routeur verifie l'authentification via un appel HTTP a chaque changement de page, entrainant des lenteurs de navigation.

### 4. Securite des cles et encodage
*   localStorage : Les cles privees RSA et cles symetriques sont stockees en clair dans le localStorage du navigateur, vulnerables aux failles XSS.
*   RangeError : L'utilisation de String.fromCharCode(...array) pour encoder le binaire en base64 risque de saturer la pile d'appel et de crasher le navigateur sur des messages volumineux.

### 5. Fichiers
*   Composable mocke : useFiles.js manipule les fichiers localement sans aucune interaction reseau avec le serveur.

## Retrospective et alternatives techniques

*   Gestion reactive : Utiliser un store utilisateur global (Pinia) et des intercepteurs Axios pour gerer dynamiquement le token.
*   Stockage des cles : Utiliser l'API Web Crypto pour stocker la cle dans IndexedDB en configurant l'option extractable sur false.
*   Router optimiste : Valider le token en local via sa date d'expiration pour autoriser la navigation, et traiter l'erreur 401 reseau globalement pour rediriger vers la page de login en cas d'expiration effective.
*   Deconnexion propre : Analyser le code de fermeture du socket pour eviter de lancer le timer de reconnexion lors d'un logout volontaire.
*   Buffers : Encoder les donnees binaires par blocs plutot que d'injecter la totalite du tableau dans String.fromCharCode.