# SOC 2 Compliance Controls, Security Audit Trail & Scaffold Skill

**Date:** 2026-07-08
**Type:** Feature / Infrastructure / Documentation

## Summary

Added SOC 2 (Trust Services Criteria) technical controls and an audit flow to the boilerplate, a concrete security audit trail + request-correlation IDs in both backends, automated security scanning, and a global skill that can scaffold this entire setup.

## Changes

- **SOC 2 control matrix:** `docs/COMPLIANCE.md` maps the AICPA Trust Services Criteria (CC1–CC9, Availability, Processing Integrity, Confidentiality, Privacy) to concrete controls in the repo with status + file references, plus an end-to-end **audit flow** (commands to verify each control) and a P1/P2 gap list.
- **Vulnerability management:** `.github/workflows/security.yml` (pnpm audit, gitleaks secret scan, CodeQL SAST, weekly schedule) and `.github/dependabot.yml` (grouped weekly dependency + action + docker updates).
- **Disclosure policy:** `SECURITY.md` (private reporting, secret-handling rules).
- **Security audit trail (both backends, byte-identical):** `utils/audit.ts` logs structured security events (login success/failure, register, logout, token refresh, authz-denied, user update/delete); `middlewares/requestId.ts` adds `x-request-id` correlation IDs attached to logs; wired at the controller/middleware layer with tests.
- **Skills:** new global `scaffold-takehome-boilerplate` (recreates the whole monorepo, with build sequence + battle-tested gotchas); extended `takehome-assignment-audit` with a SOC 2 / security-compliance sweep.

## Files Created

- `docs/COMPLIANCE.md`, `SECURITY.md`
- `.github/workflows/security.yml`, `.github/dependabot.yml`
- `server-sql/src/utils/audit.ts`, `server-sql/src/middlewares/requestId.ts` (+ mongo copies) and their tests
- `~/.claude/skills/scaffold-takehome-boilerplate/SKILL.md` (global)

## Files Modified

- `server-{sql,mongo}/src/{app.ts,controllers/auth.controller.ts,controllers/user.controller.ts,middlewares/authMiddleware.ts,types/express.d.ts}`
- `~/.claude/skills/takehome-assignment-audit/SKILL.md`
