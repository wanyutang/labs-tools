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
   `docs/reports/project-map.md`, `docs/reports/issue-loop-log.md`, and
   `references/profiles/labs-tools.md`.
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

This repo is public, so GitHub Issues are public too. By default, keep planning,
session state, and non-public product notes in repo markdown reports such as
`docs/reports/current-session-handoff.md`, `docs/reports/project-map.md`, and
`docs/reports/issue-loop-log.md`. Create GitHub Issues only when the User
explicitly asks to publish that work publicly.

When the User explicitly asks to create public issues, prefer 1-3 small GitHub
issues per replenish pass. Each issue should include:

- source evidence from this repo or reports;
- safe scope and stop line;
- acceptance criteria;
- validation command;
- expected files or surfaces;
- backlink to the relevant project-map section or issue-loop-log row.

Open milestone planning issues only after explicit User approval. An empty
milestone is not evidence of completion.

## Honeys Governance

- Manage labs-tools product development, website optimization, bugs, features,
  reports, session logs, and project-specific skill/profile adjustments in the
  `wanyutang/labs-tools` repo.
- Do not use `agent-harness-workspace` as the issue tracker for labs-tools
  product work. The mother repo is only for reusable Honeys harness, profile,
  skill, install-flow, and governance evolution.
- If a labs-tools checkpoint reveals reusable Honeys improvements, first solve
  and validate the labs-tools need in this repo. Then, only when the experience
  is broadly reusable, open a feedback issue in
  `wanyutang/agent-harness-workspace` describing the target project, problem,
  labs-tools change, validation result, reusable lessons, and project-specific
  parts that should not become shared defaults.
