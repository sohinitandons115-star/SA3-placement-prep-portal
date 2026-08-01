# Technical Requirements Document

**Project:** Placement Prep Portal  
**Team:** SA3  
**Version:** 1.0 · Hackathon Build  
**Related:** [PRD.md](./PRD.md) · [README.md](./README.md)

---

## 1. Architecture Overview

```
┌──────────────────┐     HTTPS / REST      ┌──────────────────┐     Mongoose ODM     ┌─────────────┐
│  React (Vite)    │ ───────────────────▶  │  Express.js API  │ ──────────────────▶  │  MongoDB    │
│  Frontend (SPA)  │ ◀───────────────────  │  (Node.js)       │ ◀──────────────────  │  Database   │
└──────────────────┘    JSON + JWT          └──────────────────┘                      └─────────────┘
```

- **Frontend** — React SPA (Vite), Tailwind CSS, Axios, client-side routing
- **Backend** — Express.js REST API, JWT stateless auth, Mongoose ODM
- **Database** — MongoDB with three collections: `users`, `companies`, `resources`

### Architectural Decisions

| Decision | Rationale |
|---|---|
| REST over GraphQL | Simpler and faster to implement; higher team familiarity |
| JWT over session cookies | Stateless auth — no server-side session store required |
| Client-side search/filter | Dataset per user is small; avoids extra API round-trips |
| Context API over Redux | Sufficient for auth/theme state; avoids Redux boilerplate |
| No file storage (S3) | Resume upload is a bonus feature; adds infra overhead not justified by time |

---

## 2. Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend framework | React 18 | Component reuse, team familiarity, fast iteration |
| Build tool | Vite | Fast dev server / HMR, minimal config |
| Styling | Tailwind CSS | Utility-first, rapid theming including dark mode |
| Routing | React Router v6 | Standard client-side routing with protected route support |
| HTTP client | Axios | Interceptor support for automatic JWT attachment |
| Backend | Express.js | Minimal, well-understood REST framework |
| Database | MongoDB | Flexible schema, fast to prototype |
| ODM | Mongoose | Schema validation, pre-save hooks (e.g., password hashing) |
| Auth | `jsonwebtoken` | Stateless, no session store required |
| Password hashing | `bcryptjs` | Industry-standard one-way hashing |
| Input validation | `express-validator` | Declarative request validation |
| Config | `dotenv` | Keeps secrets out of source control |
| CORS | `cors` | Required for Vite dev server → API cross-origin calls |

---

## 3. Folder Structure

```
SA3-placement-prep-portal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Login, Signup, Dashboard, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── api/            # Axios instance + API call helpers
│   │   └── hooks/          # Custom hooks
│   └── .env                # VITE_API_URL
├── server/                 # Express backend
│   ├── models/             # User, Company, Resource schemas
│   ├── routes/             # auth, company, resource route files
│   ├── controllers/        # Business logic per route group
│   ├── middleware/         # Auth middleware, error handling
│   └── config/             # db.js (MongoDB connection)
├── README.md
├── PRD.md
└── TRD.md
```

---

## 4. Database Schema

### 4.1 `User`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required |
| `email` | String | Required, unique, lowercase |
| `passwordHash` | String | Required (bcrypt hash — never plain text) |
| `createdAt` | Date | Auto (timestamps) |

### 4.2 `Company`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `userId` | ObjectId → `User` | Required — enforces per-user ownership |
| `name` | String | Required |
| `role` | String | Required |
| `applicationDate` | Date | Required |
| `status` | String (enum) | `Applied`, `Online Assessment`, `Technical Interview`, `HR Interview`, `Selected`, `Rejected` |
| `createdAt` / `updatedAt` | Date | Auto (timestamps) |

### 4.3 `Resource`

| Field | Type | Constraints |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `title` | String | Required |
| `category` | String (enum) | `DSA`, `Aptitude`, `Resume`, `Interview Experience`, `Core Subjects` |
| `link` | String | Required, valid URL |
| `createdAt` | Date | Auto (timestamps) |

---

## 5. API Specification

Base URL: `/api`

### 5.1 Authentication

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | ❌ | `{ name, email, password }` | `201` + user (no password field) |
| POST | `/auth/login` | ❌ | `{ email, password }` | `200` + `{ token, user }` |

### 5.2 Companies

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/companies` | ✅ | `{ name, role, applicationDate, status }` | `201` + created record |
| GET | `/companies` | ✅ | — | `200` + array (scoped to `req.user.id`) |
| PUT | `/companies/:id` | ✅ | Any updatable field | `200` + updated record |
| DELETE | `/companies/:id` | ✅ | — | `200` + confirmation |

### 5.3 Resources

| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/resources` | ✅ | `{ title, category, link }` | `201` + created record |
| GET | `/resources` | ✅ | — | `200` + array |

### 5.4 Error Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": []
}
```

### 5.5 HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Insufficient permission (e.g., editing another user's data) |
| 404 | Resource not found |
| 500 | Server error |

---

## 6. Security Design

- Passwords hashed with `bcryptjs` (10 salt rounds) on pre-save — never stored or logged in plain text.
- JWT signed with `JWT_SECRET`, configurable expiry (`JWT_EXPIRE`, default `7d`).
- Auth middleware validates `Authorization: Bearer <token>` on all protected routes.
- All `Company` queries scoped by `userId` at the database level — prevents IDOR attacks via direct API calls.
- No secrets in source control; all sensitive config lives in `.env` (git-ignored).

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Search/filter runs client-side on already-fetched data — no redundant API calls |
| Security | No plain-text passwords; no secrets in source control; per-user data isolation enforced server-side |
| Reliability | All CRUD routes complete and functional — no partially implemented endpoints |
| Maintainability | Modular structure separating routes, controllers, models, and middleware |

---

## 8. Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `PORT` | server | Express server port |
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | JWT signing secret |
| `JWT_EXPIRE` | server | Token expiry duration |
| `VITE_API_URL` | client | Backend API base URL |

---

## 9. Testing Checklist

- [ ] Register creates a user with a hashed password
- [ ] Login rejects bad credentials; returns valid JWT on success
- [ ] Protected routes reject requests with no or invalid token
- [ ] Company CRUD — create, read, update, delete all work end-to-end
- [ ] User cannot access another user's company records
- [ ] Search and status filter return correct subsets
- [ ] Resource list displays correctly, filterable by category
- [ ] No secrets present in committed files (`.env` is git-ignored)

---

*This TRD defines **how** the system is implemented. See [PRD.md](./PRD.md) for **what** is being built and **why**.*
