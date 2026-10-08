# Hüpftronik Documentation — Rules for Writers and AI Assistants

This file is the single source of rules for anyone — person or AI assistant — writing or editing this
repository. Claude Code (via `CLAUDE.md`), Cursor (via `.cursor/rules/docs.mdc`), GitHub Copilot, and
other agents that read `AGENTS.md` all load it.

## Project context

Hüpftronik is an open-hardware automotive ECU platform built on STM32 microcontrollers, running rusEFI
or Speeduino firmware. This repository is the MkDocs (Material theme) documentation site. Readers range
from complete beginners (first time wiring or flashing a board) to experienced engine tuners and
embedded developers. Every page must serve both ends of that range.

A wrong pin, value, or procedure on this site can destroy hardware or an engine. Accuracy outranks
speed, completeness, and polish.

## Commands

```bash
pip install -r requirements.txt
mkdocs serve                              # live preview at http://127.0.0.1:8000
python -m mkdocs build --strict           # must pass before you finish — fails on broken links
node --test tests/diagram-editor/*.test.mjs   # Harness Bench tests (run if you touch docs/tools/diagram-editor/)
```

## Repository layout

- `docs/` — page content. `products/` (per-board docs), `guides/` (cross-product guides),
  `tools/` (standalone browser tools), `about/`.
- `includes/` — snippets pulled into pages with `--8<-- "file.md"` (status badges, shared warnings).
- `mkdocs.yml` — site configuration and the navigation tree.
- `docs/stylesheets/extra.css` — theme customization and content-status badge styles.
- `scripts/normalize_markdown_headings.py` — heading-number normalizer (see *Headings* below).
- Do not edit generated `site/` output or local editor state.

## Rules for AI assistants (highest priority)

1. **Never invent hardware facts.** Pin assignments, component values, current limits, part numbers,
   and measurements must come from the schematic, a datasheet, the bench, or an existing page. If you
   cannot cite a source, write *to be confirmed* instead of a value.
2. **Never upgrade a content-status badge.** An AI may set a page to *AI-drafted* but never to
   *Reviewed* or *In Review* — only a person who checked the page does that. When an AI substantially
   rewrites a *Reviewed* page, say so in the change summary so a person can re-check it.
3. **Flag what you could not verify.** In your summary, list every new claim that rests on general
   knowledge rather than a source in the repo.
4. **Keep changes scoped.** Do not rewrite sections you were not asked to touch.
5. **Finish with checks:** run the strict build (and the Harness Bench tests if relevant) and report
   the result honestly.

## Audience

- Write each page for one clearly imagined reader. Assume **zero prior knowledge of Hüpftronik**, but
  assume basic general competence (the reader can use a terminal, a multimeter, a screwdriver).
- Do not re-explain general concepts (what a car or a computer is). Do explain anything specific to
  this project, to automotive ECUs, or to the task on the page.
- Never condescend and never assume. When in doubt, define the term or link to the page that does.

## "What and why before how" — required on every page

Before any steps, procedures, or reference tables, open the page with 2–4 sentences covering, in order:

1. **What** this page / thing is.
2. **Why** the reader would do it or needs to know it.
3. **What is about to happen** (a one-line preview of the procedure), if the page is a procedure.

Only then give the steps. Never open a page by jumping straight into step 1 or a command.

> Flashing means copying the engine-control firmware onto the board's microcontroller. You do this
> once before first use, and again when updating firmware. The board cannot run an engine until it
> has firmware on it. To flash, you put the board into DFU mode with the boot switch, then send the
> firmware over USB from your computer.

## Page skeleton

```markdown
# Page Title
--8<-- "status-ai-draft.md"

---

What and why before how (2–4 sentences).

---

## 1. First section

...

---

## N. Next steps

Where to go next, plus Troubleshooting for procedures.
```

- Exactly one `# H1` per page — it is the page title, and it must match the page's label in the
  `mkdocs.yml` nav (step numbers in the nav excepted).
- The content-status snippet goes on the line directly below the H1: `status-reviewed.md`,
  `status-in-review.md`, or `status-ai-draft.md`. Set it honestly (see the AI rules above).
- Sections are separated by `---` rules.

## Headings and cross-references

- Number `##` and `###` headings: `## 3. IO Overview`, `### 3.1. Quick Specs`.
- Refer to sections as `§3.1` and link to them by anchor:
  `[Hardware Reference §4.4](reference.md#44-output-summary-table)`. Link to pages by their relative
  `.md` path, never by a site URL.
- A terminal technical appendix uses `<!-- heading-numbering: appendix -->` before its title and
  `A.x` labels; refer to those sections as `§A.x`.
- Renumbering a heading changes its anchor and breaks links to it. After changing headings, run the
  strict build; run `python scripts/normalize_markdown_headings.py docs` only when a broad
  normalization is intended, and inspect the diff.

## Structure

- Order content by reader need: what they do first comes first; basics at the top, advanced or
  optional material at the bottom.
- Keep section order **parallel across equivalent pages** (for example every vehicle guide uses the
  same sections). Match sibling pages before inventing new structure.
- One idea per section. If a heading covers two things, split it.
- Headings must be skimmable: a reader should understand the page from its headings alone.
- Put safety-critical advice, operating limits, and conclusions in visible text. Use default-collapsed
  `???` details blocks only for optional derivations, design rationale, scope-capture analysis, and
  long comparison tables.

## Language

- Short sentences, one idea each.
- Active voice and direct instructions: "Connect CANH to pin A5," not "CANH should be connected."
- Define every acronym or domain term on first use, then use the short form.
- Link the first mention of a cross-cutting concept (CAN, lambda, VE table…) to its explainer page
  instead of re-explaining it inline.
- Be concrete: give the actual value, pin, command, or filename — never "the relevant setting."
- Delete filler and minimizing words: "just," "simply," "basically," "obviously."
- Spelling: **American English** (behavior, color, optimize, fueling). Existing British spellings
  can be converted when you edit a page.

## Formatting conventions

- Numbered lists for ordered procedures; bullet lists for unordered options.
- Tables for all reference data (pinouts, specifications, symptom → cause → fix). Never bury a pinout
  in prose.
- Code formatting for every command, filename, path, signal name (`INJ1_DRV`), or literal value the
  reader types or looks for.
- Units and formulas use the arithmatex syntax already on the site: `$12\,\text{V}$`,
  `$0.5\,\text{mm}$`.
- Admonitions (callout boxes):

  | Type | Use for |
  |---|---|
  | `!!! danger` | Safety risk or irreversible action |
  | `!!! warning` | Caution — something can go wrong or be damaged |
  | `!!! note` | Status, context, *to be confirmed* notices |
  | `!!! tip` | Helpful aside |
  | `!!! info` | Design rationale — why the hardware is built this way |
  | `!!! success` | A confirmed result or a recommended configuration summary |

- Bold the single key term in a line, not whole sentences.
- Add an image where words struggle (connector photos, wiring diagrams, button locations), with a
  caption. Prefer Mermaid or SVG over raster images for diagrams; compress raster images (aim for
  under 300 KB).

## Safety and honesty

- Place safety callouts **above** the step they apply to, never after.
- Warn about the irreversible or expensive action (reverse polarity, wrong flash, engine load) exactly
  where it happens.
- State feature status honestly. Mark anything experimental, untested, or planned. Never imply
  something works if it does not.
- Unverified hardware details are marked *to be confirmed*. Do not guess specifications.

## Help the reader move

- End any procedure with a pointer to Troubleshooting or an "If it doesn't work" path.
- End every page with a "Next steps" section — never leave the reader at a dead end.
- If a page assumes another page was completed first, link that prerequisite at the top.
- The Motorsteuergerät 24P V1 setup path is the numbered **Getting Started** sequence in
  `mkdocs.yml`. Keep each step's "Next steps" pointing to the following step.

## Consistency

- Use one term for one thing throughout. Signal names follow the pinout in
  `docs/products/motorsteuergerat-24p-v1/24p_v1_overview.md` (`FPRELAY_DRV`, not `FP_RELAY`).
- Spell device names exactly: Motorsteuergerät, Schildknappe, Schnüffelstück, Schildwache,
  Schaltkaiser, Gedächtnisgerät, Vermittler, Eingeweide. Only the Motorsteuergerät 24P V1 exists
  today; the others are planned — never describe them as available.

## Navigation and configuration

- Every page must appear in the `nav` of `mkdocs.yml`; unfinished pages go under an
  "Under construction" group with `includes/under-construction-notice.md`.
- Use the Material for MkDocs and PyMdown features already enabled in `mkdocs.yml`. Do not add
  extensions without configuring them and checking the strict build.

## Before finishing an edit

- Re-read the page as a first-time reader: could a beginner start at step 1, and could an expert skim
  to the part they need? Both must be true.
- Verify every link resolves to a real page and points where the text claims.
- Confirm the page opens with "what and why before how," not a bare instruction.
- Run `python -m mkdocs build --strict`.

## The four rules to keep above all

1. Say what and why before how.
2. Define or link every piece of jargon.
3. One idea per sentence, per section.
4. Always tell the reader where to go next.
