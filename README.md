# Procura – AI-támogatott B2B beszerzési hálózat (MVP)

Magyar KKV-kra szabott, buyer-led procurement network MVP a deep research riport alapján.
A teljes „repeatable procurement loop”-ot lefedi:

**egymondatos intake → AI pontosító kérdések → strukturált RFQ → AI beszállítói shortlist
(kategória + régió + reakcióstatisztika) → kiküldés one-click válaszlinkkel → strukturált
ajánlatok → AI összehasonlítás → vevői döntés → audit trail**

A loop kétoldalú: a regisztrált beszállítók a **Nyílt lehetőségek** oldalon meghívás nélkül
is megtalálják és megpályázhatják a profiljukhoz (kategória + régió) illő élő ajánlatkéréseket.

## Indítás

```bash
npm install
cp .env.example .env    # DATABASE_URL nélkül a prisma parancsok hibára futnak
npx prisma db push      # SQLite adatbázis létrehozása
npm run db:seed         # kategóriák, régiók, 24 demo beszállító, demo fiókok
npm run dev             # http://localhost:3000
```

### Füstteszt

```bash
npm run smoke           # seedelt DB kell; futó `npm run dev` mellett HTTP-ellenőrzéseket is végez
```

### Demo fiókok

| Szerep | E-mail | Jelszó |
|---|---|---|
| Vevő | `demo@vevo.hu` | `demo1234` |
| Beszállító (CleanPro Facility Kft.) | `demo@beszallito.hu` | `demo1234` |

## AI-mód vs. fallback-mód

A `.env`-ben add meg az `ANTHROPIC_API_KEY`-t a valódi AI-funkciókhoz
(intake-elemzés, kérdésgenerálás, spec-összeállítás, ajánlat-összehasonlítás – Claude,
strukturált JSON-kimenettel). **Kulcs nélkül is működik a teljes loop**: kulcsszó-alapú
kategória/régió-felismerés és kategóriánkénti sablonkérdések veszik át az AI szerepét.

## Demo e-mailek

Éles e-mail-küldés helyett a kiküldött RFQ-meghívók az **Outbox** oldalra
(`/outbox`) kerülnek – innen nyithatók meg a beszállítói válaszlinkek (`/r/<token>`),
amelyek **regisztráció nélkül** használhatók (a riport „one-click reply, optional
registration” elve szerint).

## Fő útvonalak

| Útvonal | Mi van ott |
|---|---|
| `/` | Landing + egymondatos intake |
| `/rfq/new` | Kétlépéses RFQ-varázsló (intake → AI kérdések → spec) |
| `/dashboard` | Vevői RFQ-lista |
| `/rfq/[id]` | RFQ-részletek: spec, shortlist, kiküldés, ajánlat-összehasonlítás, audit trail |
| `/r/[token]` | Publikus beszállítói válaszoldal (token-alapú, regisztráció nélkül) |
| `/supplier` | Beszállítói portál: meghívók, válaszstatisztikák |
| `/supplier/opportunities` | Nyílt lehetőségek: a profilhoz illő élő RFQ-k, meghívás nélküli jelentkezéssel |
| `/supplier/profile` | Beszállítói profil: kategóriák, régiók, tanúsítványok |
| `/outbox` | Demo kimenő e-mailek |

## Architektúra

- **Next.js 16** (App Router, server actions, Turbopack) + **React 19** + **Tailwind 4**
- **Prisma 6 + SQLite** – éles környezetben Postgres-re váltható a schema módosítása nélkül
- **@anthropic-ai/sdk** – `claude-opus-4-8` (felülírható: `ANTHROPIC_MODEL`),
  strukturált kimenet `output_config.format` JSON-sémával
- Egyszerű HMAC-aláírt cookie session (`src/lib/auth.ts`)
- Beszállítói matching determinisztikus pontozással (`src/lib/matching.ts`):
  kategória 50p + régió 30p (országos 20p) + válaszarány max 15p + tanúsítvány 5p

## A riport beachhead kategóriái (seedelve)

Takarítás · HVAC/klíma · Őrzés-védelem · Munkavédelem · Tűzvédelem · IT support
(második hullám), Budapest + 19 vármegye régiótaxonómiával.
