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
- `artwork/` — full-resolution logo and mascot sources (not deployed); see its README for the derived web copies
- `docs/stylesheets/extra.css` — theme customization and content-status badges

## Content conventions

Writing rules, page structure, callout conventions, and the rules for AI assistants are in
[`AGENTS.md`](AGENTS.md). Read it before your first edit.

## Adding wiring diagrams

Prefer Mermaid exports from [Harness Bench](docs/tools/diagram-editor/) for diagrams on
documentation pages: the source lives in the Markdown file and diffs cleanly. When an SVG is the
better fit (complex layouts, print-quality output):

1. Click **Export SVG** in Harness Bench and save the file into `docs/assets/diagrams/` (create the
   folder if it does not exist). Exported SVGs are self-contained and need no external files.
2. Reference it from the page with a standard image tag, using a path relative to that page:

   ```markdown
   ![Harness overview — Volvo B21 base build](../../assets/diagrams/volvo-b21-harness.svg)
   ```

3. Store the matching Harness Bench `.json` save file next to the SVG, so the diagram can be
   reopened and edited later:

   ```text
   docs/assets/diagrams/
     volvo-b21-harness.json   ← Harness Bench save file (source)
     volvo-b21-harness.svg    ← exported for the docs page
   ```

A possible future addition is a read-only viewer that loads a Harness Bench `.json` file directly on
a documentation page (pan, zoom, inspect wires). It is not implemented yet; the JSON format and the
renderer already exist, so open an issue or pull request if you want to build it.

## Reporting problems

Found a broken link, wrong spec, or a step that didn't work as written? Open an issue describing
the page, what you expected, and what happened — documentation fixes are among the most valuable
contributions a builder can make.
