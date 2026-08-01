# Placement Prep Portal

> A centralized dashboard for students to track campus placements, monitor interview progress, and access preparation resources — built in 2 hours by Team SA3.

**Stack:** MongoDB · Express.js · React (Vite) · Node.js · JWT · Tailwind CSS

---

## Overview

Managing campus placements means juggling dozens of applications, multiple interview rounds, and scattered resources. This portal gives every student a single, authenticated workspace to stay on top of it all.

→ Product requirements: [`PRD.md`](./PRD.md)  
→ Technical design: [`TRD.md`](./TRD.md)

---

## Features

**Core**
- 🔐 Secure auth — JWT-protected registration & login
- 📊 Dashboard — live counts for applied, active, selected, and rejected
- 📁 Application tracker — full CRUD with status lifecycle
- 🔍 Search & filter — by company name and status
- 📚 Resource library — categorized prep links (DSA, Aptitude, Resume, Interview Experience, Core Subjects)

**Status lifecycle:** `Applied → Online Assessment → Technical Interview → HR Interview → Selected / Rejected`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Validation | express-validator |

---

## Project Structure

```
SA3-placement-prep-portal/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── api/
│   │   └── hooks/
│   └── .env
├── server/                 # Express backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── config/
├── PRD.md
├── TRD.md
└── README.md
```

---

## Getting Started

**Prerequisites:** Node.js v18+, npm, MongoDB (local or Atlas)

```bash
# Clone
git clone https://github.com/anishagrawal25/SA3-placement-prep-portal.git
cd SA3-placement-prep-portal

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Frontend: `http://localhost:5173` · Backend API: `http://localhost:5000`

---

## Environment Variables

**`server/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Never commit `.env` files — both are covered by `.gitignore`.

---

## API Reference

Base URL: `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register a new user |
| POST | `/auth/login` | ❌ | Login and receive JWT |
| GET | `/companies` | ✅ | Get all user applications |
| POST | `/companies` | ✅ | Add a company application |
| PUT | `/companies/:id` | ✅ | Update an application |
| DELETE | `/companies/:id` | ✅ | Delete an application |
| GET | `/resources` | ✅ | Get all resources |
| POST | `/resources` | ✅ | Add a resource |

Full contracts in [`TRD.md § 5`](./TRD.md#5-api-specification).

---

## Database Schema

| Model | Fields |
|---|---|
| `User` | `name`, `email`, `passwordHash` |
| `Company` | `userId`, `name`, `role`, `applicationDate`, `status` |
| `Resource` | `title`, `category`, `link` |

Full schema in [`TRD.md § 4`](./TRD.md#4-database-schema).

---

<p align="center">Built with ⚡ during a 2-hour hackathon · Team SA3</p>
