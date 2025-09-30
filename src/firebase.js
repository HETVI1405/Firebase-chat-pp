
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyD-N7YgRM0LFBobkLV7BIFjRv4aR4LtXNk",
  authDomain: "chat-app-59bd1.firebaseapp.com",
  projectId: "chat-app-59bd1",
  storageBucket: "chat-app-59bd1.appspot.com",
  messagingSenderId: "241682787413",
  appId: "1:241682787413:web:3aca9a90337f0464daf8dc",
  measurementId: "G-XRPGC0D3MV"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)