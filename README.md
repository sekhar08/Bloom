## Bloom

Bloom is a Next.js 16 screen-recording app with:

- Auth.js OAuth sign-in with Google
- Neon + Drizzle persistence for users, sessions, and recordings
- Mux uploads for authenticated recordings only
- Per-user dashboards and protected recording detail pages

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your Auth.js OAuth credentials, Neon `DATABASE_URL`, and Mux tokens.
3. Push the database schema:

```bash
bun run db:push
```

4. Start the app:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `bun dev`
- `bun run lint`
- `bun run build`
- `bun run db:generate`
- `bun run db:push`

## Notes

- Legacy `data/recordings.json` is no longer the source of truth.
- Recording ownership is enforced through the app database via `recordings.userId`.
- Recording detail pages live at `/recordings/[recordingId]`. The old `/video/[playbackId]` route redirects owners to the new route.
