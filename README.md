# Millass Club

Private beta intake and pre-list for Millass. Two rooms in one app, with separate data:

- **Club** (`/`, `/apply`, `/club`, `/experiences`, `/desk`, `/profile/:id`): applications, public profiles, club desk.
- **Network** (`/network`, `/network/directory`, `/network/studio/:id`, `/network/join`, `/network/briefs`, `/network/desk`): published studios, briefs, proposals, messages.

There is no sign-in wall in this version. The desk routes are internal. Public loaders strip email, phone, notes, budget and status.

## How a request runs

1. A file in `src/routes` is a URL. `network.studio.$id.tsx` is `/network/studio/:id`. `network.tsx` is only an `<Outlet />`.
2. The page `loader` calls a server function in `src/lib/millass/api.ts` or `src/lib/millass/network-api.ts`.
3. Those functions use `getSql()` from `src/lib/db.ts`. Preview uses PGLite. `DATABASE_URL` uses Neon.
4. Migrations in `migrations/` run before the first query. `0002` is Club. `0003` is Network plus `coach_verified` and `interest_leads`.

Club and Network interest lists share `interest_leads` and are split by `realm` (`club` or `network`). A brief is visible only to its owner studio or an invited studio.

## Stack

TanStack Start, React, Tailwind v4, Zod, Postgres. Auth in this sandbox build is off.
