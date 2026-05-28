#!/usr/bin/env bash
set -euo pipefail

echo "## Harness files"
required_files=(
  "AGENTS.md"
  "CLAUDE.md"
  ".github/copilot-instructions.md"
  ".honeys/profiles.json"
  ".honeys/harness-install.json"
  "references/project-intake.md"
  "references/profiles/labs-tools.md"
  "references/vite-react-pwa.md"
  "docs/reports/current-session-handoff.md"
  "docs/reports/project-map.md"
  "docs/reports/issue-loop-log.md"
  "public/manifest.webmanifest"
  "public/sw.js"
  ".github/workflows/pages.yml"
)

for file in "${required_files[@]}"; do
  test -f "$file"
done
echo "ok"

echo
echo "## JSON validation"
python3 -m json.tool package.json >/dev/null
python3 -m json.tool .honeys/profiles.json >/dev/null
python3 -m json.tool .honeys/harness-install.json >/dev/null
python3 -m json.tool public/manifest.webmanifest >/dev/null
echo "ok"

echo
echo "## Browser credential boundary"
rg -n "localStorage\\.setItem\\(\"github_gist_token\"|localStorage\\.getItem\\(\"github_gist_token\"" src >/dev/null
rg -n "https://api\\.github\\.com/gists" src >/dev/null
echo "ok"

echo
echo "## Secret marker scan"
if rg -n "(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{40,}|BEGIN PRIVATE KEY|client_secret|refresh_token|password:)" . \
  --glob '!node_modules/**' \
  --glob '!dist/**' \
  --glob '!.git/**' \
  --glob '!agent-tools/bin/validate-harness.sh'; then
  echo "Forbidden secret marker found." >&2
  exit 1
fi
echo "ok"

echo
echo "## Build"
npm run build

echo
echo "Harness validation passed."
