# Store Rating Platform

A full-stack web application where users rate stores (1–5). Built per the FullStack Intern Coding Challenge spec.

**Stack:** Express.js · MySQL · React (Vite)

## User roles

| Role | Capabilities |
|------|-------------|
| **System Administrator** | Add stores, normal users & admins; dashboard with totals (users / stores / ratings); list + filter + sort users and stores; view user details (incl. owner rating). |
| **Normal User** | Sign up, log in, update password; browse/search stores; submit & modify ratings. |
| **Store Owner** | Log in, update password; dashboard showing average rating and the list of users who rated their store. |

## Project structure

```
store-rating-app/
├── backend/    # Express + MySQL API
└── frontend/   # React (Vite) SPA
```

## Prerequisites

- Node.js 18+
- MySQL 8+ running locally

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env        # then edit DB credentials + JWT_SECRET
npm run seed                # creates schema + sample data
npm run dev                 # starts API on http://localhost:5000
```

`npm run seed` creates the database, tables, and sample accounts.

### Sample logins (password for all: `Password@123`)

| Role  | Email |
|-------|-------|
| Admin | admin@example.com |
| User  | user1@example.com |
| Owner | owner1@example.com |

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev                 # starts app on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so run both together.

## API overview

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/signup` | public | Register a normal user |
| POST | `/api/auth/login` | public | Login (all roles) |
| GET  | `/api/auth/me` | any | Current user |
| PUT  | `/api/auth/password` | any | Update password |
| GET  | `/api/admin/dashboard` | admin | Totals |
| POST | `/api/admin/users` | admin | Create user/admin/owner |
| GET  | `/api/admin/users` | admin | List + filter + sort users |
| GET  | `/api/admin/users/:id` | admin | User details |
| POST | `/api/admin/stores` | admin | Create store |
| GET  | `/api/admin/stores` | admin | List + filter + sort stores |
| GET  | `/api/admin/owners` | admin | Owners (for store form) |
| GET  | `/api/stores` | user | List stores w/ overall & own rating |
| POST | `/api/stores/:storeId/rating` | user | Submit/modify rating |
| GET  | `/api/owner/dashboard` | owner | Avg rating + raters |

## Validation rules (enforced on client and server)

- **Name:** 20–60 characters
- **Address:** max 400 characters
- **Password:** 8–16 chars, ≥1 uppercase, ≥1 special character
- **Email:** standard format
- **Rating:** integer 1–5

## Notes

- Passwords hashed with bcrypt; auth via JWT.
- All listing tables support ascending/descending sort on key fields.
- Sortable columns are server-side whitelisted to prevent SQL injection; all queries use parameterized statements.
- A normal user has one rating per store (upsert on resubmit).
