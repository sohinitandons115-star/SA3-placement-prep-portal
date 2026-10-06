# Technical Requirements Document

**Project:** Placement Prep Portal  
**Team:** SA3  
**Version:** 1.0 · Hackathon Build  
**Related:** [PRD.md](./PRD.md) · [README.md](./README.md)

---

## 1. Architecture Overview

```
┌──────────────────┐     HTTPS / REST      ┌──────────────────┐       pg           ┌─────────────┐
│  React (Vite)    │ ───────────────────▶  │  Express.js API  │ ─────────────────▶ │ PostgreSQL  │
│  Frontend (SPA)  │ ◀───────────────────  │  (Node.js)       │ ◀───────────────── │   (Neon)    │
└──────────────────┘    JSON + JWT          └──────────────────┘                     └─────────────┘
```

- **Frontend** — React SPA (Vite), Tailwind CSS, Axios, client-side routing
- **Backend** — Express.js REST API, JWT stateless auth, PostgreSQL access through `pg`
- **Database** — Hosted PostgreSQL with `users`, `companies`, and `resources` tables

### Architectural Decisions

| Decision | Rationale |
|---|---|
| REST over GraphQL | Simpler and faster to implement; higher team familiarity |
| JWT over session cookies | Stateless auth — no server-side session store required |
| PostgreSQL over SQLite | A hosted database keeps data durable while allowing the API to run on a free service with an ephemeral filesystem |
| Neon PostgreSQL | Managed PostgreSQL accessed over TLS using `DATABASE_URL` |
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
| Database | PostgreSQL (Neon) | Hosted relational database, independent of the API service filesystem |
| PostgreSQL driver | `pg` | PostgreSQL connection pooling and parameterized queries |
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
│   ├── models/             # PostgreSQL-backed User, Company, Resource access
│   ├── routes/             # auth, company, resource route files
│   ├── controllers/        # Business logic per route group
│   ├── middleware/         # Auth middleware, error handling
│   ├── config/             # db.js (PostgreSQL pool and schema initialization)
│   └── test/               # Database and API integration tests
├── README.md
├── PRD.md
└── TRD.md
```

---

## 4. Database Schema

### 4.1 `User`

| Field | Type | Constraints |
|---|---|---|
| `id` (`_id` in API) | BIGINT | Primary key, auto-increment |
| `name` | String | Required |
| `email` | TEXT | Required, unique, case-insensitive |
| `password_hash` | TEXT | Required (bcrypt hash — never plain text) |
| `coding_belts` | JSONB | Language belt scores |
| `communication_score` | REAL | Defaults to `0` |
| `attendance` | JSONB | Quarterly and yearly percentages |
| `viva_score` | REAL | Defaults to `0` |
| `created_at` / `updated_at` | TEXT | Auto timestamps |

### 4.2 `Company`

| Field | Type | Constraints |
|---|---|---|
| `id` (`_id` in API) | BIGINT | Primary key, auto-increment |
| `user_id` (`userId` in API) | BIGINT → `users.id` | Required foreign key; cascades on user deletion |
| `name` | TEXT | Required |
| `role` | TEXT | Required |
| `applied_date` (`appliedDate` in API) | TEXT | Required ISO date |
| `status` | TEXT (enum) | `Applied`, `Online Assessment`, `Technical Interview`, `HR Interview`, `Selected`, `Rejected` |
| `created_at` / `updated_at` | TEXT | Auto timestamps |

### 4.3 `Resource`

| Field | Type | Constraints |
|---|---|---|
| `id` (`_id` in API) | BIGINT | Primary key, auto-increment |
| `title` | TEXT | Required |
| `category` | TEXT (enum) | `DSA`, `Aptitude`, `Resume`, `Interview Experience`, `Core Subjects` |
| `link` | TEXT | Required |
| `created_at` / `updated_at` | TEXT | Auto timestamps |

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
| `DATABASE_URL` | server | PostgreSQL connection string, including SSL settings |
| `JWT_SECRET` | server | JWT signing secret |
| `CLIENT_ORIGIN` | server | Allowed frontend origin(s), comma-separated |
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
