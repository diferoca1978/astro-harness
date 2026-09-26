#!/usr/bin/env bash
# ============================================================================
# lint-customization.sh
# Detects scaffold placeholders that mean "not yet customized for this client".
# These are NOT bugs — they are knobs the brief/brand input has not filled yet.
# It also flags scaffold contamination (old Shine data) and email addresses
# written by hand outside COMPANY_INFO.email.
#
# Advisory by default (exit 0). With --strict, exits 1 if any marker remains,
# so it can gate a production deploy.
# ============================================================================
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/src"
STRICT=""
[ "${1:-}" = "--strict" ] && STRICT="1"

found=0

# marker <regex> <human-readable description>
marker() {
  local pattern="$1" desc="$2"
  local hits
  hits="$(grep -rIn --include='*.astro' --include='*.ts' --include='*.css' --include='*.mjs' -E "$pattern" "$ROOT/src" "$ROOT/astro.config.mjs" 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    found=$((found + 1))
    echo "  ⚠ $desc"
    echo "$hits" | sed 's/^/      /'
  fi
}

# marker_src_except <regex> <human-readable description> <file to skip>
# Like marker(), but scans src/ only and skips exactly one file (a path
# relative to the repo root — grep's --exclude would skip every same-named file).
marker_src_except() {
  local pattern="$1" desc="$2" skip="$ROOT/$3:"
  local hits
  hits="$(grep -rIn --include='*.astro' --include='*.ts' --include='*.css' --include='*.mjs' -E "$pattern" "$SRC" 2>/dev/null \
    | awk -v skip="$skip" 'index($0, skip) != 1' || true)"
  if [ -n "$hits" ]; then
    found=$((found + 1))
    echo "  ⚠ $desc"
    echo "$hits" | sed 's/^/      /'
  fi
}

echo "Scanning src/ for un-customized scaffold markers…"

marker 'lang="en"'                 'lang still "en" (set the client locale in MainLayout)'
marker 'example\.com'              'placeholder site URL example.com (set per client / provisioning script)'
marker 'Nueva web app'             'placeholder hero copy "Nueva web app"'
marker 'My Website|My Site'        'placeholder English SEO title/description'
marker '>[Ff]ooter<'               'Footer stub'
marker '\[CLIENTE\]' 'client data placeholder [CLIENTE] (fill from the brief / client-gaps.md)'
marker 'tuagencia|Tu Agencia|\bShine\b|shine_?agencia|Nombre Fundador|Calle Principal|María González|Carlos Rodríguez|300-000-0000|573000000000' 'scaffold contamination (Shine data / old placeholders)'
marker_src_except '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' 'hand-written email address (put it in COMPANY_INFO.email in src/config/seo.ts)' 'src/config/seo.ts'

echo ""
if [ "$found" -eq 0 ]; then
  echo "✓ No un-customized markers found."
  exit 0
fi

echo "→ $found marker group(s) still pending customization."
if [ -n "$STRICT" ]; then
  echo "✗ --strict: failing because placeholders remain."
  exit 1
fi
echo "  (advisory — run with --strict to make this a hard gate)"
exit 0
