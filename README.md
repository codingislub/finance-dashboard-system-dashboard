# Finance Data Processing and Access Control Backend

A backend assignment implementation for a finance dashboard system with role-based access control, financial record management, dashboard summaries, validation, and SQLite persistence.

## Tech Stack

- Node.js + TypeScript
- Express.js
- Prisma ORM
- SQLite
- Zod (input validation)
- JWT + bcrypt (authentication)

## Features

- User and role management with statuses (`ACTIVE`, `INACTIVE`)
- Role-based access control (`VIEWER`, `ANALYST`, `ADMIN`)
- Financial records CRUD with filtering and pagination
- Dashboard summary APIs (income, expense, net, category totals, recent activity, trends)
- Validation and structured error handling
- SQLite persistence and seed data

## Role Behavior

- `VIEWER`
  - Can read records
  - Can read dashboard summaries/trends
  - Cannot create/update/delete records
  - Cannot manage users
- `ANALYST`
  - Can read records
  - Can read dashboard summaries/trends
  - Cannot create/update/delete records
  - Cannot manage users
- `ADMIN`
  - Full access: user management + record create/read/update/delete + dashboard access

## API Overview

Base URL: `http://localhost:4000`

### Health

- `GET /health`

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Users (Admin only)

- `POST /users`
- `GET /users`
- `PATCH /users/:id`

### Records

- `GET /records` (all authenticated roles)
- `POST /records` (admin only)
- `PATCH /records/:id` (admin only)
- `DELETE /records/:id` (admin only)

Filters for `GET /records`:

- `type=INCOME|EXPENSE`
- `category=...`
- `startDate=<ISO datetime>`
- `endDate=<ISO datetime>`
- `page=<number>`
- `pageSize=<number>`

### Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/trends?period=weekly|monthly&months=6`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
copy .env.example .env
```

3. Run database migration:

```bash
npm run prisma:migrate
```

4. Seed sample data:

```bash
npm run seed
```

5. Start development server:

```bash
npm run dev
```

## Demo Credentials (after seed)

- Admin: `admin@example.com` / `password123`
- Analyst: `analyst@example.com` / `password123`
- Viewer: `viewer@example.com` / `password123`

## Assumptions and Design Choices

- First registered user is bootstrapped as `ADMIN`; all subsequent public registrations default to `VIEWER`.
- Inactive users cannot authenticate or access protected APIs.
- `ANALYST` role has read-only access to records and analytics.
- `VIEWER` role can view records and dashboard only.
- Aggregations are computed in service logic from persisted records for clarity.
- SQLite is used to keep local setup simple for assessment.

## Error Handling and Validation

- Zod validates request payloads and query parameters.
- Centralized error middleware maps known failures to useful status codes.
- Not found route handler returns a consistent `404` response.

## Optional Enhancements Included

- JWT authentication
- Pagination on record listing
- Seed script for quick evaluation
