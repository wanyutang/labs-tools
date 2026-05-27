---
title: Labs Tools Project Intake
status: active
read_when:
  - new-session
  - planning
  - replenish
---

# Labs Tools Project Intake

## Current Product

Labs Tools is a public GitHub Pages site for browser-based single-page tools.
The current app is a GitHub Gist editor optimized for mobile use.

## Current Architecture

- Vite 7 with React 19.
- Tailwind CSS for styling.
- `src/App.jsx` contains the current product workflow.
- `public/manifest.webmanifest`, `public/sw.js`, and `public/icon.svg` provide
  PWA behavior.
- `.github/workflows/pages.yml` builds with Node 22, `npm ci`, and
  `npm run build`, then deploys `dist` to GitHub Pages.

## Security Boundary

- Users provide their own GitHub token in the browser.
- Token state currently stays on the device through localStorage.
- Gemini API key is also browser-provided and local.
- No server-side credential handling exists in this repo.
- Never commit real tokens, sample real tokens, screenshots containing secrets,
  or debug logs containing request headers.

## Product Surfaces

- GitHub token validation and gist fetching.
- Gist list and search.
- Dotted filename tree grouping.
- Text editor and markdown preview.
- New gist creation.
- AI-assisted generation when a user provides a Gemini key.
- PWA install, service worker cache, and mobile safe-area layout.

## Initial Harness Gap

This repo did not have agent entry files, durable handoff docs, project-map
material, or a local harness validation script before 2026-05-28.
