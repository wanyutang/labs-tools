---
title: Labs Tools Current Session Handoff
status: active
updated_at: 2026-05-28
---

# Current Session Handoff

## Latest State

The Labs Tools repo has the minimal Honeys labs-tools harness bootstrap applied.
The mother harness is pinned in `.honeys/harness-install.json`, the active
profile is recorded in `.honeys/profiles.json`, and the app itself is still the
GitHub Gist mobile editor.

Public planning for the independent mobile tool page structure is tracked in
`https://github.com/wanyutang/labs-tools/issues/1`.
That issue now contains phased small-waterfall checklists for future
implementation passes.

Current pass: Phase 1 first checklist item is complete. `src/App.jsx` is now a
thin entry, and the existing Gist editor implementation lives under
`src/tools/gist-editor/GistEditor.jsx`.

Mobile readability issue `#3` is in progress to increase phone-only text,
shortcut, and icon sizing without changing desktop layout.
Editor-only zoom issue `#4` adds `A-`/`A+` controls and two-finger pinch
handling for the edit pane while keeping the bottom formatting bar fixed.
PWA repair issue `#5` updates manifest installability and bumps the service
worker cache after the installed app was reported broken.
Editor upgrade issue `#7` replaces the plain textarea with CodeMirror 6 for
syntax highlighting by file extension. The same pass keeps the existing mobile
format toolbar, adds a one-button Editor/View toggle, and adds a mobile-friendly
"move to folder" action because iOS/PWA long-press drag is unreliable for the
tree drag/drop rename workflow.

## Entry Checklist

- `git status -sb`
- read `AGENTS.md`
- read `references/project-intake.md`
- read `references/profiles/labs-tools.md`
- read `references/vite-react-pwa.md`
- read `docs/reports/project-map.md`
- read `docs/reports/issue-loop-log.md`
- run `./agent-tools/bin/doctor.sh`

## Next Best Actions

1. Keep future changes scoped to one workflow surface at a time.
2. Keep only public-safe planning in repo markdown reports by default. Private
   strategy or sensitive notes must stay outside this public repo. Create public
   GitHub issues or milestones only when the User explicitly asks to publish
   them.
3. Continue product planning from the independent-tool index/page decision in
   `docs/reports/project-map.md`.
4. Keep labs-tools product governance in public-safe `wanyutang/labs-tools`
   reports by default; only send reusable Honeys process feedback to
   `wanyutang/agent-harness-workspace` as a public feedback issue when approved.
5. When working from public issue `#1`, pick a small unchecked checklist item,
   implement, validate, comment, and update the checklist/report state.
6. Next likely `#1` item: add tool metadata for the Gist editor.
7. Verify issue `#3` on a real phone after deploy; adjust mobile sizing only if
   the UI still feels too small or becomes crowded.
8. Verify issue `#4` on a real phone with an opened gist: the editor text and
   line numbers should zoom together, while the bottom formatting bar stays put.
9. Verify issue `#5` by refreshing/reinstalling the PWA on the phone after
   deploy; stale installed app cache may require removing and re-adding once.
10. After deploying the CodeMirror pass, verify on phone that syntax colors,
    vertical/horizontal editor scrolling, bottom toolbar, and the move-to-folder
    modal all work with a real Gist token.

## Open Risks

- Browser tokens are stored in localStorage; future work should explicitly assess
  XSS, markdown rendering, and clipboard/log exposure risks.
- Mobile standalone PWA safe-area behavior needs screenshot validation on iOS-like
  viewports before UI-heavy changes.
- CodeMirror increases the production JS chunk size; later optimization can
  split editor language packs if load time becomes noticeable on phones.
