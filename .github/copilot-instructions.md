# Copilot / AI agent instructions — webnico

This repository is a small static web dashboard served with nginx in Docker. The guidance below highlights project-specific patterns, run/debug workflows, and cautions for network-sensitive changes.

- **What this project is**: a static single-page app (HTML/CSS/JS) that lists internal services and installers. Key files: [Dockerfile](Dockerfile), [docker-compose.yml](docker-compose.yml), [index.html](index.html), [script.js](script.js), [styles.css](styles.css).

- **Runtime / how to run locally**:
  - Quick local dev (no Docker): serve files from the repo root: `python -m http.server 8000` or `npx serve .` and open `http://localhost:8000`.
  - Docker (production-like): `docker-compose up --build` — service `webnico` maps host `7000` → container `80` (open http://localhost:7000).
  - Docker image is a simple `nginx:alpine` copy of the repo into `/usr/share/nginx/html` (see `Dockerfile`).

- **No build step**: There is no bundler or transpiler. Modifying HTML/JS/CSS is immediate for local server; Docker requires rebuild to reflect changes.

- **Network / internal links**:
  - `index.html` contains many intranet/internal IP addresses (10.x, 172.16.x.x) and private service URLs. Do not attempt to validate or fetch these from CI or public environments — tests will fail outside the corporate network.
  - The JS health-check logic in `script.js` actively performs short GET requests to the listed `card` URLs. Important details to respect when editing this code:
    - Monitoring interval: `setInterval(startMonitoring, 180000)` (3 minutes).
    - Per-request timeout uses `AbortController` and 4000ms.
    - Special-case handling: Atlassian/Jira returns `405` as a liveness signal; wiki pages are checked by inspecting response text for specific error strings.
    - Fetch may hit CORS restrictions — code already uses `no-cors` fallback for some cases.

- **Binary assets**: the repo contains Windows installers referenced for download. Treat these as static artifacts — avoid editing or re-encoding them. Consider adding a `.dockerignore` to exclude large unneeded files if building smaller images.

- **Editing patterns and conventions**:
  - UI interaction is simple: `onclick` attributes call `toggleDropdown('id')` in `script.js` — keep IDs consistent between HTML and JS.
  - Emoji icons are rendered by `script.js` into inline SVGs; the DOM uses `.icon` and `.icon-large` placeholders which the JS replaces (see `createModernEmojiSVG`). When changing markup, preserve these placeholders for accessibility.
  - Status indicator CSS classes: `.status-dot`, `.checking` and inline style updates are used by JS `updateStatusIndicator(card, isUp)`.

- **When writing code or tests**:
  - Avoid creating CI tests that perform live network checks against internal IPs. If you must add tests for `script.js` logic, mock `fetch` and `AbortController` behavior.
  - Prefer small, focused changes: this project is lightweight — keep edits constrained to the few files above unless adding new assets.

- **PR and commit guidance for AI agents**:
  - Include scope in the PR title (e.g., `ui: improve status indicator behavior` or `chore: add .dockerignore to shrink image`).
  - For any change touching external links or installers, request human review — these are organization-specific resources.

- **Files to inspect first when investigating issues**:
  - `script.js` — behavior for dropdowns, emoji rendering, monitoring, fetch fallbacks.
  - `index.html` — canonical list of targets and UI structure.
  - `Dockerfile` and `docker-compose.yml` — how the app is packaged and exposed (port `7000`).

If any section is unclear or you'd like me to include example unit tests or a `.dockerignore`, tell me which parts to expand. 
