# Basic B230F with an Alternative OEM Camshaft
--8<-- "status-ai-draft.md"

This is the mildest example build: a stock, healthy LH2.4 B230F converted to the Motorsteuergerät
24P V1, with exactly one mechanical change — a different camshaft from Volvo's own OEM range. It
exists because the standalone ECU removes the factory system's tuning limits, and a sharper OEM cam
is the cheapest way to give the ECU something to work with. The result is a modest but honest gain
in mid-range and top-end response for the price of a used camshaft and a gasket set.

Everything not mentioned here follows the [Volvo B2xx Redblock guide](../volvo-b2xx.md): 60-2
trigger, wasted spark, batch injection, T-MAP speed-density.

---

## 1. Build goal

| Aspect | Target |
|--------|--------|
| Power | Stock $\sim 114\,\text{hp}$ → roughly $120$–$130\,\text{hp}$ |
| Character | Stock drivability, noticeably keener above $3500\,\text{RPM}$ |
| Compression | Stock ($\sim 9.8:1$) |
| Fuel | 95 RON |
| Budget items | Used OEM cam, timing belt kit, valve cover gasket, shims as needed |

## 2. Choosing the camshaft

Volvo stamped a letter code between the lobes of every redblock cam. The grinds most often
discussed as upgrades for an injected 8v engine:

| Cam code | Origin | Character (community consensus — verify) |
|----------|--------|-------------------------------------------|
| `VX` | B230FB/FX, 940 from ~1993 | The popular pick — more lift than the stock NA cams, keeps idle and low-end manners |
| `T` | B230FT turbo engines | Mild, torque-biased; a small step on an NA engine |
| `A` | Early B21A carbureted engines | The hottest common OEM grind; livelier top end, slightly busier idle |

!!! warning "Draft values — verify the cam in hand"
    Grind specs for thirty-year-old OEM cams vary between sources, and worn lobes make the stamped
    letter meaningless. Inspect the lobes for scoring and measure lift before installing anything.
    This page has not been verified against a running engine.

The `VX` cam is the conventional recommendation for this build: a real improvement over the stock
B230F grind without giving up idle quality — which matters, because this build keeps the stock
idle-air hardware.

## 3. Engine work

1. Replace the timing belt and tensioner while the front of the engine is open — never re-use an
   old belt after cam work.
2. Check valve clearances after the swap. The redblock uses shim-adjusted bucket tappets; a
   different cam usually means re-shimming at least a couple of valves.
3. Lubricate the lobes with cam assembly paste and follow a flat-tappet break-in: immediately after
   first start, hold $\sim 2000\,\text{RPM}$ for 15–20 minutes, no idling.

## 4. ECU configuration

Start from the base configuration in [Volvo B2xx §9](../volvo-b2xx.md#9-rusefi-configuration).
Deltas for this build:

| Parameter | Value / change |
|-----------|----------------|
| Injectors | Stock LH2.4 `0 280 150 762`, $214\,\text{cc/min}$ — ample for this power level |
| Fuel pump | Stock — no change |
| Rev limit | $6200\,\text{RPM}$ (stock valvetrain, healthy springs assumed) |
| VE table | Expect the peak-VE region to move up ~$300$–$500\,\text{RPM}$ vs. a stock-cam map |
| Idle | Slightly higher target idle ($\sim 900\,\text{RPM}$) helps with the `A` cam; `VX` idles at stock speed |

## 5. Tuning notes

* Tune the VE table normally per [Tuning Basics](../../../tuning/basics.md) — the cam simply
  reshapes it; nothing special is required.
* With a slightly hotter cam, manifold vacuum at idle drops a little. If idle MAP readings look
  higher (less vacuum) than a stock engine's, that is the cam, not a leak — but rule out leaks
  first.
* Acceleration enrichment usually needs little change at this level.

## 6. Expected outcome

A stock-feeling engine that breathes better in the upper half of the rev range. Do not expect
transformation — expect the engine the factory would have built without emissions-era caution.
This build's real value is as a low-risk first conversion: every part of the ECU installation is
proven on a nearly stock engine before you attempt anything more ambitious.

---

## Next steps

Wire and commission per the [Volvo B2xx guide §11](../volvo-b2xx.md#11-next-steps). If the injectors
are of unknown history, verify them first —
[Injector Flow Rate Testing](../../../workshop/injector-flow-testing.md). Ready for more? The next
step up is [raised compression and a mild aftermarket cam](b230f-higher-compression.md).
