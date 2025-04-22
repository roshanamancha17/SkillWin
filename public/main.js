// main.js
import {
  signInWithGoogle,
  signOutUser,
  onUserChanged,
  getCurrentUser
} from "./auth.js";

document.getElementById("signInBtn")?.addEventListener("click", async () => {
  try {
    const user = await signInWithGoogle();
    console.log("Signed in as:", user.email);
    updateUI(user);
  } catch (err) {
    console.error("Sign-in failed:", err);
  }
});

document.getElementById("signOutBtn")?.addEventListener("click", async () => {
  await signOutUser();
  updateUI(null);
});

onUserChanged((user) => {
  updateUI(user);
});

function updateUI(user) {
  const userInfo = document.getElementById("userInfo");
  if (user) {
    userInfo.textContent = `Logged in as ${user.email}`;
    document.getElementById("signInBtn")?.classList.add("hidden");
    document.getElementById("signOutBtn")?.classList.remove("hidden");
  } else {
    userInfo.textContent = "Not signed in";
    document.getElementById("signInBtn")?.classList.remove("hidden");
    document.getElementById("signOutBtn")?.classList.add("hidden");
  }
}
