# Team Task Manager

A polished full-stack task manager built with the latest Next.js App Router, Better Auth for authentication, and Turso (libSQL) for data storage.

## Overview

This app is designed for a job interview assessment and keeps the scope practical:

- Email/password authentication with Better Auth
- Project creation and team membership management
- Task creation, assignment, priorities, and status tracking
- Role-based access control with Admin and Member roles
- Dashboard summary for tasks, progress, and overdue work
- Clean, modern UI optimized for Vercel deployment

## Tech Stack

- **Framework:** Next.js 16 App Router
- **Language:** TypeScript
- **Auth:** Better Auth
- **Database:** Turso / libSQL
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS

## Features

### Authentication
- Sign up and sign in with email and password
- Secure session handling through Better Auth
- Auth route handler configured for the App Router

### Projects and Teams
- Create projects with a custom accent color
- Auto-assign project creator as Admin
- Add teammates to a project by email
- Restrict membership management to Admins

### Tasks
- Create tasks inside a project
- Assign tasks to project members
- Track priority, due date, and status
- Update status from Todo to In Progress to Done

### Dashboard
- Quick counts for projects, tasks, completed work, and overdue work
- Upcoming task list
- Recent task overview

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Create your environment file

Copy `.env.example` to `.env.local` and fill in the values.

Required variables:

- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN`

### 3) Create the database tables

This repository includes generated Drizzle migrations in `drizzle/`.

Apply them to Turso after setting your environment:

```bash
npm run db:push
```

If you change the auth configuration later, regenerate the auth schema first:

```bash
npm run auth:generate
```

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint
- `npm run auth:generate` - regenerate the Better Auth Drizzle schema
- `npm run db:generate` - generate Drizzle migrations
- `npm run db:push` - apply Drizzle migrations

## Deployment

### Vercel

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables from `.env.example` in the Vercel project settings.
4. Set `BETTER_AUTH_URL` to your deployed Vercel URL.
5. Run `npm run db:push` once against your Turso database.

### Turso

- Create a Turso database and generate an auth token.
- Set the resulting `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in Vercel.

## Project Structure

- `src/app` - routes, pages, and API handler
- `src/components` - shell and auth UI
- `src/db` - auth schema, app schema, and database client
- `src/lib` - auth helpers, data access, and server actions

## Notes

- The app is intentionally kept lean for assessment purposes.
- If you update the Better Auth config or add plugins, regenerate the auth schema and rerun the database migration.
- The UI is responsive and suitable for a short live demo.
