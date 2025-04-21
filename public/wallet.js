// wallet.js

import {
    getFirestore, doc, onSnapshot, getDoc, updateDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  import {
    getAuth, onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
  
  const db = getFirestore();
  const auth = getAuth();
  
  // 👂 Listen to balance changes and update UI
  export function setupBalanceListener(domId = "playerPoints") {
    onAuthStateChanged(auth, (user) => {
      if (!user) return;
  
      const userRef = doc(db, "players", user.uid);
      onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const balance = docSnap.data().currentBalance ?? 0;
          const el = document.getElementById(domId);
          if (el) el.textContent = balance;
        }
      });
    });
  }
  
  // 💰 Update balance (e.g., +10 or -5)
  export async function updateBalance(change) {
    const user = auth.currentUser;
    if (!user) return;
  
    const userRef = doc(db, "players", user.uid);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists()) {
      const current = userSnap.data().currentBalance ?? 0;
      const updated = current + change;
      await updateDoc(userRef, { currentBalance: updated });
    }
  }
  