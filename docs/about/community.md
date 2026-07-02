# Open-Source & Community
<div class="content-status status-ai-draft" title="AI-drafted from general engineering knowledge this session — verify against your specific hardware, engine code, or factory documentation before relying on it. See About > Open-Source &amp; Community for what this means.">AI-drafted — verify before use</div>

This page explains what "open-source" means in practice for Hüpftronik, and how to get help or
contribute back. Read this if you're stuck on a build, want to report a documentation gap, or want
to help other builders.

---

## 1. What "open-source" covers here

Hüpftronik firmware runs on [rusEFI](https://github.com/rusefi/rusefi) or
[Speeduino](https://github.com/noisymime/speeduino) — both established, independently-maintained
open-source ECU firmware projects with their own communities, documentation, and support channels.
Hüpftronik's own contribution is the hardware platform and this documentation. See
[License & Disclaimer](license.md) for the exact terms covering each part.

## 2. Where to get help

**Firmware and tuning questions** (trigger setup, fuel/ignition tables, TunerStudio) belong with the
upstream firmware project's own community — rusEFI and Speeduino each have active forums and chat
communities set up specifically for this, and their maintainers know their firmware far better than
a hardware-focused site can document.

**Hardware and wiring questions specific to the Motorsteuergerät or Schildknappe** (pinouts,
connectors, driver limits) are Hüpftronik-specific — check
[Troubleshooting](../guides/setup/troubleshooting.md) first, then raise anything undocumented as an
issue against this documentation repository so the answer ends up here for the next builder.

## 3. Reporting a documentation problem

If you find a broken link, an inaccurate spec, or a step that didn't work as written, open an issue
against the documentation repository (this site's source) describing what page, what you expected,
and what actually happened. Documentation fixes are one of the highest-value contributions a builder
can make — the person who just struggled through a page is often best placed to fix it for the next
person.

## 4. Who this project is for

The DIY standalone-ECU community extends well beyond hobbyists — it includes professional tuners,
installation technicians, restoration shops, and the smaller but active scene retromodding classic
motorcycles with modern fuel injection. See [Our Philosophy](philosophy.md#2-community-and-ecosystem)
for why Hüpftronik considers all of these part of the same community, including builders who never
touch a soldering iron themselves.

## 5. Content status labels

Most pages on this site carry a small badge next to the title, next to (or instead of) the product
status badge. It tells you how much scrutiny the page's technical content has had — read it before
you trust a page's specifics with your engine:

- <span class="content-status status-reviewed" style="display:inline-flex;">Reviewed</span> — the
  content has been checked for internal consistency, cross-references, and (where applicable) the
  underlying math. It has **not** been tested on physical hardware — that verification is still
  yours to do, the same as with any documentation.
- <span class="content-status status-ai-draft" style="display:inline-flex;">AI-drafted — verify
  before use</span> — written from general engineering knowledge, not checked against a specific
  car's factory documentation or bench-tested. Treat exact part numbers, trigger patterns, and
  wiring specifics on these pages as a starting point to verify, not a confirmed fact — the page
  itself usually says where the biggest verification risk is (e.g. "confirm against your engine
  code").

Pages without either badge (like [Our Philosophy](philosophy.md) or the homepage) don't carry
technical claims that need this kind of status in the first place.

If you verify a page against your own hardware and it holds up — or if you find it doesn't — report
it per [§3](#3-reporting-a-documentation-problem) so the badge can be corrected for the next reader.

---

## Next steps

Start with [Planning your build](../guides/setup/planning.md), or head to the
[product overview](../products/motorsteuergerat-24p-v1/24p_v1_overview.md) if you already know
which hardware you're using.
