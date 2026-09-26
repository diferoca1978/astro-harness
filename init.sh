#!/usr/bin/env bash
# ============================================================================
# init.sh — harness verification gate
# Runs the real "test suite" for this static site, in order:
#   1. astro check   (types / diagnostics on .astro)
#   2. astro build   (compiles; catches broken imports, missing assets, links)
#   3. SEO check (harness/check-seo.mjs on dist/)
#   4. customization lint (reports scaffold placeholders left unfilled)
#
# Usage:  ./init.sh            # full gate (lint is advisory)
#         ./init.sh --strict   # also fail on SEO warnings and if customization markers remain
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

STRICT=""
[ "${1:-}" = "--strict" ] && STRICT="--strict"

echo "▶ [1/4] astro check"
pnpm astro check

echo ""
echo "▶ [2/4] astro build"
pnpm build

echo ""
echo "▶ [3/4] SEO check"
node "$ROOT/harness/check-seo.mjs" --dist "$ROOT/dist" $STRICT

echo ""
echo "▶ [4/4] customization lint"
bash "$ROOT/harness/lint-customization.sh" $STRICT

echo ""
echo "✅ init.sh passed"
