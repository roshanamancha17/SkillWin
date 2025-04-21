import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db };

// Handle Google Sign-In button
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create a player document if not exists
    const userRef = doc(db, "players", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        userId: user.uid,
        currentBalance: 10,
        wins: 0,
        losses: 0,
        totalBettedAmount: 0,
        gamesPlayed: 0,
      });
    }

    // Update UI or redirect as needed
    console.log("User signed in:", user.displayName);
  } catch (error) {
    console.error("Sign in error:", error);
  }
}

// Automatically check if user is already signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User still signed in:", user.email);
    // You can call functions here to update UI or fetch data
    // Example: updateUserUI(user);
  } else {
    console.log("User not signed in.");
  }
});
