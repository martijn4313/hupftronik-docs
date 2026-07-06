# Documentation review — alpha launch readiness (5–10 testers)

*Review date: 2026-07-06. Scope: every content page on the site (27 pages), the includes,
`mkdocs.yml`, and the deploy workflow. The site was built with `mkdocs build --strict` and again
with anchor validation enabled to check every internal cross-reference. Math on the reference,
workshop, and example-build pages was spot-verified.*

---

## Overall assessment

The documentation is in unusually good shape for a pre-launch project:

- **Honesty infrastructure works.** Content-status badges (Reviewed / AI-drafted / In Review),
  *to be confirmed* markers instead of guessed specs, and per-page "biggest verification risk"
  notes are exactly right for an alpha and are applied consistently.
- **Cross-linking discipline is excellent.** Exactly one broken anchor exists site-wide
  (see P1 §7). Every guide funnels into the same commissioning workflow, and the troubleshooting
  page is organized by commissioning stage so its pointers land where readers actually are.
- **Consistent page anatomy** (Quick Scan / Technical Detail / Design Rationale) makes the
  vehicle guides skimmable, and the worked B230 examples layering on the B2xx baseline is a
  strong pattern.
- **The math checks out.** Thermal analysis (3.88 W × 50 °C/W = 194 °C rise), injector flow
  conversions (214 cc/min → ~107 mL/30 s), pump sizing (0.31 L/hr/hp), and the sequential-injection
  routing constraints are all internally consistent.

The gaps are almost entirely about **what an alpha tester with a physical board in hand needs on
day one** — compile targets, board landmarks, feedback channel — not about writing quality. The
TODO list below is ordered accordingly.

---

## TODO — P0: blockers before inviting testers

- [ ] **1. Publish the exact firmware build target for each firmware.**
  `docs/products/motorsteuergerat-24p-v1/setup/index.md` §4 ("check the firmware repository's
  board list"), `setup/rusefi.md` §2 and `setup/speeduino.md` §2 ("*if* a board-specific profile
  exists…") all hedge on the single fact a tester cannot proceed without. Provide, per firmware:
  the exact board profile / config name (or the config files themselves), a pinned known-good
  firmware commit or release tag, and the matching TunerStudio INI. If a profile doesn't exist
  upstream yet, ship the config in a Hüpftronik repo and link it. The "don't duplicate upstream"
  instinct is right for GA; for a 5–10 person alpha, pin everything.

- [ ] **2. Add the feedback channel — with actual links.**
  `mkdocs.yml` has no `repo_url`, so the deployed site contains no GitHub link at all.
  `docs/about/community.md` §3 and the README both say "open an issue against the documentation
  repository" without linking it. Add `repo_url` (and optionally `edit_uri`) to `mkdocs.yml`, and
  hyperlink the issue tracker everywhere reporting is mentioned. Alpha testing *is* the feedback
  loop; right now the loop has no entry point.

- [ ] **3. Document the physical board: annotated photo/diagram page.**
  Several procedures reference physical features that are never located anywhere:
  - status LEDs ("observe the status LEDs" — `setup/index.md` §6; "Fault LED lit" —
    `troubleshooting.md` §2) — no page says how many LEDs exist or what each indicates
  - the boot switch (`setup/flashing.md` §2) — no location or photo
  - USB connector, SD card slot, H1/H2/H3 expansion headers (`24p_v1_overview.md` §4)
  - Q3/Q4 driver packages (`wiring.md` §4.3) — a builder repurposing outputs can't identify them
  One annotated top-down board photo (or silkscreen render) with a legend, plus a short LED
  behavior table, closes all of these at once.

- [ ] **4. Delete `docs/products/motorsteuergerat-24p-v1/test.md`.**
  A scratch file with malformed Mermaid fences. It's not in the nav but is built into the site
  and reachable via search.

- [ ] **5. Resolve the *to be confirmed* specs testers hit immediately.**
  In `24p_v1_overview.md` §2 and `reference.md` §7.2/§8.1 — all answerable from a board on the
  bench: board dimensions / enclosure fitment (testers must buy the AliExpress case before
  anything else), CAN onboard termination (present? jumpered?), and the +5 V sensor-rail current
  budget. Operating temperature and quiescent draw can reasonably stay TBC through alpha.

- [ ] **6. Add an "Alpha testers start here" page.**
  One page covering: what's in the kit / what testers received, what is verified vs. untested at
  this hardware revision, the recommended commissioning order (links into the existing setup
  flow), a hardware errata / known-issues list (living document), a bug-report template (page,
  expected, observed, board rev, firmware commit), and a direct contact channel. Link it
  prominently from the homepage.

---

## TODO — P1: fix before or during the alpha window

- [ ] **7. Fix the one broken link on the site.**
  `docs/guides/setup/specific/b230-examples/b230ft-holset.md` §1 links `#4-sensors-and-ignition`,
  but that content is §5 (`#5-sensors-and-ignition`); §4 is Fueling. Fix the anchor and the "see
  §4" text.

- [ ] **8. Make CI enforce what the README asks of humans.**
  `.github/workflows/deploy.yml` runs plain `mkdocs build`, while the README says to run
  `mkdocs build --strict` before pushing. Add `--strict` to the CI build and enable anchor
  validation in `mkdocs.yml` (`validation: anchors: warn`) so links like §7 are caught
  automatically. (The current build is clean, so turning this on costs nothing.)

- [ ] **9. Document the third status badge.**
  `includes/status-in-review.md` ("In Review") is used on the Holset page, but
  `docs/about/community.md` §5 — the page that defines the badges — documents only *Reviewed*
  and *AI-drafted*. The README's content conventions also list only two. Add the third
  definition (or retire the badge).

- [ ] **10. Human-verify the core commissioning path before testers rely on it.**
  The path every tester must walk — `setup/rusefi.md`, `setup/speeduino.md`,
  `setup/calibration.md`, `guides/tuning/software.md`, `guides/tuning/basics.md`,
  `guides/setup/troubleshooting.md` — is all badged *AI-drafted — verify before use*. That badge
  is honest, but for alpha the vendor should have walked flash → configure → first start on real
  hardware at least once and promoted those pages to *Reviewed* (or annotated what was actually
  exercised). Vehicle-specific guides and example builds can legitimately stay drafts — that's
  what the testers are for.

- [ ] **11. Verify the Speeduino claims.**
  Two related risks: (a) `24p_v1_overview.md` §2 and `about/license.md` state both firmwares are
  GPLv3 — Speeduino is GPL-2.0; correct or verify. (b) "the board fully supports … Speeduino"
  (`setup/index.md` §1) — if the STM32F405 Speeduino port hasn't actually been bench-validated on
  this board, scope the claim and recommend rusEFI for the alpha period. Supporting two firmware
  paths doubles the alpha support surface; it's fine to declare one path primary.

- [ ] **12. Give the empty Schildknappe placeholder files stub content or remove them.**
  `docs/products/schildknappe/{wiring,flashing,rusefi,speeduino,standalone,reference}.md` are
  zero-byte files. They're out of the nav (good, and the mkdocs.yml comment explains the plan),
  but they build as blank pages reachable through search. A one-line "Not yet written — see the
  Schildknappe overview" stub, or deleting them until written, avoids testers landing on blank
  pages.

- [ ] **13. Homepage: make it route people.**
  `docs/index.md` currently reads as a mission statement. For alpha it should route: an explicit
  start path (Planning your build → Product overview → Setup and Commissioning), a link to the
  new alpha-testers page, and an alpha-status callout. Mechanical nits while in there: the
  "Start here" link text says "overview and wiring" but links only the overview;
  `docs/welcome_banner.png` is unused (index uses `hupftronik_lowress.png`) — delete or use it;
  numbered section headings ("## 1. What you can find here") read oddly on a welcome page.

- [ ] **14. Naming/asset consistency.**
  Nav says "Design Reference", the page and every cross-reference say "Hardware Reference" —
  align the nav label. `docs/products/motorsteuergerat-24p-v1/mermaid-fullscreen.js` is orphaned
  (loaded nowhere) — wire it up via `extra_javascript` or delete it.

- [ ] **15. Soften the field-usage claim.**
  `guides/setup/specific/index.md` says these are "engines the community commonly runs on the
  Motorsteuergerät 24P V1" — no boards are in the field yet. For a project whose credibility
  rests on honest labeling, rephrase (e.g. "engines this documentation targets first").

---

## TODO — P2: polish, fine during/after alpha

- [ ] **16. Typos and mechanical nits.**
  "SHOTTKY" → "Schottky" (`24p_v1_overview.md` §3); the "Long term overvoltage" admonition body
  is tab-indented (same file, lines 57–59) — normalize to 4 spaces; "This sub-sections in this
  guide" (`setup/index.md` intro); the Holset intro sentence ("It works because the B230F's
  forged crank and stout block tolerate mild boost, Holsets are cheap…") is a run-on; image
  filenames misspell "motorsteurgerat" (cosmetic — renaming breaks nothing but touches two pages).

- [ ] **17. Hardware Reference appendix cleanup.**
  `reference.md`: the Technical Appendix double-numbers itself ("### 9.1. A.1. Thermal Analysis")
  — pick one scheme; §A.2.2 ends abruptly after the discrete-MOSFET failure mode (the smart-driver
  half of the comparison is missing); in-page references to "§A.1", "§A.3" are plain text — make
  them links; verify `interactive_heat.html` renders correctly on the deployed site (fixed 650 px
  iframe, dark-theme fit).

- [ ] **18. Publish at least the documentation license.**
  `about/license.md` is honest about the interim "all rights reserved" position, but it sits
  awkwardly next to the "Truly Open-Source" core value on the philosophy page. Settling the docs
  license (the design-files license can wait for the design-file release) removes the tension.

- [ ] **19. Theme/UX niceties.**
  Consider a light/dark palette toggle (site is dark-only); once `repo_url` exists (P0 §2),
  Material's edit-this-page icons come nearly free and reinforce the contribution loop.

---

## Page-by-page notes

| Page | Verdict | Notes |
|---|---|---|
| `index.md` (home) | Needs work | Routes poorly for alpha — see P1 §13 |
| `24p_v1_overview.md` | Strong | Best-in-class pinout tables; TBC specs → P0 §5; typo → P2 §16 |
| `wiring.md` | Strong | §4.3 sequential routing is excellent, unique content; needs Q3/Q4 locations (P0 §3) |
| `reference.md` | Strong | Great rationale writing; appendix cleanup → P2 §17 |
| `setup/index.md` | Good | Firmware target hedge is the #1 blocker (P0 §1) |
| `setup/flashing.md` | Good | Needs boot-switch/USB locations (P0 §3) |
| `setup/rusefi.md`, `setup/speeduino.md` | Good structure | "If a profile exists" must be resolved (P0 §1); verify on hardware (P1 §10) |
| `setup/calibration.md` | Very good | Dead-time explanation and fuse-pulled output tests are exactly right |
| `guides/setup/planning.md` | Very good | Strong opener for the funnel; honest about Schildknappe |
| `guides/tuning/basics.md`, `software.md` | Good | Safe, correct fundamentals; verify on hardware (P1 §10) |
| `guides/setup/canbus-basics.md` | Good | Depends on the TBC onboard-termination answer (P0 §5) |
| `guides/setup/troubleshooting.md` | Very good | Stage-organized symptom tables; will grow well from alpha feedback |
| `guides/workshop/*` (injector, pump testing) | Very good | Practical, safety-first, correct formulas |
| `guides/setup/specific/volvo-b2xx.md` | Excellent | The flagship guide; deep, specific, opinionated in a useful way |
| `b230-examples/*` | Good | Honest draft labeling; Holset page has the site's one broken link (P1 §7) |
| `vw-1.8t.md`, `renault-f4r.md`, `peugeot-tu.md`, `mini-a-series.md` | Adequate drafts | Thinner than Volvo but honest about it; fine for alpha as-is |
| `guides/conversions/ms-to-24p.md` | Good | Correctly kills the "import my tune" assumption |
| `products/schildknappe/index.md` | Good | Right way to document vaporware; empty sibling files → P1 §12 |
| `tools/index.md` | Good | Harness Bench docs are clear (tool itself not reviewed in depth) |
| `about/*` | Good | Community page needs issue links (P0 §2) and the third badge (P1 §9) |
| `test.md` | Delete | P0 §4 |

---

*Note: `.cursor/alpha-review-temp.md` (containing only "temporary") looks like a placeholder for
this review; this file supersedes it and the placeholder can be deleted.*
