---
project: labs-tools
harness_version: 0.1.0
last_updated: 2026-05-28
---

# Labs Tools Agent Guide

This repository is a public GitHub Pages site for browser-based single-page tools.
The current app is a mobile-friendly GitHub Gist editor built with Vite, React,
Tailwind, PWA assets, and the GitHub Gists API.

## New Session Entry

Start every session with this bounded handoff:

1. Run `git status -sb` and confirm local/remote are close.
2. Read `README.md`, this file, `docs/reports/current-session-handoff.md`,
   `docs/reports/project-map.md`, and `docs/reports/issue-loop-log.md`.
3. Check `package.json` scripts and `.github/workflows/pages.yml`.
4. Classify work as `inspect`, `plan`, `implement`, `verify`, `replenish`, or
   `pause`.
5. If you change files, validate, commit, push, and report the remote commit or
   file URL.

Do not keep plans only in chat. Any durable plan, decision, risk, or next action
must be reflected in `docs/reports/current-session-handoff.md`,
`docs/reports/project-map.md`, `docs/reports/issue-loop-log.md`, or GitHub
issues.

## Product Boundary

- Keep the app static and GitHub Pages compatible.
- Keep GitHub and Gemini keys user-provided in the browser. Never add a backend
  proxy or committed credential.
- Treat localStorage token handling, markdown rendering, service worker caching,
  and mobile safe-area layout as high-risk surfaces.
- Prefer small improvements to one workflow at a time: gist list, file tree,
  editor, preview, settings, PWA install, offline/cache behavior, or mobile
  layout.

## Validation

Use these commands:

```bash
./agent-tools/bin/doctor.sh
./agent-tools/bin/validate-harness.sh
npm run build
```

`validate-harness.sh` is the required full local validation before a commit that
changes app behavior, harness files, PWA assets, package metadata, or deployment.

## Implementation Rules

- Use the existing React component style unless a change clearly needs a new
  component.
- Keep UI dense, mobile-first, and safe-area aware.
- Do not add a landing page in front of the usable tool.
- Do not store secrets in repo files, logs, screenshots, or test fixtures.
- Do not add paid services, external databases, global configuration changes, or
  destructive git commands without explicit user direction.
- If browser validation is needed, use the local dev server and inspect both
  desktop and mobile-sized viewports.

## Queue Rules

When creating future work, prefer 1-3 small GitHub issues per replenish pass.
Each issue should include:

- source evidence from this repo or reports;
- safe scope and stop line;
- acceptance criteria;
- validation command;
- expected files or surfaces;
- backlink to the relevant project-map section or issue-loop-log row.

Open milestone planning issues before filling a milestone with implementation
cards. An empty milestone is not evidence of completion.
