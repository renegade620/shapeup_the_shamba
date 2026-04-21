# Shapeup The Shamba System

A web application for tracking crop progress across multiple fields during a growing season.

Built for the **Shamba Records SmartSeason Technical Assessment**.

---

## Demo Credentials

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | admin@shamba.dev    | password123 |
| Agent | kamau@shamba.dev    | password123 |
| Agent | fatima@shamba.dev   | password123 |

---

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js + Express                 |
| ORM       | Prisma                            |
| Database  | PostgreSQL                        |
| Auth      | JWT (stateless, 8h expiry)        |
| Frontend  | React + Vite + React Router       |
| HTTP      | Axios with request/response interceptors |

---

## Setup

### Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally

### 1. Clone & install

```bash
git clone <repo-url>
cd shapeup_the_shamba

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/shamba_db"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=3000
```

### 3. Set up the database

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npm run db:seed
```

### 4. Start the servers

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with any demo credential above.

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

All endpoints except `/auth/login` require `Authorization: Bearer <token>`.

### Auth
| Method | Path          | Access | Description        |
|--------|---------------|--------|--------------------|
| POST   | /auth/login   | Public | Login, returns JWT |
| GET    | /auth/me      | Any    | Current user info  |

### Fields
| Method | Path                    | Access | Description              |
|--------|-------------------------|--------|--------------------------|
| GET    | /fields                 | Any    | List fields (role-scoped)|
| GET    | /fields/summary         | Admin  | Stat counts for dashboard|
| GET    | /fields/:id             | Any    | Field detail + updates   |
| POST   | /fields                 | Admin  | Create field             |
| PATCH  | /fields/:id             | Admin  | Update field             |
| DELETE | /fields/:id             | Admin  | Delete field             |

### Updates
| Method | Path                        | Access | Description              |
|--------|-----------------------------|--------|--------------------------|
| GET    | /fields/:fieldId/updates    | Any    | List updates for a field |
| POST   | /fields/:fieldId/updates    | Any    | Log a new update         |
| GET    | /updates/recent             | Admin  | Activity feed (latest N) |

### Users
| Method | Path           | Access | Description      |
|--------|----------------|--------|------------------|
| GET    | /users/agents  | Admin  | List all agents  |

---

## Data Model

```
users          — id, name, email, password (hashed), role (ADMIN|AGENT), createdAt
fields         — id, name, cropType, plantingDate, stage, assignedAgentId, createdAt
field_updates  — id, fieldId, agentId, stage, notes, createdAt
```

**`status` is computed, not stored.** See below.

---

## Status Logic

Each field has a computed `status` derived at query time — it is never written to the database. This means status automatically self-corrects as time passes without requiring any cron jobs, triggers, or manual updates.

### Rules (evaluated in priority order)

| Status      | Condition |
|-------------|-----------|
| `COMPLETED` | `stage === HARVESTED` |
| `AT_RISK`   | Stage is still `PLANTED` after **14 days** since planting date, **OR** no update has been logged in **7+ days** |
| `ACTIVE`    | Everything else — field is progressing normally |

### Why these thresholds?

- **14 days stuck at PLANTED** — germination should be visible within two weeks under normal conditions. A field that hasn't advanced past planting after this point is a signal worth flagging.
- **7 days without an update** — weekly field visits are a reasonable minimum for active monitoring. Silence beyond that warrants attention, regardless of what stage the field is in.

The thresholds are defined as named constants in `src/services/statusService.js` and can be tuned without touching any other logic.

### Implementation

```
statusService.js
  computeStatus(field)   — pure function, takes a field with its updates loaded
  withStatus(field)      — wraps a single field with its computed status
  withStatusMany(fields) — maps over an array
```

All controller responses pass through `withStatus` / `withStatusMany` before being sent to the client.

---

## Design Decisions

### 1. Status is computed, not stored

Storing status would mean it could silently drift out of sync with the actual data. Computing it at read time keeps the data model clean and makes the business rules easy to audit and change in one place.

### 2. Field update logs the stage change (transaction)

When an agent logs an update, the `field.stage` and the new `FieldUpdate` record are written in a single Prisma transaction. This prevents a state where an update record exists but the field's stage hasn't moved (or vice versa).

### 3. Role-scoped queries at the service layer, not the route layer

The `GET /fields` endpoint returns different data based on `req.user.role`. Rather than having two routes, the scoping happens inside the controller with a simple `where` clause. This keeps the API surface minimal and consistent for the frontend.

### 4. JWT, stateless, 8-hour expiry

Simple and appropriate for the scope. The frontend stores the token in `localStorage` and attaches it via an Axios request interceptor. A 401 response automatically clears the session and redirects to login.

### 5. Monorepo layout

`backend/` and `frontend/` live in the same repository to simplify review and deployment. They are independent Node projects with their own `package.json`.

---

## Project Structure

```
shapeup_the_shamba/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       — Data model
│   │   └── seed.js             — Demo data (5 fields, 3 users)
│   └── src/
│       ├── config/prisma.js    — Prisma client singleton
│       ├── middleware/
│       │   ├── auth.js         — JWT verification + role guard
│       │   └── errorHandler.js — Central error handler
│       ├── controllers/        — Request/response handling
│       ├── services/
│       │   └── statusService.js — Status computation logic
│       └── routes/             — Express route definitions
└── frontend/
    └── src/
        ├── api/                — Axios calls (auth, fields, updates)
        ├── context/            — AuthContext (session state)
        ├── components/         — Sidebar, StatusBadge, Modals
        └── pages/              — Login, AdminDashboard, AgentDashboard, FieldDetail, FieldsManage
```

---

## Assumptions

- A field can only be assigned to one agent at a time.
- Agents can only see and update fields assigned to them.
- Admins can view, create, edit, and delete any field.
- Both admins and agents can log updates on a field (admin may need to intervene).
- The `stage` on a `FieldUpdate` drives the field's `stage` forward — logging an update is the canonical way to advance a field's lifecycle.
- No registration endpoint is needed; user accounts are seeded (or created by an admin, which is out of scope for this assessment).
