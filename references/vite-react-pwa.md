---
title: Vite React PWA Harness Profile
status: local-profile
read_when:
  - implementation
  - validation
  - mobile-ui
  - pwa
---

# Vite React PWA Harness Profile

## Stack Contract

- Use Vite scripts from `package.json`.
- Keep Pages deploy compatible with a static `dist` artifact.
- Keep service worker scope aligned with `import.meta.env.BASE_URL`.
- Keep mobile layout aware of `env(safe-area-inset-top)` and
  `env(safe-area-inset-bottom)`.

## Recommended Checks

- `npm run build`
- safe-area regression review for PWA standalone mode
- browser smoke test for token settings, gist list, editor, preview, and save
- service worker cache version review when app-shell files change
- GitHub Pages workflow review when package or build settings change

## Issue Shapes

Good implementation issues should fit one checkpoint:

- fix one mobile occlusion or scrolling surface;
- add one validation guard;
- improve one API failure state;
- improve one PWA install/cache behavior;
- split one oversized React block only when it reduces risk;
- add one project-map or log index section.

Avoid issues that require redesigning the full app in one pass.
