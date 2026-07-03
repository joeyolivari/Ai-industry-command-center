# Claude / Agent Instructions for AI Industry Command Center

## Project context

This is a zero-dependency single-page portfolio app for a Bank Command Center / BA dashboard simulation. Keep the deployed GitHub Pages app lightweight and avoid adding build tooling unless explicitly requested.

Current app areas:

- `index.html` — main single-page app shell
- `css/` — styling
- `js/` — app behavior and interactions
- `assets/images/` — visual assets
- `vendor/anthropic-skills/` — optional vendored Anthropic Agent Skills after running the sync script

## Use the Anthropic skills setup

This repo includes an Anthropic Agent Skills integration guide in `ANTHROPIC_SKILLS.md`.

When working in Claude Code, use the synced skills when relevant:

- `frontend-design` for UI polish, layout hierarchy, spacing, responsiveness, and portfolio-grade visuals.
- `webapp-testing` for testing dashboard flows, buttons, states, form outputs, and BRD generation.
- `web-artifacts-builder` for producing polished static web artifacts.
- `skill-creator` for creating custom reusable repo skills.
- `claude-api` only if API integration is being added.

To sync upstream skills into the repo:

```bash
bash scripts/sync-anthropic-skills.sh
```

## Coding rules

- Preserve the zero-dependency static site unless the user asks for a framework.
- Do not break GitHub Pages deployment.
- Prefer clean HTML/CSS/JS over heavy libraries.
- Keep business analyst / banking dashboard storytelling clear and professional.
- Protect the app from clutter: put generated/vendor files under `vendor/`.
- Before large UI changes, verify mobile layout, overflow, and button states.
