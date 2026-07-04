# Hüpftronik Documentation

Source for the [Hüpftronik documentation site](https://martijn4313.github.io/hupftronik-docs/) —
open-source hardware solutions for automotive and motorcycle projects, starting with the
Motorsteuergerät 24P V1 engine control unit.

Built with [MkDocs](https://www.mkdocs.org/) and the
[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme.

## Working locally

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
mkdocs serve                # live-reloading preview at http://127.0.0.1:8000
```

`mkdocs build --strict` builds the static site and fails on broken internal links — run it before
pushing.

## Deployment

Pushes to `main` are built and published to GitHub Pages automatically by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Repository layout

- `docs/` — all page content (Markdown), organized as products / guides / tools / about
- `docs/tools/diagram-editor/` — Harness Bench, a browser-based wiring diagram designer (standalone
  HTML/CSS/JS, no build step)
- `includes/` — reusable snippet files pulled into pages via `pymdownx.snippets`
  (`--8<-- "filename.md"`)
- `mkdocs.yml` — site configuration and navigation tree
- `docs/stylesheets/extra.css` — theme customization, content-status badges, and the custom
  `standpunkt` admonition

## Content conventions

- Most pages carry a **content-status badge** under the title (`Reviewed` or `AI-drafted — verify
  before use`) — see *About → Open-Source & Community* on the site for what these mean. Set the
  badge honestly on new pages.
- Design-rationale callouts use the custom `!!! standpunkt` admonition.
- Facts not yet confirmed against real hardware are marked *to be confirmed* rather than guessed.

## Reporting problems

Found a broken link, wrong spec, or a step that didn't work as written? Open an issue describing
the page, what you expected, and what happened — documentation fixes are among the most valuable
contributions a builder can make.
