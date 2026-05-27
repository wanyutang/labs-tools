#!/usr/bin/env bash
set -euo pipefail

echo "## Workspace"
pwd

echo
echo "## Git"
git status -sb || true

echo
echo "## Runtime"
node --version || true
npm --version || true

echo
echo "## Harness"
test -f AGENTS.md && echo "AGENTS.md present" || echo "AGENTS.md missing"
test -x ./agent-tools/bin/validate-harness.sh && echo "validate-harness.sh executable" || echo "validate-harness.sh not executable"
