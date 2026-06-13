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

- `App.tsx` — root, auth-status router (loading / signed-out / locked / signed-in)
- `src/AuthContext.tsx` — session state, biometric gate, token lifecycle
- `src/session.ts` — secure token storage + `expo-local-authentication` wrapper
- `src/api.ts` — typed `/api/v1` client
- `src/screens/` — login, biometric lock, RFQ list, RFQ detail

This is the foundation; offer submission, notifications, and credit purchase
screens build on the same API client.
