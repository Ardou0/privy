
let typingTimers = {};

const handleTyping = (ws, { conversationId }, activeRooms) => {
  const room = activeRooms.get(String(conversationId));
  if (!room) return;
  room.forEach((client, userId) => {
    if (userId !== ws.user.user_id) {
      client.send(JSON.stringify({ type: 'userTyping', data: { userId: ws.user.user_id, conversationId } }));
    }
  });

  // Réinitialiser le timer après 3 secondes d'inactivité
  clearTimeout(typingTimers[`${ws.user.user_id}-${conversationId}`]);
  typingTimers[`${ws.user.user_id}-${conversationId}`] = setTimeout(() => {
    const room = activeRooms.get(String(conversationId));
    if (!room) return;
    room.forEach((client, userId) => {
      if (userId !== ws.user.user_id) {
        client.send(JSON.stringify({ type: 'userStoppedTyping', data: { userId: ws.user.user_id, conversationId } }));
      }
    });
    delete typingTimers[`${ws.user.user_id}-${conversationId}`];
  }, 3000);
};

module.exports = { handleTyping };
