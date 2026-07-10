# CI: run Bruno API contract + Puppeteer E2E against the MongoDB backend

**Date:** 2026-07-08
**Type:** Infrastructure

## Summary

CI previously exercised the Bruno API-contract and Puppeteer e2e suites only against the SQL backend, so a regression that broke the MongoDB variant's runtime behavior (as opposed to its unit tests) could slip through. Added an `integration-e2e-mongo` job that mirrors the Postgres one: spins MongoDB (27018) + Redis (6382), seeds the admin, runs `test:api:ci:mongo`, builds the client against `http://localhost:5003/api/v1`, installs Chromium, and runs `test:e2e:mongo` (server-mongo on 5003).

## Changes

- `.github/workflows/ci.yml`: new `integration-e2e-mongo` job.

## Verification

- Ran the equivalent locally: `test:api:ci:mongo` → 22/22, and `E2E_CLIENT_START=1 test:e2e:mongo` → 8/8 against a client built with the 5003 base URL.

## Files Modified

- `.github/workflows/ci.yml`
