---
purpose: labs-tools-profile
audience: agent
profile: labs-tools
---

# Labs Tools Profile

Use only when `.honeys/profiles.json` enables `labs-tools`.

Signals:

- Vite + React in `package.json`.
- `src/App.jsx` or `src/main.jsx`.
- `public/manifest.webmanifest` or `public/sw.js`.
- `.github/workflows/pages.yml`.

Rules:

- Preserve static GitHub Pages compatibility.
- Keep user-provided GitHub/Gemini keys in the browser; never commit secrets.
- Treat localStorage, markdown rendering, service worker cache, PWA safe-area
  layout, and GitHub API requests as high-risk surfaces.
- Validate with `npm run build` when project files exist.
- Create milestone scope before implementation issue batches.
- Do not mutate external repos unless the User explicitly marks the target repo
  writable for this checkpoint.

Candidate milestones:

1. Harness Bootstrap.
2. Mobile PWA Reliability.
3. Browser Credential Safety.
4. Tool Workflow Ergonomics.
