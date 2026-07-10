# Add ImageKit signed-upload endpoint and client avatar demo

**Date:** 2026-07-08
**Type:** Feature

## Summary

Added optional direct-to-CDN image uploads via ImageKit, adapting the signed-upload pattern from the `imagekit-flutter-couples` skill to this Express + Next.js stack (the skill's Flutter/Supabase/wallpaper specifics don't apply). A new authenticated endpoint mints short-lived ImageKit upload params (HMAC-SHA1 of `token+expire` with the private key) so the browser uploads straight to ImageKit without ever seeing the private key. Shipped in both backends for parity, plus a client helper and an avatar-upload demo on the profile page. ImageKit is optional: with no credentials the endpoint returns 503 and everything else stays green.

## Changes

### Backend (both server-sql and server-mongo)
- `config/env.ts` + `config/app.config.ts`: added optional `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_URL_ENDPOINT`.
- `services/upload.service.ts` (new): `isImageKitConfigured`, `signUploadToken` (HMAC-SHA1), `createImageKitAuthParams`.
- `controllers/upload.controller.ts` (new): `getImageKitAuth` — 503 when unconfigured, else 200 with signed params.
- `routes/upload.routes.ts` (new) + `routes/index.ts`: `GET /api/v1/uploads/imagekit-auth` (auth required).
- `utils/ApiError.ts`: added `serviceUnavailable` (503); `constants/messages.ts`: upload messages.
- Tests: unit (signature determinism, configured check, param signing) + integration (401 unauthenticated, 200 with fields). `.env.test.example` gets fake keys so the configured path is exercised.

### Client
- `lib/imagekit.ts` (new): `uploadImage(file)` — fetches signed params then POSTs the file to ImageKit.
- `app/(protected)/profile/page.tsx`: avatar-upload demo (session-only display; gracefully shows the 503/error when ImageKit isn't configured).

### Config / docs
- `.env.example` (root + both backends): documented the three IMAGEKIT vars (blank = disabled).
- `bruno/.../Uploads/Get ImageKit Auth.bru`: contract test (accepts 200 configured or 503 not configured).
- `docs/manual-todo/imagekit-setup.md`: steps to create a real ImageKit account and set keys.

## Verification

- Backend: unit + integration upload tests pass in both backends; endpoint smoke-tested live (401 → 200 with token/signature/publicKey/urlEndpoint).
- Client: type-check + lint clean, 36/36 tests, `next build` emits `/profile` (3.35 kB).

## Files Created

- `server-{sql,mongo}/src/services/upload.service.ts`, `controllers/upload.controller.ts`, `routes/upload.routes.ts`
- `server-{sql,mongo}/tests/unit/services/upload.service.test.ts`, `tests/integration/uploads.test.ts`
- `client/src/lib/imagekit.ts`
- `bruno/Boilerplate API/Uploads/Get ImageKit Auth.bru`
- `docs/manual-todo/imagekit-setup.md`

## Files Modified

- `server-{sql,mongo}/src/config/{env,app.config}.ts`, `constants/messages.ts`, `utils/ApiError.ts`, `routes/index.ts`
- `server-{sql,mongo}/.env.example`, `.env.test.example`
- `client/src/app/(protected)/profile/page.tsx`
- `.env.example`
