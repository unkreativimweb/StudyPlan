# Dynamic Study Planner - Project Context & Rules

This document outlines the strict architecture, design guidelines, and business logic for the Dynamic Study Planner. All future agents working on this project MUST adhere to these rules.

## 1. Tech Stack & Architecture
- **Backend:** NestJS, Prisma ORM, SQLite (`backend/prisma/dev.db`).
  - Strict Typing is required. Use global pipes (`ValidationPipe`) and DTOs.
  - **Prisma Note:** We are using Prisma v5. Do not upgrade to Prisma v7 randomly, as it breaks connection strings without a `prisma.config.ts`. The `schema.prisma` contains the hardcoded `url = "file:./dev.db"`.
- **Frontend:** React, Vite, Tailwind CSS v3, Framer Motion, Lucide React.
  - **Tailwind Note:** We use Tailwind v3 because of custom PostCSS variables. Do not install Tailwind v4.

## 2. Core Business Logic (The "Smart" Engine)
- **Sichtungsphase (Mandatory Triage):** Every newly created `Exam` MUST have a topic titled "Sichtungsphase" with `isSichtung = true`. As long as this topic is not `COMPLETED`, the Scheduler (`SchedulerService`) will strictly ignore all other topics for this exam.
- **Velocity Tracking (EMA):** When a topic is completed, the system compares the estimated duration vs. actual duration. It updates the specific `velocityFactor` (`S`, `M`, `L`, `XL`) of that exact `Exam` using an Exponential Moving Average: `(0.3 * current_deviation) + (0.7 * historical_factor)`. This ensures "forgiving" estimates that don't fluctuate wildly.
- **Net Time Calculation:** The `SchedulerService` calculates daily available time by taking 24 hours, subtracting `FixedBlockers` (e.g., sleep, university), and subtracting a daily buffer.
- **Priority Scheduling:** Topics are scheduled and ordered primarily by the Exam's deadline.

## 3. Frontend Aesthetic Rules (STRICTLY NO "AI SLOP")
The frontend is designed to be a high-end, industrial-minimalist productivity tool. 
- **NO Generic Aesthetics:** No rounded bootstrap-style cards, no soft drop shadows, no purple/pink gradients, no generic AI-generated vibes.
- **NO Filler Text:** Absolutely NO cheesy motivational quotes ("You got this!"). Keep it completely functional, sharp, and data-dense.
- **Typography:** We use three primary fonts via CSS variables depending on the theme: `Fraunces` (Editorial), `Syne` (Brutalist), `JetBrains Mono` (Terminal). Do not use Arial, Roboto, Inter, or Space Grotesk.
- **Layout:** Use hard borders, dense tables, strong whitespace, and mono-spaced metadata. 
- **Motion:** Use `framer-motion` for micro-interactions (e.g., staggered reveals of tasks, strike-through animations). Do not use cheap hover effects.
- **Backgrounds:** The app uses a subtle SVG noise/grain filter (`bg-grain` class) over a hard grid pattern to provide texture.

## 4. Current State & Remaining Todos
The MVP architecture is complete. The Scheduler API and the Dashboard read the data flawlessly.

**Future Features / Todos to Build:**
- **CRUD Forms:** The frontend lacks forms to add new Exams, Topics, and Blockers. Currently, data relies on the backend `seed.ts`.
- **Session Tracking:** The frontend needs the ability to "Play" and "Stop" a topic. This should call a backend API to create a `SessionTrack` record and sum up `actualDurationMinutes` to properly feed the Velocity Engine.
- **State Management:** Introduce a global store (Zustand or React Query) for API data fetching and optimistic UI updates.
- **Deployment:** The user hosts this in an LXC container accessible via Tailscale VPN. No Auth needed.

*Follow these rules closely to maintain the architectural integrity and the highly specific aesthetic of the project.*
