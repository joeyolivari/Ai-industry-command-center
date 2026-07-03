# Anthropic Agent Skills Integration

This repo is set up to pull in Anthropic's public Agent Skills from:

https://github.com/anthropics/skills

Anthropic describes skills as folders of instructions, scripts, and resources that Claude loads dynamically for specialized tasks. Each skill is self-contained in its own folder with a `SKILL.md` file.

## What was added

- `scripts/sync-anthropic-skills.sh` — syncs Anthropic's `skills`, `spec`, and `template` folders into this repo.
- `.github/workflows/sync-anthropic-skills.yml` — lets GitHub Actions sync the skills manually or monthly.
- `.claude-plugin/marketplace.json` — exposes the synced skills as Claude Code plugins from this repo once `vendor/anthropic-skills` exists.

## How to sync the actual skills locally

Run this from the repo root:

```bash
bash scripts/sync-anthropic-skills.sh
```

That creates:

```text
vendor/anthropic-skills/
  skills/
  spec/
  template/
  README.md
  THIRD_PARTY_NOTICES.md
  UPSTREAM.md
```

## How to sync through GitHub Actions

1. Go to the repo on GitHub.
2. Open **Actions**.
3. Select **Sync Anthropic Agent Skills**.
4. Click **Run workflow**.

The workflow will commit `vendor/anthropic-skills` back into the repo when upstream files are pulled.

## Skill sets included after sync

### Document skills

- `xlsx`
- `docx`
- `pptx`
- `pdf`

Important: Anthropic says these document creation/editing skills are source-available, not open source. Review upstream terms before packaging this repo as a commercial product.

### Example skills

- `algorithmic-art`
- `brand-guidelines`
- `canvas-design`
- `doc-coauthoring`
- `frontend-design`
- `internal-comms`
- `mcp-builder`
- `skill-creator`
- `slack-gif-creator`
- `theme-factory`
- `web-artifacts-builder`
- `webapp-testing`

### Claude API skill

- `claude-api`

## Recommended skills for this project

For the AI Industry Command Center app, the most useful skills are:

- `frontend-design` — improve the portfolio UI, layout, spacing, visual hierarchy, and responsive design.
- `webapp-testing` — test the single-page app flow, buttons, dashboard states, and generated BRD outputs.
- `web-artifacts-builder` — help build polished web artifacts and demos.
- `skill-creator` — create custom skills specific to your BA/BI/FP&A portfolio workflow.
- `claude-api` — useful if you later connect this project to Anthropic's API.

## Notes

The synced files are vendored under `vendor/anthropic-skills` so they do not interfere with the deployed GitHub Pages app. Keep upstream notices with the synced files.
