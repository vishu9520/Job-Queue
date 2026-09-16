# Mini Job Queue Backend

NestJS API for the AIRTH intern assignment.

## Features

- `POST /jobs` creates a pending job.
- `GET /jobs` lists jobs, with optional `status` and `search` query filters.
- `GET /jobs/stats` returns counts for all statuses.
- `PATCH /jobs/:id/status` updates job status.
- `DELETE /jobs/:id` deletes a job.
- `POST /jobs/process-next` is a small bonus worker endpoint that starts the oldest pending job and then completes or fails it after a short delay.
- Socket.io broadcasts job and stats updates to connected dashboards.

## Status Rules

Allowed transitions:

- `pending -> running`
- `running -> completed`
- `running -> failed`

`completed` and `failed` are terminal states.

The status rule is enforced in the backend, not only in React. This means direct API callers must follow the same state machine. To handle two browser tabs trying to start the same pending job at the same time, the service performs an atomic conditional update: it updates by `id` and the expected current `status`. If another request changes the job first, the second request updates zero records and receives a `409 Conflict`.

## Database

This implementation uses SQLite through Prisma because the assignment asks for PostgreSQL or SQLite persistence. The same atomic transition approach still applies because each status change uses a conditional update against the expected current status.

## Setup

Create `backend/.env`:

```bash
DATABASE_URL="file:./dev.db"
PORT=3001
```

Install and prepare Prisma:

```bash
npm install
npm run prisma:generate
npm run db:push
```

Run locally:

```bash
npm run start:dev
```

The API runs on `http://localhost:3001` by default.

## Tests

```bash
npm run test
```

The service tests cover valid transitions, invalid terminal-state transitions, and the concurrency-conflict path.
