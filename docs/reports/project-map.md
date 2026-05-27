---
title: Labs Tools Project Map
status: active
updated_at: 2026-05-28
---

# Labs Tools Project Map

## Product Lines

| Line | Current State | Evidence | Next Replenish Action |
| --- | --- | --- | --- |
| Gist editor | Active primary tool | `src/App.jsx`, `README.md` | Scope small issues around editor, tree, preview, and save flows. |
| Browser credential handling | Active high-risk surface | `localStorage` use in `src/App.jsx` | Create security hardening milestone before implementation cards. |
| PWA/mobile shell | Active high-risk surface | `public/sw.js`, `manifest.webmanifest`, `src/index.css` | Create mobile/PWA validation issue with screenshot acceptance. |
| GitHub Pages deploy | Active | `.github/workflows/pages.yml` | Keep `npm run build` as required validation. |
| Agent harness | New local bootstrap | `AGENTS.md`, `agent-tools/bin/*` | Commit skeleton, then open milestone planning cards. |

## Settled Decisions

- The project remains a static browser app deployed through GitHub Pages.
- User-provided API keys stay in the browser; no backend proxy is introduced by
  default.
- New-session context should be read from repo-native docs, not reconstructed
  from chat history.

## Candidate Milestones

| Milestone | Boundary | First Cards |
| --- | --- | --- |
| Harness Bootstrap | Entry docs, validation scripts, durable reports, issue loop log | Validate skeleton; add first GitHub issues. |
| Mobile PWA Reliability | Safe-area layout, standalone mode, service worker cache, Pages deploy | Screenshot validation; cache strategy review; install prompt smoke test. |
| Browser Credential Safety | Token/Gemini key storage, logs, rendering, request handling | Secret marker guard; markdown/XSS review; token lifecycle UX. |
| Gist Editor Ergonomics | File tree, editor, preview, save/new gist workflows | Split workflow cards after a milestone boundary note. |

## Current Issue Stock

No GitHub issues have been created for this repo by this harness yet.

## Next Replenish Action

After this skeleton validates and is pushed, create one milestone-planning issue
for `Harness Bootstrap` and one for `Mobile PWA Reliability`. Do not create a
large batch of implementation issues until milestone scope is explicit.
