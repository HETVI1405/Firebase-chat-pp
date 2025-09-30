# Firebase Chat App (Vite + React + Redux + Firebase)

## Setup
1. Create a Firebase project at https://console.firebase.google.com/.
2. Enable **Email/Password** authentication and create a **Firestore** database (in test mode for development).
3. Copy your Firebase config and paste it into `src/firebase.js` where indicated.
4. Install dependencies:
   ```bash
   npm i
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```
6. The app runs at the URL printed by Vite (usually http://localhost:5173).

## Features
- Sign up / Sign in using Firebase Auth (email/password)
- Firestore stores users and messages
- Left sidebar: list of users (emails)
- Center: chat with selected user (real-time)
- Right: profile panel for the selected user and route `/profile/:uid` for editing your profile
- Delete or edit messages
- Last seen updates
