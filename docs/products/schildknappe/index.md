# Schildknappe (CAN Node)
<div class="tooltip" title="In development: hardware design is not finalized and no boards have been produced yet.">Current status: In development</div>
--8<-- "status-ai-draft.md"

---

## 1. What it will be

The Schildknappe ("squire" — the Motorsteuergerät's companion) is a planned **CAN expansion node**:
a small board that sits elsewhere in the vehicle and offloads extra sensors and outputs onto the
CAN bus, for builds that outgrow the
[Motorsteuergerät 24P V1's onboard I/O](../motorsteuergerat-24p-v1/24p_v1_overview.md#3-io-overview).

Typical intended uses:

- Absorbing I/O overflow when a build needs a full sensor suite plus extra actuators — see the
  I/O-budget note in [Planning your build](../../guides/setup/planning.md).
- Placing inputs physically close to what they measure (e.g. rear-of-car sensors) instead of running
  long analog signal wires through the harness.

---

## 2. Current status

The Schildknappe is **in development** — no hardware has been produced and no specifications are
final. This page exists so builders planning around a future expansion node know the product is
real but not yet available. Detailed documentation (specifications, wiring, firmware setup,
standalone operation, hardware reference) will appear here as the design matures.

!!! note "Don't plan a build around unreleased hardware"
    If your build exceeds the 24P V1's onboard I/O *today*, treat that as a real constraint —
    reduce the sensor/actuator count or handle the overflow with independent wiring — rather than
    waiting on this product. Check back or watch the repository for updates.

---

## 3. Next steps

Head back to the [Motorsteuergerät 24P V1 overview](../motorsteuergerat-24p-v1/24p_v1_overview.md),
or work through [Planning your build](../../guides/setup/planning.md) to see whether your build fits
the onboard I/O in the first place.
