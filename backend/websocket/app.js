const { server } = require('./config/wss');
require('dotenv').config();

const PORT = process.env.WSS_PORT || 3001;
server.listen(PORT, () => {
  console.log(
    `Serveur WebSocket démarré sur le port ${PORT} en mode ${process.env.PROD === 'true' ? 'production (wss)' : 'développement (ws)'}`
  );
});
