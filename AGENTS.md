<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Procura — project-specific notes

AI-assisted B2B procurement network MVP for Hungarian SMEs. Details: README.md.
Standing development brief for autonomous runs: ROUTINE_PROMPT.md.

## Commands

- `npm run dev` – development server (http://localhost:3000)
- `npm run build` – production build (includes TypeScript checking)
- `npx prisma db push` – sync schema into the SQLite DB (prisma/dev.db)
- `npm run db:seed` – demo data (idempotent, upsert-based)
- `npm run smoke` – smoke test (needs a seeded DB; HTTP checks if dev server runs)
- `npm run test` – vitest unit suite (needs a seeded DB)

## Conventions and architecture

- **Language split**: the product targets the Hungarian market, so all
  user-facing text is Hungarian (UI copy, status labels, error messages,
  emails, AI output). Everything code-level is English (identifiers, slugs,
  comments, commit messages, docs, console output, tests).
- All business logic lives in server actions: `src/lib/actions.ts` (`"use server"`)
- AI calls only in `src/lib/ai.ts`; every AI feature has a rule-based fallback,
  so the full loop must work without ANTHROPIC_API_KEY
- Category/region taxonomy: `src/lib/taxonomy.ts` – shared source for the seed
  and the AI fallback; new categories must also be seeded (Category table)
- JSON fields (Rfq.spec, Category.clarifyQuestions) are stored as String because of SQLite
- Auth: HMAC-signed cookie (`src/lib/auth.ts`), no middleware – every protected
  page calls `getSessionUser()` itself and redirects
- The supplier reply page (`/r/[token]`) is public and token-based; the only
  mutation during page render is setting the invite to VIEWED
- Status labels are centralized in `src/lib/format.ts`

## Pitfalls

- Prisma is intentionally v6 (held back because of v7's driver-adapter model)
- `prisma/seed.ts` imports `src/lib/taxonomy.ts` – it runs with tsx, not ts-node
- Next 16: `params`/`searchParams` are Promises, `cookies()` is async
