# QuestionFlow

**Design. Deliver. Analyze.** A full-stack Computer Science assessment platform built with Next.js, TypeScript, PostgreSQL, and Prisma. Browse curated quizzes, publish community assessments, generate questions with Groq, and review your progress.

QuestionFlow keeps its neo-brutalist identity: bold typography, thick borders, offset shadows, bright colors, and light, dark, and high-contrast themes.

## Features

- **Assessment library:** curated, community, and AI tabs with search and category filters.
- **Interactive practice:** animated questions, keyboard-accessible choices, progress tracking, instant scores, answer review, and retakes. Guests can practice; signed-in users save their results.
- **Authoring:** create multiple-choice and true/false assessments; administrators get a category overview and user statistics.
- **AI tools:** generate assessments by topic, difficulty, and question count; get personalized recommendations through Groq.
- **Profiles:** assessment history and perfect-score badges.
- **Authentication:** hashed passwords, signed HTTP-only session cookies, and role-protected routes.
- **Accessible motion:** system reduced-motion support, focused question headings, responsive controls, and explicit retry and submission states.
- **Reliable results:** saved scores are recalculated against stored questions on the server.

## Stack

Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS 3 · Radix UI · Framer Motion 12 · Prisma 6 · PostgreSQL · Groq SDK · Zod

Dependencies use compatible release lines and a committed npm lockfile. Framework, React, and database major migrations should be tested together before changing these lines.

## Local setup

Use Node.js 24 (`nvm use`) and npm. PostgreSQL must be running; Docker is optional.

```bash
npm ci
cp .env.example .env
```

Configure `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | At least 32 characters; generate with `openssl rand -base64 48` |
| `ADMIN_EMAIL` | Administrator email used by the seed command |
| `ADMIN_PASSWORD` | Administrator password used by the seed command |
| `GROQ_API_KEY` | Optional; enables AI generation and recommendations |

Start just the database with Docker if desired:

```bash
docker compose up -d postgres
```

Create the schema, seed curated assessments and an administrator, then start the app:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open [localhost:9002](http://localhost:9002). The seed command requires both administrator variables and updates the administrator password when rerun. Normal user authentication also works without configuring an administrator.

Without a Groq key, the core assessment flows work; AI generation needs a valid key and recommendations return an empty list.

## Development and checks

```bash
npm run check         # ESLint and TypeScript
npm test              # Server grading regression tests
npm run build         # Production build, including type validation
npm start             # Production server on port 3000
npm run prisma:studio # Browse the local database
```

GitHub Actions runs install, client generation, lint, types, tests, and build on pushes to `main` and pull requests. Database-backed flows need a configured database; AI integration needs a valid provider key.

## Docker

The image uses Node.js 24, Next.js standalone output, and a non-root runtime user. A health endpoint is available at `/api/health` (process liveness).

After preparing `.env`, initialize the database from the host using the setup commands above, then:

```bash
docker compose up --build -d
```

Open [localhost:3000](http://localhost:3000). Apply committed migrations to deployed databases with `npx prisma migrate deploy` from a checkout with dependencies installed before releasing the application. The runtime image does not run migrations or seed users automatically.

## Project structure

```text
src/
  app/             Pages, layouts, and API routes
  components/      Assessment, profile, navigation, and UI components
  ai/              Groq model configuration and recommendations
  hooks/           Shared React hooks
  lib/             Authentication, data access, grading, types, and constants
prisma/            Database schema, migrations, and seed script
public/            Assets used by the landing page
tests/             Grading regression tests
.github/workflows/ Continuous integration
```

The app lives directly at the repository root; no extra `cd assessment-app` is needed.

## API overview

| Route | Purpose |
| --- | --- |
| `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` | Account and session management |
| `GET /api/assessments` | Browse assessments |
| `POST /api/assessments` | Create an assessment (authenticated) |
| `POST /api/assessments/ai` | Generate an assessment (authenticated) |
| `POST /api/assessments/:assessmentId/vote` | Vote (authenticated) |
| `GET /api/results?userId=…`, `POST /api/results` | Read authorized history and save server-graded results |
| `GET /api/admin/stats` | Administrator statistics |
| `POST /api/recommendations` | Personalized recommendations |
| `GET /api/health` | Process liveness |

## Scope

QuestionFlow is a learning and practice platform. Terminal-based coding assessments remain planned. Correct answers are available to the practice interface, and community votes currently count each accepted request rather than enforcing one vote per person.
