#!/usr/bin/env bash
set -euo pipefail

# Sync Anthropic's public Agent Skills repository into this repo.
# Default destination keeps upstream files isolated from the GitHub Pages app.
# Usage:
#   bash scripts/sync-anthropic-skills.sh
# Optional:
#   UPSTREAM_REF=<branch-or-commit-sha> DEST=vendor/anthropic-skills bash scripts/sync-anthropic-skills.sh

UPSTREAM_REPO="${UPSTREAM_REPO:-https://github.com/anthropics/skills.git}"
UPSTREAM_REF="${UPSTREAM_REF:-main}"
DEST="${DEST:-vendor/anthropic-skills}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "Syncing Anthropic Agent Skills from ${UPSTREAM_REPO} (${UPSTREAM_REF})..."

git clone \
  --depth 1 \
  --filter=blob:none \
  --sparse \
  --branch "$UPSTREAM_REF" \
  "$UPSTREAM_REPO" \
  "$TMP_DIR/anthropic-skills"

cd "$TMP_DIR/anthropic-skills"
git sparse-checkout set --no-cone skills spec template .claude-plugin README.md THIRD_PARTY_NOTICES.md
UPSTREAM_COMMIT="$(git rev-parse HEAD)"
cd - >/dev/null

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$TMP_DIR/anthropic-skills/skills" "$DEST/skills"
cp -R "$TMP_DIR/anthropic-skills/spec" "$DEST/spec"
cp -R "$TMP_DIR/anthropic-skills/template" "$DEST/template"
cp -R "$TMP_DIR/anthropic-skills/.claude-plugin" "$DEST/.claude-plugin"
cp "$TMP_DIR/anthropic-skills/README.md" "$DEST/README.md"
cp "$TMP_DIR/anthropic-skills/THIRD_PARTY_NOTICES.md" "$DEST/THIRD_PARTY_NOTICES.md"

cat > "$DEST/UPSTREAM.md" <<EOF
# Upstream Anthropic Agent Skills

Source: https://github.com/anthropics/skills
Synced ref: ${UPSTREAM_REF}
Synced commit: ${UPSTREAM_COMMIT}

This folder is a vendored copy of Anthropic's public Agent Skills repository content needed for Claude/agent workflows. Keep it isolated from the main app code and preserve upstream notices.

Important upstream note: many skills are open source, but the document skills under docx/pdf/pptx/xlsx are source-available, not open source. Review upstream terms before redistributing or selling a package containing those folders.
EOF

echo "Done. Synced to ${DEST} at upstream commit ${UPSTREAM_COMMIT}."
