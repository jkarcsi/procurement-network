# Procura mobile app (Expo / React Native)

Native companion app for [Procura](../README.md), built on the public API
(`/api/v1`). Biometric sign-in (Face ID / Touch ID / fingerprint) lives here —
the desktop web uses email + password.

## How it works

1. **Sign in** with email + password → the server returns an HMAC session
   token (`POST /api/v1/auth/login`).
2. The token is stored in the device keychain (`expo-secure-store`).
3. On every launch, the app requires a **biometric check**
   (`expo-local-authentication`) before using the stored token — so the token
   never unlocks without the device owner present.
4. Authenticated requests send `Authorization: Bearer <token>`; the same
   endpoints back the integration API keys (see `/api/v1/openapi.json`).
5. Once signed in, the device registers an **Expo push token**
   (`expo-notifications`) with `POST /api/v1/push`; the server then mirrors
   every in-app notification (offer received/accepted, new invite) to push.
   Push tokens need a real dev/EAS build — Expo Go has limited support.

## Run

```bash
cd mobile
npm install          # or: npx expo install  (reconciles native versions)
npm start            # then open in Expo Go or a dev build
```

Set the API base URL in `app.json` → `expo.extra.apiBaseUrl`
(default `http://localhost:3000`). On a physical device use your machine's LAN
IP or a deployed URL, not `localhost`.

## Structure

- `App.tsx` — root: auth-status router + role-aware bottom tabs
- `src/AuthContext.tsx` — session state, biometric gate, token + push lifecycle
- `src/session.ts` — secure token storage + `expo-local-authentication` wrapper
- `src/push.ts` — Expo push token registration + foreground handler
- `src/api.ts` — typed `/api/v1` client
- `src/screens/` — login, biometric lock, notifications; buyer: RFQ
  list/detail/new + credits; supplier: invites list/detail (offer form)

Covers the full loop. Remaining: tap-to-navigate from a push, and an
EAS/store build.
