#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SNAPSHOT_PATH="${SCRIPT_DIR}/canonical_home.html.snapshot"
HOMEPAGE_PATH="${SCRIPT_DIR}/../app/_home-client.tsx"

if [[ ! -f "${SNAPSHOT_PATH}" ]]; then
  echo "ERROR: Missing canonical snapshot at ${SNAPSHOT_PATH}" >&2
  echo "Run: curl -fsSL jpbva1rdc > ${SNAPSHOT_PATH}" >&2
  exit 1
fi

if [[ ! -f "${HOMEPAGE_PATH}" ]]; then
  echo "ERROR: Homepage source not found at ${HOMEPAGE_PATH}" >&2
  exit 1
fi

required_markers=(
  "N° 01"
  "N° 02"
  "N° 03"
  "N° 04"
  "N° 05"
  "N° 06"
  "N° 07"
  "FLAGSHIP"
  "Beverly Hills · Women"
  "est. 2001 · 1M+"
  "25 yrs · two NYT"
  "Hormone Panel Decoder"
  "22,000+ readers"
  "Ready to be heard"
)

snapshot_missing=()
markers=()

for marker in "${required_markers[@]}"; do
  if LC_ALL=C grep -Fq "${marker}" "${SNAPSHOT_PATH}"; then
    markers+=("${marker}")
  else
    snapshot_missing+=("${marker}")
  fi
done

if ((${#snapshot_missing[@]} > 0)); then
  echo "ERROR: Canonical snapshot is missing expected markers:" >&2
  for marker in "${snapshot_missing[@]}"; do
    echo "  - ${marker}" >&2
  done
  echo "Refresh the snapshot via: curl -fsSL jpbva1rdc > ${SNAPSHOT_PATH}" >&2
  exit 1
fi

missing_home=()
for marker in "${markers[@]}"; do
  if ! LC_ALL=C grep -Fq "${marker}" "${HOMEPAGE_PATH}"; then
    missing_home+=("${marker}")
  fi
done

if ((${#missing_home[@]} > 0)); then
  for marker in "${missing_home[@]}"; do
    echo "REGRESSION DETECTED: missing '${marker}' in _home-client.tsx — restore from canonical or revert offending commit" >&2
  done
  exit 1
fi

exit 0
