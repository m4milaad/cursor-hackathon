# Convex Backend

This project now has a full Convex backend baseline with:

- Typed schema and indexes in `convex/schema.ts`.
- Domain modules:
  - `convex/requests.ts` for request lifecycle.
  - `convex/feedback.ts` for ratings and notes.
  - `convex/resources.ts` for Taleem content.
  - `convex/audit.ts` for internal event logging.
  - `convex/admin.ts` for health and cleanup utilities.
- AI execution:
  - `convex/ai.ts` runs model calls in Node runtime.
  - `convex/http.ts` orchestrates request ingestion + AI execution.
- HTTP endpoints in `convex/http.ts`:
  - `POST /ingest` save incoming prompt.
  - `POST /submit` run end-to-end workflow.
  - `GET /health` backend health snapshot.
- Seeding helpers in `convex/seed.ts`.

## Local workflow

1. Configure Convex:

```bash
npx convex dev
```

2. Push backend changes:

```bash
npx convex dev --once
```

3. Seed sample data:

```bash
npx convex run seed:seedBackend '{"reset":true}'
```
