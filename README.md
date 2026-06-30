# 🚀 MERN Stack Starter Template (Vite + Express)

A production-ready **MERN (MongoDB, Express, React, Node.js)** starter template designed for scalability and developer experience.

Monorepo structure with a single-command startup, pre-configured CORS + Vite proxy, JWT cookie auth, Socket.IO, Cloudinary avatar uploads, and email via Nodemailer — all wired up and ready to customize.

---

## ✨ Key Features

### 🏗 Architecture
- **Monorepo:** Distinct `client/` and `server/` directories, one-command boot.
- **MVC Backend:** Models, Controllers, Routes, Middleware separation.
- **Graceful Shutdown:** Handles `SIGINT` to cleanly close the DB connection.

### ⚡ Frontend (`client/`)
- **React 19 + Vite 6:** Lightning-fast HMR and optimized production builds.
- **React Router v7:** Nested routing with a shared Layout component.
- **Context API:** `AuthContext`, `FetcherContext`, `SocketContext` composable via `AppProvider`.
- **Custom `useFetcher` hook:** Centralized fetch wrapper with credential handling and error normalization.
- **react-toastify:** Drop-in toast notifications already wired to auth flows.
- **ESLint + Prettier + Husky:** Pre-commit formatting and linting enforced automatically.

### 🛡 Backend (`server/`)
- **JWT Auth:** `httpOnly` cookie-based tokens with 30-day expiry.
- **Role-based access:** `protect` (auth), `admin` (admin-only), and `manager` middleware.
- **Password reset flow:** Secure token generation + Nodemailer SMTP email delivery.
- **Socket.IO:** Per-user rooms wired on connection.
- **Cloudinary:** Optional avatar upload middleware via Multer.
- **Security:** `helmet`, `cors`, `express-rate-limit`, `bcryptjs` — all pre-configured.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas URI)

### 1. Install all dependencies

```bash
npm run install-all
```

### 2. Configure environment

```bash
cp .env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, SMTP credentials, etc.
```

### 3. Start development servers

```bash
npm run dev
```

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:5173    |
| Backend  | http://localhost:5000    |

---

## 📂 Project Structure

```text
react-starter-template/
├── .env.example                  # Environment variable template
├── client/                       # React (Vite) Frontend
│   └── src/
│       ├── assets/               # Static assets (images, fonts, etc.)
│       ├── components/
│       │   ├── Auth/             # Login & Register forms
│       │   ├── Layout/           # NavBar, Footer, Header
│       │   ├── Pages/            # Route-level page components
│       │   └── Utility/          # ProtectedRoute, AdminRoute
│       ├── contexts/
│       │   ├── Auth/             # AuthContext + AuthProvider
│       │   ├── Fetcher/          # FetcherContext + FetcherProvider
│       │   ├── Socket/           # SocketContext + SocketProvider
│       │   └── AppProvider.jsx   # Composes all providers
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useFetcher.js
│       │   └── useSocket.js
│       ├── App.jsx               # Route definitions
│       └── main.jsx              # Entry point
├── server/                       # Express Backend
│   ├── controllers/              # Request handlers
│   ├── middleware/               # Auth, error, Cloudinary, moderation
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # API route definitions
│   ├── utils/                    # generateToken, sendEmail
│   ├── app.js                    # Express app factory
│   └── server.js                 # HTTP + Socket.IO + DB entry point
└── package.json                  # Root scripts (dev, install-all, format)
```

---

## 🛠 Tech Stack

| Domain    | Technology                                         |
|-----------|----------------------------------------------------|
| Frontend  | React 19, Vite 6, React Router v7, react-toastify  |
| Backend   | Node.js, Express 4, Mongoose 8, Socket.IO 4        |
| Database  | MongoDB                                            |
| Auth      | JWT (httpOnly cookies), bcryptjs                   |
| Email     | Nodemailer (SMTP)                                  |
| Storage   | Cloudinary (optional)                              |
| Tooling   | ESLint, Prettier, Husky, Concurrently, Nodemon     |

---

## 📜 Available Scripts

| Command                 | Description                                           |
|-------------------------|-------------------------------------------------------|
| `npm run dev`           | Start both client and server concurrently             |
| `npm run client`        | Start Vite dev server only                            |
| `npm run server`        | Start Express server with Nodemon only                |
| `npm run install-all`   | Install dependencies for root, client, and server     |
| `npm run clean-install` | Remove all `node_modules`, then reinstall             |
| `npm run format`        | Run Prettier across client and server source files    |

