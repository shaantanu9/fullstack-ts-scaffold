# Take-Home Skills & Best-Practices Guide

**Date:** 2026-07-08
**Type:** Documentation

## Summary

Added a researched best-practices guide for full-stack TypeScript take-home assignments and two global Claude skills (a boilerplate/flow analyzer and an auditor) so this repo can be used as a take-home starter and scored against a reviewer rubric.

## Changes

- Researched what reviewers score on (10-dimension rubric), README essentials, red-flag/rejection list, and professional-polish checklist from ~14 authoritative sources.
- Created two global skills under `~/.claude/skills/`: `takehome-fullstack-boilerplate` (target architecture + proper flow) and `takehome-assignment-audit` (GATE checks + rubric scoring + P0/P1/P2 report).

## Files Created

- `TAKEHOME_BEST_PRACTICES.md` — rubric, README template, red flags, polish checklist, repo-to-rubric mapping.
- `docs/SUBMISSION_TEMPLATE.md` — fill-in write-up (decisions, trade-offs, assumptions, "with more time").
- `~/.claude/skills/takehome-fullstack-boilerplate/SKILL.md` (global).
- `~/.claude/skills/takehome-assignment-audit/SKILL.md` (global).
