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

## Store build (EAS)

```bash
npm install -g eas-cli
eas login
eas init                 # creates the EAS project + sets expo.extra.eas.projectId
eas build --profile preview --platform android    # internal test build
eas build --profile production --platform all      # store builds
eas submit --profile production --platform ios      # upload to the stores
```

Profiles live in `eas.json`. Push tokens (`getExpoPushTokenAsync`) require the
`projectId` that `eas init` writes, so push only works on a dev/EAS build, not
in plain Expo Go.

## Structure

- `App.tsx` — root: auth-status router + role-aware bottom tabs
- `src/AuthContext.tsx` — session state, biometric gate, token + push lifecycle
- `src/session.ts` — secure token storage + `expo-local-authentication` wrapper
- `src/push.ts` — Expo push token registration + foreground handler
- `src/api.ts` — typed `/api/v1` client
- `src/screens/` — login, biometric lock, notifications, account/profile;
  buyer: RFQ list/detail (shortlist + send, accept offers) / new + credits;
  supplier: invites (offer form), open opportunities

Covers the full RFQ loop for both roles. Push taps route to the relevant
screen (buyer RFQ links open the detail). Configure `eas.json` and run
`eas build` for store distribution.
