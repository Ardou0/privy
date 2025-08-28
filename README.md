
# Privy

Welcome to Privy! This is my educational journey into building a secure messaging app from scratch. I'm a beginner, learning how to make "real" apps, and this project is my playground for exploring modern web, mobile, and security technologies.

---

## 🚀 What is Privy?

Privy is a secure messaging application designed to experiment with:
- End-to-end encryption for private conversations
- Secure key exchange (Bluetooth planned(maybe))
- Hybrid server communication (REST API + WebSocket)
- Multi-platform support (web, mobile, desktop)

---

## 🏗️ Project Structure

- **frontend/**: Vue 3 + Vite SPA for the client ([see its own README for details](./frontend/README.md))
- **backend/**: Node.js/Express API & WebSocket server ([own README also](./backend/README.md))
- **capacitor/**: Capacitor config for packaging the frontend as a mobile app

---

## 🛠️ Technology Choices

- **Vue 3 + Vite**: Fast, modern frontend development
- **Node.js + Express**: Simple, flexible backend
- **WebSocket**: Real-time messaging
- **MySQL**: Relational database for users, messages, and conversations
- **Capacitor**: To package the frontend for iOS/Android
- **(Maybe) Electron**: For desktop app, if it fits best

---

## 🌱 How It Was Supposed to Be vs. How It Turned Out

**The Plan:**
- Fully decentralized key exchange (Bluetooth/NFC)
- Bulletproof security everywhere
- Seamless experience on all platforms

**The Reality:**
- Some features are still experimental or missing
- Key management is not perfect (localStorage for now)
- Security is a work in progress
- The app works, but there are probably bugs and rough edges

---

## 🔄 Big Interactions & Architecture

- **User Auth:** Register/login, JWT tokens, (refresh token planned)
- **Conversations:** Create, invite, accept/decline, encrypted messaging
- **Encryption:** Symmetric keys for messages, asymmetric for key exchange
- **WebSocket:** Real-time message delivery, typing indicators
- **Mobile/Desktop:** Frontend can be packed for mobile (Capacitor) or desktop (Electron/other)

---

## 🤔 Why This Project?

I'm just a student, learning by doing. I wanted to understand how secure messaging apps work, and this project is my way to try building one from the ground up. It's not perfect, but every bug and challenge is a lesson.

---

## 👨‍💻 Collaboration & Feedback

This is a personal, educational project. I'm not looking for collaborators unless it becomes something really interesting. But if you find bugs, security issues, or have feedback, please let me know! I'll do my best to fix things and learn from your input.

---

## 📚 More Info

- For frontend details, see [frontend/README.md](./frontend/README.md)
- For backend details, see [backend/README.md](./backend/README.md)

---

## 🚧 Next Updates (General)

Here are some general updates planned for both backend and frontend:

- **Language manager**: Add support for multiple languages so everything isn't French only
- **Better error handling and feedback**: Consistent, user-friendly errors and notifications
- **Security improvements**: More robust authentication, encryption, and validation
- **Performance optimizations**: Faster, smoother experience across all platforms
- More improvements coming!

---

## 📝 Final Note

Privy is a learning project. There are probably many problems, but I'm here to learn and improve. If you spot anything wrong, let me know—I'll try to fix it!

Thanks for checking out Privy! 🚀
