# Finance Data Processing and Access Control Backend

This project is a backend implmentation for a finance dashboard system. It focuses on managing financial data securly, with role-based access control, validation, and a simple SQLite database for persistance.

## Tech Stack

- Node.js + TypeScript  
- Express.js  
- Prisma ORM  
- SQLite  
- Zod (for input validation)  
- JWT + bcrypt (for authentication)  

## Features

- User managment with active/inactive status handling  
- Role-based access control (`VIEWER`, `ANALYST`, `ADMIN`)  
- Full CRUD support for financial records with filtering and pagination  
- Dashboard APIs for summaries like income, expenses, net balance, category totals, recent activity, and trends  
- Proper validation and structured error handling  
- SQLite database with seed data for quick setup  
- Search functionality, soft delete support, and basic rate limiting  

## Role Behavior

- `VIEWER`  
  - Can only view thier own records  
  - Can access dashboard summaries and trends based on thier data  
  - Cannot create, update, or delete records  
  - Cannot manage users  

- `ANALYST`  
  - Similar to viewer, but more for analysis purpose  
  - Read-only access to records and dashboard insights  
  - Cannot modify any records  
  - No access to user managment  

- `ADMIN`  
  - Has full access to user managment  
  - Can create, update, and delete financial records (still limited to thier own records)  
  - Dashboard access is based on thier own data  

## API Overview

Base URL: `http://localhost:4000`

### Health

- `GET /health`  
  Used to check if the server is running or not  

### Auth

- `POST /auth/register`  
- `POST /auth/login`  

### Users (Admin only)

- `POST /users`  
- `GET /users`  
- `PATCH /users/:id`  

### Records

- `GET /records` (available to all authenticated users)  
  - Returns only the records owned by the logged-in user  

- `POST /records` (admin only)  
- `PATCH /records/:id` (admin only)  
- `DELETE /records/:id` (admin only)  

Filters for `GET /records`:

- `type=INCOME|EXPENSE`  
- `category=...`  
- `search=...`  
- `startDate=<ISO datetime>`  
- `endDate=<ISO datetime>`  
- `page=<number>`  
- `pageSize=<number>`  

### Dashboard

- `GET /dashboard/summary`  
- `GET /dashboard/trends?period=weekly|monthly&months=6`  

All dashboard data is caluclated using only the authenticated user's records.

## Setup

1. Install dependancies:

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

- First registered user is automaticaly assigned the ADMIN role; others default to VIEWER.
- Inactive users cannot login or access protected endpoints.
- `ANALYST` role has read-only access to records and analytics.
- `VIEWER` role can view records and dashboard only.
- All data and analytics are scoped to the logged-in user.
- Records are not permanantly deleted — soft delete is used via deletedAt.
- Aggregations are computed in the service layer for clarity.
- SQLite is used to keep setup simple and lightweight.
- Basic in-memory rate limiting is applied to auth and protected routes.

## Error Handling and Validation

- Zod validates request bodies and query params.
- Centralized error handler ensures consistant API responses.
- Unknown routes return a standard 404 response.

## Optional Enhancements Included

- JWT authentication
- Pagination on record listing
- Search support for records
- Soft delete for financial records
- Basic rate limiting
- Unit tests for validation and middleware
- Seed script for quick evaluation
