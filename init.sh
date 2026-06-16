#!/usr/bin/env bash
# ============================================================================
# init.sh — harness verification gate
# Runs the real "test suite" for this static site, in order:
#   1. astro check   (types / diagnostics on .astro)
#   2. astro build   (compiles; catches broken imports, missing assets, links)
#   3. customization lint (reports scaffold placeholders left unfilled)
#
# Usage:  ./init.sh            # full gate (lint is advisory)
#         ./init.sh --strict   # also fail if customization markers remain
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

STRICT=""
[ "${1:-}" = "--strict" ] && STRICT="--strict"

echo "▶ [1/3] astro check"
pnpm astro check

echo ""
echo "▶ [2/3] astro build"
pnpm build

echo ""
echo "▶ [3/3] customization lint"
bash "$ROOT/harness/lint-customization.sh" $STRICT

echo ""
echo "✅ init.sh passed"
