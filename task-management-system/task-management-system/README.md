# Task Management System - Track A (Full-Stack)

This project implements **Part 1 (Backend API)** and **Track A (Web Frontend)** from the provided assessment PDF. The mobile track was intentionally skipped as requested. The assessment requires a Node.js + TypeScript backend, SQL database via ORM, JWT authentication with access/refresh tokens, and a Next.js web frontend with responsive task CRUD, search, filtering, and pagination.

## Stack

- **Backend:** Node.js, Express, TypeScript, Prisma, SQLite
- **Frontend:** Next.js App Router, TypeScript, Axios
- **Auth:** JWT access token + refresh token rotation
- **Password Security:** bcrypt hashing

## Project Structure

```text
/task-management-system
  /backend
  /frontend
  README.md
  IMPLEMENTATION_STEPS.md
```

## Implemented Requirements

### Backend
- `/auth/register`
- `/auth/login`
- `/auth/refresh`
- `/auth/logout`
- `/tasks` - GET with pagination, filtering, search; POST create
- `/tasks/:id` - GET, PATCH, DELETE
- `/tasks/:id/toggle` - PATCH
- Password hashing with bcrypt
- User-owned tasks only
- Zod validation + standard HTTP status handling
- Prisma ORM + SQL database

### Frontend
- Login page
- Registration page
- Responsive task dashboard
- Add, edit, delete, toggle task status
- Filter by status
- Search by title
- Pagination controls
- Toast notifications
- Automatic token refresh on 401 responses

## Quick Start

### 1) Backend setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Backend runs on `http://localhost:4000`.

Demo account after seeding:
- `demo@example.com`
- `Password123!`

### 2) Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## API Notes

### Auth Flow
- Register/Login returns `accessToken`, `refreshToken`, and user profile.
- Access token is sent in `Authorization: Bearer <token>`.
- Frontend automatically calls `/auth/refresh` if a request returns 401.
- Refresh token is rotated on each refresh.
- Logout clears the stored refresh token server-side.

### Task Query Params
`GET /tasks`
- `page` - default `1`
- `limit` - default `10`, max `50`
- `status` - `PENDING` or `COMPLETED`
- `search` - title search string

## Suggested Improvements

- Move tokens to secure httpOnly cookies for production
- Add rate limiting for auth endpoints
- Add integration/unit tests
- Add debounced search input
- Add optimistic UI updates
- Swap SQLite for PostgreSQL/MySQL in deployment

## Assessment Mapping

The uploaded assessment asks for the full backend plus Next.js web frontend for Track A, with auth, refresh flow, task CRUD, pagination, filtering, searching, responsive UI, and toast notifications. This implementation covers those items and excludes the mobile Flutter section as requested.
