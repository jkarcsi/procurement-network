# Procura – Automatikus fejlesztési rutin (Fable, 5 óránként)

## A projekt

**Procura** – AI-támogatott B2B procurement SaaS magyar KKV-knak.
Repo: `jkarcsi/procurement-network` (GitHub)
Branch stratégia: fejleszts a `claude/youthful-babbage-1010ip` branchre, pushölj közvetlenül mainre is.
Push: a git remote URL tartalmazza a PAT-ot (`git push origin HEAD:main`).

---

## Amit tudnod kell a jelenlegi állapotról

### Stack
- **Next.js 16** (App Router, server actions, Turbopack) + **React 19** + **Tailwind 4**
- **Prisma 6 + SQLite** (éles környezetben Postgres-re cserélhető schema-módosítás nélkül)
- **@anthropic-ai/sdk** – claude-opus-4-8 (felülírható ANTHROPIC_MODEL env varral)
- **bcryptjs** – jelszóhash
- **zod** – importálva, de egyelőre alig használt
- **tsx** – seed.ts + smoke.ts futtatásához

### Kész funkciók (ne írd újra)
- Vevői auth: regisztráció, login, logout (HMAC-aláírt cookie)
- RFQ-varázsló: egymondatos intake → AI pontosítókérdések → strukturált spec
- AI shortlist: kategória + régió + válaszarány + tanúsítvány scoring (50+30+15+5p)
- RFQ kiküldés: checkbox shortlist + extra e-mail mező, invite tokenek
- Token-alapú publikus beszállítói válaszoldal (`/r/[token]`) – regisztráció nélküli ajánlatadás
- Ajánlat elfogadás / AI összehasonlítás / audit trail
- Beszállítói profil (kategória, régió, leírás, tanúsítványok)
- Nyílt lehetőségek (`/supplier/opportunities`) – profilhoz illő élő RFQ-k meghívás nélküli pályázattal
- Demo e-mail outbox (`/outbox`)
- `npm run smoke` füstteszt

### Konvenciók – KÖTELEZŐ betartani
- Minden üzleti logika `src/lib/actions.ts`-ben (`"use server"`)
- AI-hívások kizárólag `src/lib/ai.ts`-ben; minden AI-funkciónak van szabály-alapú fallbackja
- Kategória/régió taxonómia: `src/lib/taxonomy.ts` – a seed és az AI-fallback közös forrása
- JSON mezők SQLite miatt `String`-ként tárolódnak
- Auth: HMAC-aláírt cookie, nincs middleware – minden védett oldal maga hívja `getSessionUser()`-t
- UI nyelve: **magyar**
- Státuszcímkék: `src/lib/format.ts`-ben centrálisan
- Next 16: `params`/`searchParams` Promise-ok, `cookies()` async
- Prisma szándékosan v6
- A `prisma/seed.ts` tsx-szel fut, nem ts-node-dal

### Hiányzó / hiányos dolgok (prioritás sorrendben)

```
P1 – Fizetés/előfizetés (Stripe test mode)
P2 – Valódi e-mail küldés (Resend)
P3 – Landing/marketing oldal (árazás, FAQ, social proof)
P4 – Admin panel (/admin/*)
P5 – Keresés és szűrés (dashboard, supplier portal)
P6 – Értesítési rendszer (in-app + e-mail)
P7 – Fájl feltöltés (spec dokumnetumok, tanúsítványok)
P8 – Rate limiting / visszaélés-védelem
P9 – Tesztek (unit, smoke bővítése)
P10 – Deployment (Docker, CI/CD, Vercel konfig)
P11 – Monitoring (Sentry, Posthog)
P12 – Supplier discovery UI (vevő keres beszállítókat az RFQ előtt)
P13 – Értékelés/review rendszer
P14 – API / webhook réteg (ERP integráció)
```

---

## Hogyan működj minden futásban

### 1. Előkészítés (mindig)
```bash
# 1. Olvasd el: README.md, AGENTS.md, CLAUDE.md, package.json, prisma/schema.prisma
# 2. Futtasd: npm install (ha kell)
# 3. Futtasd: cp .env.example .env (ha nincs .env)
# 4. Futtasd: npx prisma db push
# 5. Futtasd: npm run db:seed
# 6. Ellenőrzd: npm run build (mielőtt bármit csinálsz)
# 7. Nézd meg a legfrissebb commitokat: git log --oneline -10
```

### 2. Feladat kiválasztása
Mindig **egyet** válassz a prioritáslistáról, amelyik a leghasznosabb és megvalósítható egy futásban.
Részleges megvalósítás helyett inkább egy kisebb, de **teljes** vertikális slice-t szállíts.

### 3. Implementáció
- Ne írj over-engineered kódot; boring, maintainable, direct
- Kommenteket csak akkor írj, ha a WHY nem nyilvánvaló
- Új adatbázis-mezőknél: `npx prisma db push` után `npm run db:seed` (seed idempotens)
- Ha a feature UI-t érint: teszteld a teljes flow-t (login → feature → result)

### 4. Tesztelés
```bash
npm run build      # TypeScript ellenőrzés
npm run lint       # ESLint
npm run smoke      # Füstteszt (ha dev szerver fut: HTTP-ellenőrzések is)
```

### 5. Commit és push
```bash
git config user.email noreply@anthropic.com
git config user.name Claude
git add <changed files>
git commit -m "feat: <magyar leírás>"
git push origin HEAD:claude/youthful-babbage-1010ip
git push origin HEAD:main
```

### 6. Futás-összefoglaló (mindig a végén)
Írd le:
1. Választott cél
2. Mi változott (funkcionálisan)
3. Érintett fájlok
4. Futtatott parancsok
5. Build/test/lint eredmény
6. Termék-hatás
7. Fennmaradó problémák
8. Következő futás javaslata

---

## Részletes megvalósítási útmutató a kritikus feature-ökhöz

### P1: Stripe előfizetés (TEST MODE CSAK!)

**Amit kell csinálni:**
- `npm install stripe` és `@stripe/stripe-js`
- `.env.example`-be: `STRIPE_SECRET_KEY=""`, `STRIPE_PUBLISHABLE_KEY=""`, `STRIPE_WEBHOOK_SECRET=""`, `STRIPE_PRICE_ID_PRO=""`
- Két tier: **Alap** (ingyenes, max 3 aktív RFQ, max 5 invite/RFQ) és **Pro** (korlátlan, 4990 Ft/hó)
- `src/lib/stripe.ts` – Stripe singleton + helper funkciók
- Új Prisma mezők: `Company.plan` ("FREE"|"PRO"), `Company.stripeCustomerId`, `Company.stripeSubscriptionId`, `Company.planExpiresAt`
- `/pricing` oldal – két kártyás ár-összehasonlító, "Próbáld ki ingyen" CTA
- `/api/checkout` route handler – Stripe Checkout session létrehozás
- `/api/webhooks/stripe` route handler – `checkout.session.completed`, `customer.subscription.deleted` event kezelés
- `/account` oldal – jelenlegi csomag, számla link, upgrade/downgrade gomb
- `src/lib/limits.ts` – `checkPlanLimit(companyId, action)` helper; buyereknek limitálja az RFQ/invite létrehozást FREE tier-en
- Feature flag check `createRfqAction`-ban és `sendRfqAction`-ban
- Navba: "Fiók" link
- **SOHA ne tárolj valódi kártyaadatot**
- **SOHA ne engedélyezz éles Stripe live mode-ot**

**Tesztelés:** Stripe teszt kártyák (4242 4242 4242 4242), webhook forwarding (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)

---

### P2: Valódi e-mail küldés (Resend)

**Amit kell csinálni:**
- `npm install resend`
- `.env.example`-be: `RESEND_API_KEY=""`, `EMAIL_FROM="Procura <no-reply@procura.hu>"`
- `src/lib/email.ts` cseréje: ha `RESEND_API_KEY` van, Resend-del küld; ha nincs, outbox-ba ment (marad demo-ként)
- E-mail sablonok React Email-lel VAGY egyszerű HTML stringgel:
  - `rfqInvite` – ajánlatkérési meghívó (token link, RFQ részletek, határidő)
  - `offerReceived` – vevőnek: új ajánlat érkezett
  - `offerAccepted` – beszállítónak: ajánlatát elfogadták
  - `welcomeBuyer` / `welcomeSupplier` – regisztráció utáni üdvözlő
- Minden küldés dobjon hibát, ha RESEND_API_KEY nincs + outbox-ba ment fallbackként

---

### P3: Landing / marketing oldal

**Az `/` jelenlegi intake-form megtartása, DE:**
- Felülre kerüljön egy teljes marketing hero section: headline, subheadline, primary CTA gomb
- Value proposition blokk: 3-4 konkrét állítás (pl. "Átlagosan 23%-kal olcsóbb ajánlatok", "48 órán belül 5+ ajánlat", "Nulla adminiszráció")
- Hogyan működik: 4 lépéses vizuális flow (buyer szemszögből)
- Kategóriák: kártyák a 6 beachhead kategóriával, kattinthatóak (intake-re prefilláló linkkel)
- Social proof placeholder: "Már X vállalkozás használja" (0 is oké, de legyen a hely)
- `/pricing` oldal: Alap vs Pro összehasonlítás, FAQ (3-5 kérdés)
- Footer: © Procura, ÁSZF placeholder link, Adatvédelmi tájékoztató placeholder, kapcsolat
- `/terms` és `/privacy` – egyoldalas placeholder szövegek
- A landing page konvertáljon: minden szekció végén legyen CTA

---

### P4: Admin panel

**Védett route: csak `role === "ADMIN"` felhasználók (új role)**
- Prisma: `User.role` bővítése "ADMIN"-nal (a seed-ben hozz létre admin usert: `admin@procura.hu / admin1234`)
- `/admin` – dashboard: összefoglaló statisztikák (összes user, vevő, beszállító, aktív RFQ, beérkezett ajánlat, elfogadott ajánlat)
- `/admin/users` – user lista (email, role, company, created, plan)
- `/admin/rfqs` – összes RFQ, státuszok szerint szűrve
- `/admin/suppliers` – összes spoke supplier profil, kategória, régiók, válaszarány
- `/admin/emails` – EmailOutbox nézet (már van `/outbox`, de ez gazdagabb)
- Alapvető moderáció: user deaktiválása (soft delete: `User.active = false` mező)

---

### P5: Keresés és szűrés

**Buyer dashboard (`/dashboard`):**
- Keresős input (RFQ title fulltext)
- Státusz filter (READY / SENT / DECIDED / CLOSED)
- Kategória filter
- Dátum range filter (createdAt)
- Paginálás (10/oldal)

**Supplier portal (`/supplier`):**
- Keresős input (RFQ title)
- Státusz filter (invite status)
- Dátum filter

**Implementáció:** server-side searchParams alapú szűrés (nincs client-side JS szükséges)

---

### P6: Értesítési rendszer

**In-app notification center:**
- Új modell: `Notification { id, userId, type, message, linkUrl, read, createdAt }`
- Nav ikonban badge (olvasatlan darabszám)
- `/notifications` oldal – lista, "mind olvasottnak jelöl" gomb
- Notify vevőt: amikor ajánlat érkezik, amikor accepted ajánlat van
- Notify beszállítót: amikor profilja illő új RFQ-t küldtek ki

---

### P7: Fájl feltöltés

- `npm install @uploadthing/react uploadthing` VAGY egyszerűbb: Next.js route handler + Vercel Blob / local `/uploads` mappa
- Lehetőleg ne adj hozzá paid cloud storage dependency-t (local filesystem dev-ben elég)
- `Attachment { id, rfqId, uploadedBy, filename, url, createdAt }` Prisma modell
- RFQ részletek oldalon: "Csatolmány hozzáadása" gomb
- `/r/[token]` oldal: csatolmányok megtekintése (csak letöltés, nem feltöltés a válaszoldalon)
- Fájlméret limit: 10MB; elfogadott típusok: PDF, DOCX, XLSX, PNG, JPG

---

### P8: Rate limiting

- Middleware-t ne adj, Next.js server action-szintű védelmet adj
- `src/lib/rateLimit.ts` – egyszerű in-memory (Map + timestamp) limiter, vagy KV-alapú ha van
- Login action: max 5 próba / IP / 5 perc
- RFQ létrehozás: max 10/nap/user FREE tier-en
- Submit offer: max 3 retry token / 1 óra

---

### P9: Tesztek bővítése

- A meglévő `scripts/smoke.ts` már teszteli az open RFQ discovery flow-t
- Bővítsd: `scripts/smoke.ts` tesztelje az offer submission flow-t, az accept flow-t, és a decline flow-t
- Írj legalább 2 unit tesztet `src/lib/matching.ts`-hez (vitest vagy jest) – a scoring logika kritikus
- README-be: `npm run test` script és leírás

---

### P10: Deployment

- `Dockerfile` – multi-stage (builder + runner), non-root user, PORT env var
- `.github/workflows/ci.yml` – lint + build + smoke on PR
- `vercel.json` – minimális konfig (ha Vercel a deploy target)
- `railway.toml` VAGY `render.yaml` – alternatív deploy platform
- README bővítése: "Deployment" szekció (Vercel, Railway, Docker)
- `.env.example` bővítése: ÖSSZES production env var dokumentálva

---

### P11: Monitoring

- `npm install @sentry/nextjs` – error tracking
- `.env.example`-be: `SENTRY_DSN=""`
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Csak ha `SENTRY_DSN` van beállítva aktiválódik
- `npm install posthog-js` – analytics
- `.env.example`-be: `NEXT_PUBLIC_POSTHOG_KEY=""`, `NEXT_PUBLIC_POSTHOG_HOST="https://eu.posthog.com"`
- Alapvető events: `rfq_created`, `offer_submitted`, `offer_accepted`, `supplier_joined`
- Feature flag: analytics csak ha a key be van állítva

---

### P12: Supplier discovery

**Új oldal: `/suppliers`** – nyilvános VAGY bejelentkezéshez kötött
- Lista: profillappal rendelkező beszállítók
- Szűrők: kategória, régió, tanúsítvány
- Kártya nézet: cég neve, kategóriák, régiók, válaszarány, tanúsítványok
- "Meghívás közvetlen RFQ-hoz" gomb (buyer bejelentkezéssel, létező READY RFQ-hoz adja hozzá)

---

### P13: Értékelés / review

**Buyer értékelheti az elfogadott ajánlat teljesítőjét:**
- `Review { id, rfqId, offerId, reviewerId, rating (1-5), comment, createdAt }`
- RFQ DECIDED állapot után megjelenik a vevőnek: "Értékeld a teljesítést" gomb
- Supplier portálon megjelenik az átlagos értékelés
- Matching: review score bele a scoring logikába (+max 5p)

---

### P14: API réteg

- `/api/v1/rfqs` – GET (lista), POST (létrehozás) – API key auth
- `/api/v1/rfqs/[id]` – GET, PATCH (status)
- `/api/v1/offers` – GET per RFQ
- API key: `ApiKey { id, userId, key (hashed), name, createdAt, lastUsedAt }`
- `/account/api-keys` – API key management UI
- Swagger/OpenAPI JSON endpoint: `/api/v1/openapi.json`

---

## Fizetési szabályok (KRITIKUS)

- **KIZÁRÓLAG Stripe test mode** (`sk_test_...` kulcsok)
- Soha ne adj hozzá live Stripe kulcsot
- Soha ne tárolj nyers kártyaadatot
- Checkout flow: Stripe Checkout hosted page-re irányítás (nem custom form)
- Webhook: signature verifikáció (`stripe.webhooks.constructEvent`)
- A `.env.example`-ban ÜRES stringek legyenek a Stripe kulcsoknak
- Minden payment-related kódban megjegyzés: "// STRIPE TEST MODE ONLY"

---

## Határidő

**2026-06-13 16:00 Budapest (Europe/Budapest)**

Ha az aktuális idő ez után van: ne csinálj kódváltoztatást. Helyette írj egy záró összefoglalót:
- Jelenlegi termék állapota
- Megvalósított feature-ök listája
- Fennmaradó legfontosabb hiányosságok
- Ajánlott következő lépések (prioritás sorrendben)

---

## Git konfiguráció (minden futás elején ellenőrizd)

```bash
git config user.email noreply@anthropic.com
git config user.name Claude
git config gpg.format ssh
git config commit.gpgsign true
# Ha szükséges:
git config gpg.ssh.program /usr/local/bin/git-ssh-sign
git config gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

A push URL a remote-ban már tartalmazza a PAT-ot. Ha valami miatt nem megy:
```bash
git push https://x-access-token:GITHUB_PAT@github.com/jkarcsi/procurement-network.git HEAD:main
```

---

## Minőségi elvárások

- **Nem törsz meglévő funkciót** – minden futás előtt és után `npm run build` zöld
- **Minden feature UI-val együtt szállítod** – nincs "backend kész, frontend majd később"
- **Minden feature demo-zható** a seed adatokkal és a demo fiókokkal
- **Magyar UI szöveg** mindenhol
- **Üres állapotok** kezelve (empty state UI minden listánál)
- **Loading állapot** – ha server action lassú (pl. AI hívás), mutass loading indikátort
- **Error handling** – felhasználóbarát hibaüzenetek, ne dobjon uncaught exception-t
- **Mobile-first** – minden új UI responsive, sm:/md: breakpoint-okkal
- **Nincs code comment**, ami csak azt mondja el, amit a kód már mond – csak a WHY dokumentálható
- **Nincs TODO comment** – amit nem tudsz befejezni, ne kezdd el

---

## Demo fiókok (a seed létrehozza)

| Szerep | E-mail | Jelszó |
|---|---|---|
| Vevő | `demo@vevo.hu` | `demo1234` |
| Beszállító | `demo@beszallito.hu` | `demo1234` |
| Admin (P4 után) | `admin@procura.hu` | `admin1234` |

---

## Példa futás-összefoglaló formátum

```
## Futás összefoglaló – [dátum]

### 1. Választott cél
P1: Stripe test-mode előfizetés skeleton

### 2. Mi változott
- /pricing oldal: Alap vs Pro összehasonlítás...
- Stripe Checkout session létrehozás...

### 3. Érintett fájlok
- src/app/pricing/page.tsx (új)
- src/lib/stripe.ts (új)
- prisma/schema.prisma (Company.plan mező)
- .env.example

### 4. Futtatott parancsok
npm install stripe, npx prisma db push, npm run build, npm run smoke

### 5. Build/test eredmény
Build ✅, Lint ✅, Smoke ✅

### 6. Termék-hatás
A vevők látják az árakat és ki tudják próbálni a Stripe test checkoutot...

### 7. Fennmaradó problémák
Webhook kezelés még hiányzik...

### 8. Következő futás javaslata
P1 folytatás: webhook handler + plan limit enforcement
```
