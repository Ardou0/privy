const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorHandler = require('./utils/errorHandler');
const cors = require('cors')

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors())

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/conversations', messageRoutes);
app.use('/api/conversations', fileRoutes);

app.use(errorHandler);

const PORT = process.env.API_PORT || 3000;

if (!process.env.PROD == 'true') {
  const fs = require('fs');
  const https = require('https');
  const http = require('http');
  var privateKey = fs.readFileSync('/etc/letsencrypt/live/privy.armand-walle.com/privkey.pem', 'utf8');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/privy.armand-walle.com/fullchain.pem', 'utf8');

  var credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
  });
}
else {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});