# 🎮 SkillWin – Cloud-Based Game Platform

**SkillWin** is a web-based game platform that allows players to log in, play skill-based games, and earn coins dynamically. Built using Firebase services, the platform stores player data (like coin balance, game stats, and profiles) and offers real-time updates and authentication.

---

## 🔗 Live Demo

🌐 [Visit SkillWin](https://skill-win.vercel.app/)

---

## 📁 Repository

📦 [GitHub Repo](https://github.com/roshanamancha17/SkillWin)

---

## ⚙️ Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Hosting:** Vercel
- **Backend Services:** Firebase (Authentication, Firestore, Cloud Functions)

---

## 🛠️ Cloud Services Used

| Cloud Service            | Provider         | Purpose                                      |
|--------------------------|------------------|----------------------------------------------|
| Firebase Authentication  | Google Firebase  | Secure login and sign-up                     |
| Firestore Database       | Google Firebase  | Store user data (coins, profiles, history)   |
| Firebase Cloud Functions | Google Firebase  | Logic for coin updates, leaderboard, etc.    |
| Firebase Analytics (Optional) | Google Firebase  | User behavior tracking (future scope)        |
| Vercel Hosting           | Vercel           | Hosting the front-end web app                |

---

## 🔁 Cloud Functions (Implemented/Planned)

> These functions are either implemented or recommended to enhance the backend logic:

- `updateCoins` – Triggered after a game ends to adjust user's coin balance.
- `updateLeaderboard` – Scheduled function to recalculate and store top players daily.
- `dailyLoginBonus` – Rewards users with coins for daily login.
- `logGameResult` – Stores each game's result for analytics and auditing.

---

## 💡 Features

- 🔐 Firebase Authentication (Email/Password)
- 🧠 Dynamic Coin Calculation Based on Game Performance
- 📊 Leaderboard Tracking (with Cloud Function support)
- 🏆 Daily Login Bonus System
- ⚡ Real-time Database Sync with Firestore

---

## 🧪 How to Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/roshanamancha17/SkillWin.git
   cd SkillWin
