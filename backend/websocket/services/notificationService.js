// Ajouter une notification pour un utilisateur non connecté
const addNotification = (userId, notification, pendingNotifications) => {
  const userNotifications = pendingNotifications.get(userId) || [];
  userNotifications.push(notification);
  pendingNotifications.set(userId, userNotifications);

  // Nettoyer les anciennes notifications (>24h)
  setTimeout(() => {
    const notifications = pendingNotifications.get(userId) || [];
    pendingNotifications.set(userId, notifications.filter(n => Date.now() - n.timestamp < 86400000));
  }, 86400000); // 24h
};

module.exports = { addNotification };
