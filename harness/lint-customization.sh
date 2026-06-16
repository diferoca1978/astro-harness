#!/usr/bin/env bash
# ============================================================================
# lint-customization.sh
# Detects scaffold placeholders that mean "not yet customized for this client".
# These are NOT bugs — they are knobs the brief/brand input has not filled yet.
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

echo "Scanning src/ for un-customized scaffold markers…"

marker 'lang="en"'                 'lang still "en" (set the client locale in MainLayout)'
marker 'example\.com'              'placeholder site URL example.com (set per client / provisioning script)'
marker 'Nueva web app'             'placeholder hero copy "Nueva web app"'
marker 'My Website|My Site'        'placeholder English SEO title/description'
marker '>NavBar<'                  'Navbar stub (<h1>NavBar</h1>)'
marker '>Footer<'                  'Footer stub (<h1>Footer</h1>)'
marker 'Summary Section'           'Summary stub'
marker 'Service Card Component'    'ServiceCard stub'
marker 'form component'            'ContactForm stub'
marker '>CTA<'                     'Cta stub'
marker '>Services<'                'Services stub'

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
