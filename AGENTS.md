<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Procura – projekt-specifikus tudnivalók

AI-támogatott B2B procurement network MVP magyar KKV-knak. Részletek: README.md.

## Parancsok

- `npm run dev` – fejlesztői szerver (http://localhost:3000)
- `npm run build` – production build (TypeScript-ellenőrzéssel)
- `npx prisma db push` – séma szinkronizálása az SQLite DB-be (prisma/dev.db)
- `npm run db:seed` – demo adatok (idempotens, upsert-alapú)

## Konvenciók és architektúra

- Minden üzleti logika server actionben: `src/lib/actions.ts` ("use server")
- AI-hívások kizárólag `src/lib/ai.ts`-ben; minden AI-funkciónak van szabály-alapú
  fallbackja, így ANTHROPIC_API_KEY nélkül is működnie kell a teljes loopnak
- Kategória/régió taxonómia: `src/lib/taxonomy.ts` – a seed és az AI-fallback közös forrása;
  új kategóriánál seedelni is kell (Category tábla)
- JSON mezők (Rfq.spec, Category.clarifyQuestions) SQLite miatt String-ként tárolódnak
- Auth: HMAC-aláírt cookie (`src/lib/auth.ts`), nincs middleware – minden védett oldal
  maga hív `getSessionUser()`-t és redirectel
- A beszállítói válaszoldal (`/r/[token]`) publikus, token-alapú; mutáció page renderben
  csak az invite VIEWED-re állítása
- UI nyelve magyar; státusz-címkék központilag: `src/lib/format.ts`

## Buktatók

- Prisma szándékosan v6 (a v7 driver-adapter modellje miatt lett visszafogva)
- A `prisma/seed.ts` a `src/lib/taxonomy.ts`-t importálja – tsx-szel fut, nem ts-node-dal
- Next 16: `params`/`searchParams` Promise-ok, `cookies()` async
