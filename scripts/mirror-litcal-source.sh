#!/usr/bin/env bash
set -euo pipefail

UPSTREAM="https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI.git"
BRANCH="development"
TARGET="vendor/litcal-api"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --depth 1 --branch "$BRANCH" "$UPSTREAM" "$TMP/upstream"
UPSTREAM_SHA="$(git -C "$TMP/upstream" rev-parse HEAD)"
rm -rf "$TARGET"
mkdir -p "$TARGET"
rsync -a --delete --exclude='.git' --exclude='cache/' --exclude='vendor/' --exclude='server.pid' "$TMP/upstream/" "$TARGET/"
cat > "$TARGET/UPSTREAM_MIRROR.json" <<EOF
{
  "repository": "$UPSTREAM",
  "branch": "$BRANCH",
  "commit": "$UPSTREAM_SHA",
  "mirroredAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "license": "Apache-2.0"
}
EOF
printf 'Mirrored LitCal upstream commit %s\n' "$UPSTREAM_SHA"
