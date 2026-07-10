# Fix client audit bugs: double navbar, blank-name register, dead import

**Date:** 2026-07-08
**Type:** Fix

## Summary

Three clear-cut client bugs from the audit. (1) `app/page.tsx` rendered its own `<Navbar>` and `<main>`/`<div>` wrapper on top of the ones already provided by `app/layout.tsx` → a duplicated navbar and invalid nested `<main>` on `/`. (2) The register form always sent `name: ''`, which fails the server's `name: z.string().min(2).optional()` rule, so anyone leaving the optional name blank got a 400. (3) `login/page.tsx` imported `MESSAGES` but never used it.

## Changes

- `client/src/app/page.tsx`: render only page content; the Navbar + `<main>` come from the layout.
- `client/src/app/(auth)/register/page.tsx`: omit `name` from the payload when blank (trim + conditional), so the optional field doesn't trip `.min(2)`.
- `client/src/app/(auth)/login/page.tsx`: remove the unused `MESSAGES` import.

## Verification

- `pnpm --filter client type-check` clean; `next build` compiles; 35/35 client tests pass.
- Live: `POST /auth/register` without `name` → 201 (was 400). Confirmed against the running server.

## Files Modified

- `client/src/app/page.tsx`
- `client/src/app/(auth)/register/page.tsx`
- `client/src/app/(auth)/login/page.tsx`
