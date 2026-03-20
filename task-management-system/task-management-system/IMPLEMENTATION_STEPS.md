# Implementation Steps

This document records how the solution was implemented step by step.

## 1. Read and scope the assessment
I reviewed the uploaded PDF and selected **Track A** only, because the request explicitly said to ignore the mobile part. The PDF asks for a mandatory backend API using Node.js + TypeScript + SQL ORM, plus a Next.js frontend for Track A.

## 2. Chosen architecture
I split the solution into two apps:
- `backend/` for the Express API
- `frontend/` for the Next.js web app

This keeps responsibilities clean and makes local setup straightforward.

## 3. Backend design
I used:
- **Express** for routing
- **TypeScript** for type safety
- **Prisma** as the ORM
- **SQLite** as the SQL database for easy local setup
- **Zod** for request validation
- **bcryptjs** for password hashing
- **jsonwebtoken** for access and refresh tokens

### Why SQLite?
The assessment requires an SQL database with Prisma or TypeORM. SQLite satisfies the SQL requirement while keeping setup very simple for a take-home project.

## 4. Database schema
I created two models:
- `User`
- `Task`

### User fields
- `id`
- `name`
- `email`
- `passwordHash`
- `refreshTokenHash`
- timestamps

### Task fields
- `id`
- `title`
- `description`
- `status` (`PENDING` / `COMPLETED`)
- `userId`
- timestamps

The task model is related to the user model so tasks always belong to the logged-in user, which is required by the assessment.

## 5. Authentication implementation
I implemented the required endpoints:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Register
- Validate input
- Check if email already exists
- Hash password with bcrypt
- Create user
- Generate access token
- Generate refresh token
- Hash refresh token before storing it in DB

### Login
- Validate input
- Find user by email
- Compare password with bcrypt
- Return new access + refresh tokens
- Replace stored refresh token hash

### Refresh
- Validate refresh token
- Verify JWT signature
- Compare the provided refresh token against the stored hash
- Rotate both tokens

### Logout
- Accept refresh token
- Best-effort verification
- Clear stored refresh token hash so old token can no longer be used

This matches the PDF requirement for access tokens, refresh tokens, logout, and bcrypt password hashing.

## 6. Authorization middleware
I added a `requireAuth` middleware that:
- reads the `Authorization` header
- verifies the access token
- attaches the user payload to the request
- returns `401` if the token is missing or invalid

All task endpoints are protected with this middleware.

## 7. Task CRUD implementation
I implemented the required task endpoints:
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/toggle`

### Ownership protection
Every read/update/delete first checks that the task belongs to the authenticated user.

### GET /tasks features
This endpoint includes:
- **pagination** via `page` and `limit`
- **filtering** via `status`
- **searching** via partial title match

That directly matches the assessment requirement for the main task list endpoint.

## 8. Validation and error handling
The PDF asks for validation and clear HTTP status codes. I handled that by:
- using **Zod** schemas for request validation
- returning 400 for invalid requests
- returning 401 for auth failures
- returning 404 when a task is not found
- returning 409 for duplicate user registration
- using a global Express error handler

This satisfies the technical requirement around clear error handling.

## 9. Seed data
I added a Prisma seed script to create:
- a demo user
- a few starter tasks

This makes the project easier to test quickly.

## 10. Frontend design
For the frontend, I used:
- **Next.js App Router**
- **TypeScript**
- **Axios**
- plain CSS for fast, readable styling

The frontend is split into:
- `app/login`
- `app/register`
- `app/dashboard`
- reusable components
- API/auth utility helpers

## 11. Authentication pages
I created:
- a login page
- a registration page

Both pages:
- submit to the backend
- store returned tokens and user info in local storage
- redirect to the dashboard on success

The assessment requires login and registration pages connected to the backend API.

## 12. Automatic token refresh on the frontend
I added an Axios interceptor that:
- attaches the access token to requests
- watches for 401 responses
- calls `/auth/refresh` with the refresh token
- updates stored tokens
- retries the failed request

This covers the requirement to use the refresh token to stay logged in.

## 13. Task dashboard implementation
The dashboard includes:
- current user summary
- task create/edit form
- task list cards
- status badges
- status filter dropdown
- title search input
- pagination controls
- logout button

The UI is responsive and works on smaller screens by collapsing the toolbar and keeping cards fluid.

## 14. Task CRUD in the UI
I implemented the required task interactions in the dashboard:
- add task
- edit task
- delete task
- toggle task status

I also added small toast notifications for successful actions, matching the PDF requirement.

## 15. Security and practical trade-offs
For this take-home version:
- access token and refresh token are stored in local storage for simplicity
- refresh tokens are still hashed in the database
- refresh token rotation is enabled

For a production version, I would move tokens to secure httpOnly cookies.

## 16. Final packaging
I packaged everything into one folder with:
- backend code
- frontend code
- root README
- implementation notes

The mobile Flutter part was intentionally not included, per the request.
