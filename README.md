# EduRisk AI

EduRisk AI is a full-stack academic risk intelligence and early intervention platform. It turns attendance, assessment, assignment, exam, engagement and prior performance signals into a transparent risk score so faculty and mentors can act before a student falls behind.

## Stack
React + TypeScript + Vite · Express + TypeScript · PostgreSQL · Redis · Docker Compose · Recharts

## Architecture
`React dashboard → REST API → Express risk service → PostgreSQL + Redis`

The frontend uses the Express API for all student, risk and intervention data. The API will use PostgreSQL and Redis when they are configured; its development mode includes a realistic in-memory seed so the interface remains demonstrable while infrastructure is offline.

## Run locally
```bash
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:5173. Demo login: `admin@edurisk.ai` / `password` (role can be Admin, Faculty or Mentor).

## Deploy on Vercel

This repository is Vercel-ready: `api/index.ts` and `api/[...path].ts` expose the same Express REST API as serverless functions, while `frontend/dist` serves the React SPA. Import the repository into Vercel with the project root left as `.`; the included `vercel.json` supplies the build and SPA rewrite settings.

Set these Vercel environment variables for a production deployment:
- `JWT_SECRET` — a long random secret
- `NODE_ENV=production`
- `ALLOW_DEMO_FALLBACK=false`
- `DATABASE_URL` and `REDIS_URL` — managed PostgreSQL and Redis URLs (optional for the seeded demo, recommended for persistence)

If the Vercel project is configured with `frontend` as its Root Directory instead, deploy the `backend` folder as a second Vercel project. The backend includes Vercel function entries in `backend/api/`; set `VITE_API_URL` in the frontend project to the backend URL ending in `/api`, and set the backend `CORS_ORIGIN` to the frontend Vercel URL. A Vite development proxy only works locally; it is not used by a static Vercel deployment.

## Run with Docker
```bash
docker compose up --build
```
This starts PostgreSQL, Redis, the Express API on port 4000 and the React app on port 5173. The schema is loaded from `database/init.sql`.

## Environment
`PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `CORS_ORIGIN`. See `.env.example`.

## REST API
- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/students`, `/api/students/:id`
- `GET/POST/PUT /api/attendance`, `/api/attendance/:id`
- `GET/POST/PUT /api/assessments`, `/api/assessments/:id`
- `GET /api/risk/students`, `GET /api/risk/students/:id`, `POST /api/risk/calculate/:studentId`
- `GET/POST/PUT /api/interventions`, `/api/interventions/:id`
- `GET /api/analytics/overview`, `/api/analytics/departments`, `/api/analytics/performance`

## Risk model
Risk is calculated on the backend by `backend/src/services/riskPredictionService.ts`:
`100 - (attendance × .25 + assessment × .30 + assignment × .15 + exam × .20 + engagement × .10)`.
Scores 0–30 are Low, 31–60 Medium, and 61–100 High. The service also generates plain-language factor explanations and intervention recommendations.
