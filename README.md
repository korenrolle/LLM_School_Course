# LXP Vertical Slice (Phase 1)

This repository now includes a production-minded vertical slice proving:

1. Draft course versioning
2. Review state transition
3. Publish into immutable runtime package
4. Learner runtime consumption
5. Progress + analytics event tracking

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase-compatible schema/migrations
- Stripe intentionally out-of-scope in this slice

## Setup

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/dev/author`

## Vertical Slice Test Flow

1. Click **Seed Example Course**
2. Click **Submit Review**
3. Click **Approve**
4. Click **Publish**
5. Click **Open Learner Runtime**
6. Start lesson, interact with nodes, complete lesson

## Database Assets

- Migration: `db/migrations/001_foundational_schema.sql`
- Seed SQL: `db/seeds/001_vertical_slice_seed.sql`

These SQL files are written for Supabase/Postgres.

## Notes

- Current runtime persistence uses an in-memory repository to keep the slice runnable without infrastructure setup.
- Schema and contracts are aligned to move to Supabase tables with minimal rewrite.
