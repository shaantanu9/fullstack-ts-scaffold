# Document the ImageKit uploads endpoint in the OpenAPI/Swagger spec

**Date:** 2026-07-08
**Type:** Documentation

## Summary

The ImageKit `GET /uploads/imagekit-auth` endpoint was live but missing from the
OpenAPI spec, so it didn't show in Swagger UI (`/docs`) or `/openapi.json`. Added
an `Uploads` tag and the path entry (200 signed-params / 401 / 503) to both
backends' identical spec.

## Changes

- `server-{sql,mongo}/src/docs/openapi.ts`: added the `Uploads` tag and the
  `/uploads/imagekit-auth` GET path with its 200/401/503 responses.

## Verification

- `/openapi.json` now lists 8 paths including `/uploads/imagekit-auth`; the
  `Uploads` tag is present; `/docs` (Swagger UI) serves 200. Both backends
  typecheck + lint clean; spec byte-identical across variants.

## Files Modified

- `server-sql/src/docs/openapi.ts`, `server-mongo/src/docs/openapi.ts`
