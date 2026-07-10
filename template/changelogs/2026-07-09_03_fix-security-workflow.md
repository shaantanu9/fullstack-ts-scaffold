# Fix the Security (SOC) Workflow

**Date:** 2026-07-09
**Type:** Fix (CI/CD)

## Summary

The `security.yml` workflow (the SOC / security gate) was failing on PR #31. Two root causes, both fixed and validated locally.

## Changes

- **Dependency Audit job** died at `pnpm/action-setup@v4` because it pinned `version: 9`, which conflicts with `packageManager: pnpm@9.5.0` in `package.json` (same issue `ci.yml` already fixed). Removed the pin so action-setup reads the version from `packageManager`.
- **Secret Scan job**: replaced `gitleaks/gitleaks-action@v2` (requires a paid license for GitHub orgs; fails keyless) with the free gitleaks **binary** (`gitleaks detect`). Added `.gitleaks.toml` extending the default rules with an allowlist for intentional non-secrets: `.env.example` / `.env.test.example` templates, placeholder/demo credential shapes, and the fake JWT test fixture (ends in `.invalid-signature`). Verified locally: 75 commits scanned, **no leaks found**.
- Dependency audit already clean (`form-data`/`uuid` overrides), so all three Security jobs (audit, secret scan, CodeQL) now pass.

## Files Created

- `.gitleaks.toml`
- `changelogs/2026-07-09_03_fix-security-workflow.md`

## Files Modified

- `.github/workflows/security.yml`
