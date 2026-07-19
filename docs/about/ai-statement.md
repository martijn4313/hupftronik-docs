# Our Use of AI
--8<-- "status-ai-draft.md"

This page explains how AI tools are used to write and maintain this documentation, what they are
never trusted with, and how you can tell — on any page — how much human scrutiny its content has
had. Read it once and the badges across the site will tell you the rest.

(Yes, this page carries the *AI-drafted* badge itself. That is the system working as intended.)

---

## 1. How AI fits into the writing process

Hüpftronik is a small project with a large documentation surface: one hardware platform touches
wiring, firmware, sensors, tuning, and a growing list of engine-specific guides. We use AI
assistants to draft pages, keep cross-references consistent, and turn engineering notes into
readable prose — the same way a small team might use a technical writer.

What AI drafts, a human directs: the page structure, the design decisions being documented, and
the judgment about what a builder actually needs on each page come from the people who designed
the hardware.

---

## 2. What we don't let AI decide

- **Hardware facts.** Pin assignments, component values, current limits, and measurements come
  from the schematic, the datasheets, or the bench — never from an AI's general knowledge. Where a
  value has not been confirmed against real hardware, the page says *to be confirmed* instead of
  guessing.
- **Safety guidance.** Warnings about irreversible or dangerous steps are reviewed by a human
  before a page is marked *Reviewed*.
- **Claims about what works.** Feature status is stated honestly. Anything experimental, untested,
  or planned is labeled as such — an AI draft never gets to imply that something works when it
  hasn't been verified.

---

## 3. How to read the content-status badges

Most pages carry a badge under the title telling you how much scrutiny the content has had —
**Reviewed**, **In Review**, or **AI-drafted — verify before use**. The full definitions live in
[Open-Source & Community §5](community.md#5-content-status-labels); the short version is: treat an
*AI-drafted* page's part numbers, trigger patterns, and wiring specifics as a starting point to
verify against your own hardware, not as confirmed fact.

If you verify an AI-drafted page against a real engine — whether it holds up or not — please
[report it](community.md#3-reporting-a-documentation-problem). That feedback is what moves a page
from *AI-drafted* to *Reviewed*, and it is one of the most valuable contributions a builder can
make.

---

## 4. Next steps

See [Open-Source & Community](community.md) for how to report problems and contribute, or
[License & Disclaimer](license.md) for the terms that apply to everything on this site.
