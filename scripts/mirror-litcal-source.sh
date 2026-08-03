#!/usr/bin/env bash
set -euo pipefail

UPSTREAM="https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI.git"
BRANCH="${LITCAL_BRANCH:-}"
TARGET="data/litcal-mirror/upstream-source.json"

if [[ -z "$BRANCH" ]]; then
  BRANCH="$(git ls-remote --symref "$UPSTREAM" HEAD | awk '/^ref:/ { sub("refs/heads/", "", $2); print $2; exit }')"
fi

if [[ -z "$BRANCH" ]]; then
  echo "Unable to determine the LitCal upstream default branch." >&2
  exit 1
fi

UPSTREAM_SHA="$(git ls-remote "$UPSTREAM" "refs/heads/$BRANCH" | awk '{ print $1; exit }')"
if [[ -z "$UPSTREAM_SHA" ]]; then
  echo "Unable to determine the LitCal upstream commit for branch $BRANCH." >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET")"
cat > "$TARGET" <<EOF
{
  "repository": "$UPSTREAM",
  "branch": "$BRANCH",
  "upstreamLabel": "default-branch",
  "commit": "$UPSTREAM_SHA",
  "checkedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "license": "Apache-2.0",
  "retentionPolicy": "manifest-only",
  "note": "The application stores structured, validated responses and this provenance manifest. The upstream source tree is not vendored into the SantosDia repository."
}
EOF

# Remove legacy full-source mirrors from local worktrees. Raw source preservation,
# when needed for diagnostics, belongs in the private Dropbox staging layer.
rm -rf vendor/litcal-api

printf 'Recorded LitCal upstream branch %s at commit %s without vendoring its source tree.\n' "$BRANCH" "$UPSTREAM_SHA"
