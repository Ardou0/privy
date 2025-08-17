let typingTimers = {};

const handleTyping = (ws, conversationId, activeConnections) => {
  activeConnections.forEach((client, userId) => {
    if (userId !== ws.user.user_id && client.conversationId === conversationId) {
      client.send(JSON.stringify({ type: 'userTyping', data: { userId: ws.user.user_id } }));
    }
  });

  // Réinitialiser le timer après 3 secondes d'inactivité
  clearTimeout(typingTimers[`${ws.user.user_id}-${conversationId}`]);
  typingTimers[`${ws.user.user_id}-${conversationId}`] = setTimeout(() => {
    activeConnections.forEach((client, userId) => {
      if (userId !== ws.user.user_id && client.conversationId === conversationId) {
        client.send(JSON.stringify({ type: 'userStoppedTyping', data: { userId: ws.user.user_id } }));
      }
    });
    delete typingTimers[`${ws.user.user_id}-${conversationId}`];
  }, 3000);
};

module.exports = { handleTyping };
