# Privy Frontend

> Welcome to the Privy frontend! This is the Vue 3 + Vite powered client for your secure messaging app. Here’s a breakdown of what’s inside and how it all fits together.

---

## 🗂️ Folder Structure

- **public/**: Static assets (favicon, etc.)
- **src/**: All source code lives here
  - **assets/**: CSS and fonts for a stylish UI
  - **components/**: Vue components for each view and feature
  - **composables/**: Reusable logic (authentication, encryption, conversations, etc.)
  - **stores/**: Pinia store for websocket state
  - **App.vue**: The root component
  - **main.js**: App entry point
  - **router.js**: Vue Router setup

---

## 🧩 Components

- **HomeView.vue**: Main dashboard, shows conversations and invitations, handles accept/reject logic
- **ConversationView.vue**: Chat interface for a single conversation
- **NoInternetView.vue**: Offline fallback
- **Auth/LoginView.vue & RegisterView.vue**: User authentication screens
- **Profile/MeView.vue & SearchView.vue**: Profile management and user search

---

## 🛠️ Composables

- **useAuth.js**: Handles login, registration, and user state
- **useConversations.js**: Fetches conversations, invitations, and manages invitation logic
- **useEncryption.js**: All cryptography (key generation, encryption/decryption)
- **useMessages.js**: Message sending and retrieval
- **useProfile.js**: Profile data and updates

---

## ⚡ Store

- **websocket.js**: Manages websocket connection and state for real-time messaging

---

## 🚀 Setup & Usage

```sh
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production
```

---

## 🎨 Styling

Custom CSS with TailWind and fonts for a modern, clean look. See `src/assets/main.css` and `title.ttf`.

---

## 📝 Notes

- This README is just for the frontend! For backend and full-stack info, see the associated README.
- Built with Vue 3, Vite, Pinia, and modern practices (i think, i least i tried to).

---

## 🕵️‍♂️ Found a Bug or Security Issue?

If you discover anything wrong, buggy, or that allows bad interactions or actions, please let me know! Your feedback helps make Privy safer and better for everyone.

---

## 🚧 Next Updates

Here's what I plan to improve in the frontend in the next Update:

- **Better key manager**: Move away from localStorage for key storage (not secure enough)
- **Add refresh token**: Improve authentication and session management
- **Optimize toast interactions**: Make notifications smoother and less intrusive
- **Better UX for conversations**: Allow users to hide or leave conversations
- **File parsing, encoding, and sending**: Integrate file handling with backend for secure file sharing
- More improvements coming!