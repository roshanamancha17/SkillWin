import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// 🔥 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBmONfelStjrxOl1SnLKCOIveLPN-udJbs",
  authDomain: "skill-win-d8c81.firebaseapp.com",
  projectId: "skill-win-d8c81",
  storageBucket: "skill-win-d8c81.firebasestorage.app",
  messagingSenderId: "808700132713",
  appId: "1:808700132713:web:1ab8376f139278f89ad1f8"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 🔐 Make login persistent across page reloads
setPersistence(auth, browserLocalPersistence);

// 📤 Export auth and db for use in other modules
export { auth, db };

// 👤 Sign in with Google (create player if not exists)
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "players", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create default player document
    await setDoc(userRef, {
      email: user.email,
      userId: user.uid,
      currentBalance: 10,
      wins: 0,
      losses: 0,
      totalBettedAmount: 0,
      gamesPlayed: 0
    });
  }

  return user;
}

// 🔓 Sign out user
export function signOutUser() {
  return signOut(auth);
}

// 👂 Listen for auth changes
export function onUserChanged(callback) {
  onAuthStateChanged(auth, callback);
}

// 📥 Get currently signed-in user
export function getCurrentUser() {
  return auth.currentUser;
}
