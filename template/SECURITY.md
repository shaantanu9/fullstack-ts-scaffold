# Security Policy

## Supported versions

This is a boilerplate/template repository. Security fixes are applied to the `main` branch. When you fork it for a project, keep dependencies current (Dependabot is preconfigured) and re-run the security workflow.

## Reporting a vulnerability

**Do not open a public issue for security vulnerabilities.**

Instead, report privately via GitHub's [Security Advisories](https://github.com/shaantanu9/boilerplate_nexjs_express/security/advisories/new), or email the maintainer at `shantanubombatkar2@gmail.com`.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (proof-of-concept if possible)
- Affected component (`server-sql`, `server-mongo`, `client`) and version/commit

We aim to acknowledge reports within **3 business days** and to provide a remediation timeline after triage.

## Handling secrets

- Never commit real secrets. `.env` files are gitignored; only `.env.example` (keys, no values) is tracked.
- The `security.yml` workflow runs **gitleaks** secret scanning on every push/PR.
- Rotate any credential that is ever committed, even if the commit is later removed — git history preserves it.

## Security controls in this repo

See [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md) for the full SOC 2 Trust Services Criteria control matrix mapped to the codebase.
