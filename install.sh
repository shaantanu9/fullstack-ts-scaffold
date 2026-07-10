#!/usr/bin/env bash
# Install this skill into Claude Code's skills directory.
# Usage: ./install.sh        (from a clone of this repo)
set -euo pipefail

SKILL_NAME="fullstack-ts-scaffold"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/$SKILL_NAME"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "▸ Installing '$SKILL_NAME' → $DEST"

if [ -e "$DEST" ]; then
  read -r -p "  $DEST already exists. Overwrite? [y/N] " ans
  case "$ans" in [yY]*) rm -rf "$DEST" ;; *) echo "  aborted."; exit 1 ;; esac
fi

mkdir -p "$(dirname "$DEST")"
mkdir -p "$DEST"
# Copy the skill payload (skip repo/VCS meta and any stray node_modules).
for item in SKILL.md scaffold.mjs ADAPT.md PRACTICE.md template; do
  cp -R "$SRC/$item" "$DEST/"
done
find "$DEST" -name node_modules -type d -prune -exec rm -rf {} + 2>/dev/null || true

echo "✓ Installed. Prerequisites: Node 20+, pnpm (Docker for the full DB gate; Supabase CLI for --only supabase)."
echo "  Try:  node \"$DEST/scaffold.mjs\" ./my-app --only mongo --fast"
