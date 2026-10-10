# Aceso Frontend

React SPA for the [Aceso](../aceso_backend) personal training & health backend: gym (exercises, routines, workout calendar), running (training plans, schedule, Strava activities) and health (daily summaries, samples, sleep, Garmin, JSON import).

## Stack

Vite 8 · React 19 · TypeScript · React Router 7 (data router) · TanStack Query 5 · openapi-fetch + openapi-typescript · react-hook-form + zod 4 · Tailwind CSS 4 · date-fns · Recharts · Vitest + Testing Library + MSW · oxlint.

## Setup

Requirements: Node 22+, npm 11+, and the backend running on `http://127.0.0.1:8000`.

```bash
npm install
cp .env.example .env.local   # optional, defaults work for local development
npm run dev                  # http://localhost:5173
```

### Environment variables

| Variable       | Default                  | Used by       | Purpose |
| -------------- | ------------------------ | ------------- | ------- |
| `VITE_API_URL` | `/api`                   | browser build | Base URL for API calls. Relative values resolve against the page origin. |
| `BACKEND_URL`  | `http://127.0.0.1:8000`  | dev server    | Target of the `/api` dev proxy (not exposed to the bundle). |

### Dev proxy

The backend has no CORS configuration, so the browser never calls it directly. `vite.config.ts` proxies `/api/*` to `BACKEND_URL` and strips the `/api` prefix (`/api/gym/exercises` → `/gym/exercises`). In production, serve the SPA behind a reverse proxy that does the same, or point `VITE_API_URL` at a same-origin path that reaches the backend.

### API types (`gen:api`)

`openapi.json` is the committed codegen source, exported from the backend app:

```bash
cd ../aceso_backend && uv run python -c "import json; from aceso.main import app; print(json.dumps(app.openapi(), indent=2))" > ../aceso_frontend/openapi.json
cd ../aceso_frontend && npm run gen:api   # writes src/shared/api/schema.d.ts
```

`openapi-typescript` 7 declares a TypeScript 5 peer; `package.json` overrides it to the project's TypeScript 6, which works for generation.

## Scripts

| Script              | What it does |
| ------------------- | ------------ |
| `npm run dev`       | Vite dev server with the API proxy |
| `npm run build`     | Typecheck (`tsc -b`) and production build |
| `npm run typecheck` | `tsc -b` only |
| `npm run lint`      | oxlint |
| `npm test`          | Vitest (watch); `npm test -- --run` for a single run |
| `npm run gen:api`   | Regenerate API types from `openapi.json` |
| `npm run preview`   | Serve the production build |

## Architecture

Screaming, feature-first layout. Each feature owns its adapter (API), state (query hooks), UI and pages; `shared` holds what is feature-agnostic.

```
src/
  app/          router (routes.ts), providers, app shell, protected routes, not-found
  shared/
    api/        openapi-fetch client, bearer/401 middleware, ApiError normalization, generated schema
    auth/       observable token store (localStorage, failure-tolerant)
    lib/        dates, formatting, zod form helpers, query client, lazy-route helper
    ui/         atoms & molecules: Button, Input, Select, Textarea, Checkbox, Modal, Card, Spinner,
                EmptyState, ErrorMessage, DateRangePicker, DataTable, ConfirmButton, QueryBoundary…
  features/
    auth/       login, register, AuthProvider/useAuth
    gym/        exercises (+ photos), routines (ordered targets, apply to date), sessions calendar & detail (sets, intervals)
    running/    plans + planned runs, schedule, activity linking, activities, Strava
    health/     dashboard: summaries table/charts, samples chart, sleep, Garmin, JSON ingest
  test/         MSW server, render helper, setup
```

Per feature:

- `api/` — typed functions over the shared client (the adapter to the backend). Nothing else talks HTTP.
- `hooks/` — TanStack Query hooks with stable query keys (`gymKeys`, `runningKeys`, `healthKeys`); mutations invalidate the keys they affect.
- `components/` — *containers* (`*Container`, panels) own hooks and state; *presentational* components (forms, lists, tables, charts) only take props.
- `pages/` — thin route entry points, lazy-loaded per route.

Cross-cutting behavior:

- **Auth**: JWT kept in `localStorage` (wrapped in try/catch). The middleware adds `Authorization: Bearer …` and clears the token on any 401 from a non-auth endpoint; `ProtectedRoute` then redirects to `/login` and the query cache is dropped.
- **Errors**: both `{"detail": "msg"}` and FastAPI's `{"detail": [{loc, msg}]}` become one `ApiError` with `status`, a readable `message` and `fieldErrors`.
- **Validation**: zod schemas mirror backend limits (name lengths, password 8–128, RPE 1–10, interval needs duration or distance, set needs a metric, planned run date within plan, ranges ≤ 366 days, samples & Garmin sync ≤ 31 days, photos JPEG/PNG/WebP ≤ 5 MB).

## Testing

Behavior-first tests with MSW mocking the backend: error normalization, client middleware (bearer, 401 handling), the auth flow (form-urlencoded login, token storage, redirects, 401 logout), exercise creation/conflict, plan creation with validation, and the health dashboard.

## Known backend gaps

- **No CORS** — the SPA depends on a proxy (dev: Vite; prod: reverse proxy).
- **No refresh token / logout endpoint** — tokens last 60 minutes; on expiry the user is sent back to login. Logout only clears the local token.
- **Strava callback does not redirect back to the SPA** — after consent the browser lands on the backend's JSON response (`{"status": "connected"}`). Return to the app and press *Sync now*.
- **Exercise photos need storage configured** on the backend (`STORAGE_BACKEND=local` with `UPLOAD_DIR`, or S3/R2 credentials); otherwise uploads fail. Photos are fetched with the bearer token and shown through object URLs.
- **No connection-status endpoints** for Strava/Garmin, so the UI cannot show whether an account is linked.
