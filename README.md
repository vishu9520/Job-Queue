<div align="center">

# ⚡ TaskFlow — Mini Job Queue Management Dashboard

**A resilient, full-stack Job Queue orchestration platform built with NestJS, React, Prisma, and Socket.io.**  
*Engineered to guarantee strict state machine integrity, atomic concurrency protection, and sub-millisecond multi-client synchronization.*

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

</div>

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & State Machine](#-system-architecture--state-machine)
- [Architectural Breakdown & Problem Reasoning ("Think About This")](#-architectural-breakdown--problem-reasoning)
  - [1. Where should state transition rules be enforced?](#1-where-should-state-transition-rules-be-enforced)
  - [2. What happens if someone bypasses the UI and calls the API directly?](#2-what-happens-if-someone-bypasses-the-ui-and-calls-the-api-directly)
  - [3. What happens when two requests arrive simultaneously? (The Two-Tab Problem)](#3-what-happens-when-two-requests-arrive-simultaneously-the-two-tab-problem)
  - [4. How to prevent invalid or inconsistent state across tabs?](#4-how-to-prevent-invalid-or-inconsistent-state-across-tabs)
- [Tech Stack](#-tech-stack)
- [API Reference](#-api-reference)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup-nestjs)
  - [2. Frontend Setup](#2-frontend-setup-react--vite)
  - [3. Running Unit Tests](#3-running-backend-unit-tests)
- [Testing Concurrency in the UI](#-testing-concurrency-in-the-ui)

---

## 🧭 Overview

In modern distributed systems, background job queues require robust state management, absolute protection against race conditions, and real-time visibility across concurrent operator sessions.

**TaskFlow** solves common distributed queue pitfalls:
- **Zero-trust validation:** Guarantees that client-side state manipulation cannot corrupt backend records.
- **Optimistic Concurrency Control (OCC):** Prevents double-execution or conflicting mutations when two operators trigger actions simultaneously.
- **Instant Reactive Updates:** Keeps all open browser windows continuously synced using WebSockets without expensive polling.
- **Human-Crafted SaaS Interface:** Designed with a clean, high-contrast white/slate/blue visual design system.

---

## ✨ Key Features

- 🔄 **Strict Backend State Machine**: Enforces valid status progressions (`pending` $\rightarrow$ `running` $\rightarrow$ `completed` / `failed`) with immutable terminal states.
- ⚡ **Atomic SQL Updates & Concurrency Guard**: Mitigates race conditions using conditional SQL writes and version counters, gracefully responding with `409 Conflict`.
- 📡 **Real-Time Multi-Tab Synchronization**: Instant bidirectional updates using Socket.io broadcast events (`jobCreated`, `jobUpdated`, `jobDeleted`, `statsUpdated`).
- 🧪 **Interactive Concurrency Simulator ("Test Race")**: A dedicated UI testing tool that fires 2 concurrent status update requests to the NestJS API at the exact same millisecond.
- ⚙️ **Simulated Background Worker Engine**: An automated runner (`POST /jobs/process-next`) that processes jobs sequentially through their complete lifecycle.
- 🔍 **Real-Time Search & Status Filtering**: Instant client-side filtering by job title, job type, and execution status.
- 🧼 **Clean Enterprise UX**: Built with modern typography, crisp card layouts, high-contrast badges, and informative notification toasts.

---

## 🏛️ System Architecture & State Machine

### State Transition Lifecycle

```
               ┌──────────────┐
               │   pending    │
               └──────┬───────┘
                      │
                      ▼ (Start Job)
               ┌──────────────┐
               │   running    │
               └───┬──────┬───┘
                   │      │
      (Complete)   │      │   (Fail)
  ┌────────────────┘      └───────────────┐
  ▼                                       ▼
┌──────────────┐                     ┌──────────────┐
│  completed   │ (Terminal State)    │    failed    │ (Terminal State)
└──────────────┘                     └──────────────┘
```

- **Valid Transitions**:
  - `pending` $\rightarrow$ `running`
  - `running` $\rightarrow$ `completed`
  - `running` $\rightarrow$ `failed`
- **Terminal States**: `completed` and `failed` cannot be transitioned to any other state.
- **Illegal Transitions**: (e.g. `pending` $\rightarrow$ `completed`, `completed` $\rightarrow$ `running`) are rejected with `400 Bad Request`.

---

## 🧠 Architectural Breakdown & Problem Reasoning

### 1. Where should state transition rules be enforced?

> **Rule:** State transition rules **must be enforced strictly on the backend** inside the business service and database layers.

- **Why client-side rules are not enough:** Client-side button disables and validation checks are only convenience mechanisms for user experience. They can be bypassed using DevTools, curl/Postman scripts, or simply stale browser state caused by network latency.
- **Backend Implementation:** The NestJS `JobsService` maintains a single source of truth using an internal transition matrix:
  ```typescript
  const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
    pending: ['running'],
    running: ['completed', 'failed'],
    completed: [], // Terminal
    failed: [],    // Terminal
  };
  ```
  Any request violating this map is rejected immediately with an HTTP `400 Bad Request`.

---

### 2. What happens if someone bypasses the UI and calls the API directly?

If an external actor sends direct HTTP requests (e.g. via cURL or custom scripts):

1. **DTO & Schema Validation:** NestJS `ValidationPipe` running globally checks incoming request payloads against `class-validator` rules (`@IsEnum`, `@IsNotEmpty`, `@IsString`).
2. **Terminal State Immutability:** If a request attempts to mutate a terminal job (e.g., `PATCH /jobs/:id/status` on a `completed` job), the service throws:
   ```json
   {
     "statusCode": 400,
     "message": "Cannot change status of a 'completed' job. 'completed' is a terminal state.",
     "error": "Bad Request"
   }
   ```
3. **Audit Log & Version Tracking:** Every mutation increments the entity's `version` counter and updates `updatedAt`.

---

### 3. What happens when two requests arrive simultaneously? (The Two-Tab Problem)

> **Scenario:** Two operators have the same pending job open in separate browser tabs. Both click **"Start Job"** at the exact same millisecond.

#### The Problem:
Without concurrency safeguards, both requests could read `status: 'pending'`, execute duplicate execution routines, or cause inconsistencies.

#### The Solution (Optimistic Locking & Atomic Conditional Writes):
1. **Atomic Conditional SQL Query:**
   ```sql
   UPDATE jobs 
   SET status = 'running', version = version + 1, updatedAt = CURRENT_TIMESTAMP
   WHERE id = :id AND status = 'pending';
   ```
2. **Execution Flow:**
   - **Request 1** acquires the write lock first. The condition `status = 'pending'` matches. The row updates, `version` increments to `2`, and 1 row is affected. Request 1 returns `200 OK`.
   - **Request 2** executes immediately after. It checks `WHERE id = :id AND status = 'pending'`. Because Request 1 already changed the status to `'running'`, **0 rows match**.
3. **Graceful Conflict Response:**
   The backend detects `affectedRows === 0`, queries the latest state, and returns HTTP `409 Conflict`:
   ```json
   {
     "statusCode": 409,
     "message": "Concurrency conflict: Job status was updated to 'running' by another request while processing.",
     "error": "Conflict"
   }
   ```

---

### 4. How to prevent invalid or inconsistent state across tabs?

To ensure clients never display out-of-sync data:

1. **Socket.io Live Event Broadcast:** Whenever any write operation completes (create, status transition, delete), the NestJS WebSocket Gateway broadcasts the updated entity to all active browser connections:
   - `jobCreated` $\rightarrow$ Prepend job to list & increment total.
   - `jobUpdated` $\rightarrow$ Mutate target job card in real time.
   - `jobDeleted` $\rightarrow$ Remove job from list.
   - `statsUpdated` $\rightarrow$ Refresh status metrics counter across all screens.
2. **Immediate UI Refresh:** Any open tab automatically transitions the job card to its new state without requiring a manual page refresh.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [NestJS 10](https://nestjs.com/) (TypeScript)
- **Database**: SQLite (via [Prisma ORM 6](https://www.prisma.io/))
- **Real-Time WebSockets**: `@nestjs/platform-socket.io` & `socket.io`
- **Validation**: `class-validator`, `class-transformer`
- **Testing**: Jest unit & transition test suites

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Networking**: Axios + `socket.io-client`

---

## 📡 API Reference

| Method | Endpoint | Description | Request Body / Query | Success Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/jobs` | Create a new job (`pending`) | `{ "title": string, "type": string }` | `201 Created` |
| `GET` | `/jobs` | List all jobs with optional filters | `?status=pending&search=email` | `200 OK` (Array) |
| `GET` | `/jobs/stats` | Status counts breakdown | *None* | `200 OK` (Counts object) |
| `GET` | `/jobs/:id` | Get job by ID | *None* | `200 OK` (Job object) |
| `PATCH` | `/jobs/:id/status` | Transition job status | `{ "status": "running" \| "completed" \| "failed" }` | `200 OK` / `409 Conflict` |
| `DELETE` | `/jobs/:id` | Delete job | *None* | `200 OK` |
| `POST` | `/jobs/process-next` | Simulate background worker | *None* | `200 OK` |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** `v18.0.0` or higher
- **npm** `v9.0.0` or higher

---

### 1. Backend Setup (NestJS)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Generate Prisma Client & sync SQLite database
npx prisma db push

# Start development server
npm run start:dev
```
> The backend server will start on **`http://localhost:3001`**.

---

### 2. Frontend Setup (React + Vite)

```bash
# In a separate terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Launch frontend application
npm run dev
```
> The dashboard will be available at **`http://localhost:5173`**.

---

### 3. Running Backend Unit Tests

Comprehensive unit tests validate state transition rules, illegal transitions, and optimistic locking conflict detection:

```bash
cd backend
npm test
```

#### Test Coverage Includes:
- ✅ Create job with default `pending` status
- ✅ Filter jobs by status and search queries
- ✅ Valid transition: `pending` $\rightarrow$ `running`
- ✅ Valid transition: `running` $\rightarrow$ `completed`
- ✅ Valid transition: `running` $\rightarrow$ `failed`
- ✅ Rejection: `pending` $\rightarrow$ `completed` (Throws `400 Bad Request`)
- ✅ Rejection: Mutating `completed` or `failed` (Terminal State checks)
- ✅ Concurrency: Race condition collision (Throws `409 Conflict`)

---

## ⚡ Testing Concurrency in the UI

You can visually verify the atomic concurrency handler right from the dashboard:

1. Click **"+ New Job"** and create a pending task.
2. On the pending job card, click the **"Test Race"** button.
3. The client will immediately fire **2 parallel HTTP requests** (`Promise.allSettled`) to `PATCH /jobs/:id/status` with `running`.
4. **Observe the result:**
   - One request succeeds and transitions the job to `running`.
   - The second request is rejected by SQLite/NestJS with **`409 Conflict`**.
   - A warning notification toast pops up:  
     `"Atomic Concurrency Verified! ⚡ 1 request succeeded. 2nd request caught: 409 Conflict"`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
