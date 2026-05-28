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
- Labs Tools is a collection of independent mobile-first single-page tools.
  Each tool can keep its own fit-for-purpose interface, with a separate index
  page linking back out to the individual apps rather than enforcing one shared
  workspace shell.
- Independent tools use folder-style URLs: `/labs-tools/` is the public index,
  and each tool gets its own path such as `/labs-tools/gist-editor/`,
  `/labs-tools/markmap/`, or `/labs-tools/translator/`.
- Every independent tool page provides a lightweight path back to the Labs Tools
  index, but tools are not forced into one shared header/sidebar/workspace shell.
- The first `/labs-tools/` index should be a simple mobile-friendly tool list
  with tool name, short purpose, category/tag, and open action. Search and
  recent-use features wait until the tool count justifies them.
- Architecture direction: modular tools with an optional shared shell. Each
  tool should be a standalone React module that can run by itself, while the
  main app may wrap it in shared navigation, settings, and safe-area behavior.
- Labs-tools product work is governed only through public-safe repo markdown
  reports by default because the repo, committed reports, and GitHub Issues are
  public. Private strategy or sensitive notes must stay outside this public repo.
  Public labs-tools issues/milestones are created only after explicit User
  approval. The mother harness repo is only for reusable Honeys feedback after a
  labs-tools-local change has been validated.

## Candidate Milestones

| Milestone | Boundary | First Cards |
| --- | --- | --- |
| Harness Bootstrap | Entry docs, validation scripts, durable reports, issue loop log | Validate skeleton; add first GitHub issues. |
| Mobile PWA Reliability | Safe-area layout, standalone mode, service worker cache, Pages deploy | Screenshot validation; cache strategy review; install prompt smoke test. |
| Browser Credential Safety | Token/Gemini key storage, logs, rendering, request handling | Secret marker guard; markdown/XSS review; token lifecycle UX. |
| Gist Editor Ergonomics | File tree, editor, preview, save/new gist workflows | Split workflow cards after a milestone boundary note. |

## Current Issue Stock

- `#1 Plan independent mobile tool pages` tracks public planning for the
  independent mobile-first tool page structure:
  `https://github.com/wanyutang/labs-tools/issues/1`

## Next Replenish Action

After this skeleton validates and is pushed, create one milestone-planning issue
for `Harness Bootstrap` and one for `Mobile PWA Reliability`. Do not create a
large batch of implementation issues until milestone scope is explicit.
