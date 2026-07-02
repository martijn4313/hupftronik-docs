# Peugeot TU Series
<div class="content-status status-ai-draft" title="AI-drafted from general engineering knowledge this session — verify against your specific hardware, engine code, or factory documentation before relying on it. See About > Open-Source &amp; Community for what this means.">AI-drafted — verify before use</div>

The Peugeot/Citroën TU series (TU1/TU3/TU5, 1.1–1.6L inline-fours found across the 106, 206, 306,
Saxo, and shared PSA platforms) covers a wide spread of engine management hardware across its
production run, from early single-point carburetor-replacement injection through later
distributorless multi-point systems. This page assumes a later, distributorless TU5-family engine —
check which generation you have before assuming these details apply.

!!! note "Generation matters more here than on most engines in this list"
    Unlike the Volvo B2xx or VW 1.8T, the TU series spans everything from throttle-body injection
    with a distributor to fully sequential multi-point injection with coil-on-plug ignition.
    Identify your exact engine code and injection system (check the factory workshop manual or ECU
    part number) before wiring anything — the guidance below is for the later distributorless,
    sequential-capable variants (e.g. TU5JP4 as fitted to later 106/206 GTI models).

---

## 1. Engine position sensor

### 1.1. Quick Scan

| Path | Target | Sensor | rusEFI Type | Hardware Effort |
|---|---|---|---|---|
| Later distributorless TU5 | 60-2 flywheel wheel | VR (Passive) | `60/2` | Plug & play |
| Earlier TU with distributor | Distributor pickup | Varies — verify | `Basic Distributor` or fabricate | Verify hardware first |

### 1.2. Technical Detail

Later distributorless TU5 variants use a 60-2 reluctor wheel on the flywheel, read by a passive VR
sensor — wire directly to `VR_POS`/`VR_NEG`, same as the [Volvo B2xx](volvo-b2xx.md#3-engine-position-sensor)
late-B230 case. If your engine predates this (still running a distributor), treat it like the Volvo
guide's [distributor contact](volvo-b2xx.md#324-distributor-contacts) case: you'll need signal
conditioning for the trigger and will need to lock any mechanical advance if you want the ECU
controlling timing.

A cam position sensor is present on sequential-injection variants; retaining it enables sequential
fueling in the same way described for the [VW 1.8T](vw-1.8t.md#1-engine-position-sensor). Confirm
whether your specific engine has one before planning around it.

---

## 2. Air charge sensing

Later TU5 variants typically run speed-density from a MAP and IAT sensor rather than a MAF — follow
[Planning your build §2](../planning.md#2-intake) the same as any other speed-density build. If your
engine has a factory MAF, disconnect it; the 24P V1 does not use it.

## 3. Ignition

Confirm your specific engine's ignition architecture before wiring: later sequential-injection
TU5 variants commonly use coil-on-plug or paired coil-on-plug ignition (verify against your factory
wiring diagram), while earlier distributorless-but-batch-fire variants may use a single wasted-spark
coil pack with an external igniter, the same architecture as the
[Volvo B2xx wasted-spark setup](volvo-b2xx.md#82-technical-detail). Do not assume either
architecture without checking your engine code.

## 4. rusEFI configuration

Key values to verify before the first start:

| Parameter | Value |
|---|---|
| Cylinder count | 4 |
| Injection mode | Sequential (if cam sensor present) or batch — verify for your engine code |
| Ignition mode | Verify — coil-on-plug or wasted spark differ by variant |
| Trigger type | `60/2` for distributorless variants; verify for earlier engines |
| Trigger offset | Set via timing light or a known-good reference after first start |

---

## 5. Known issues

- **Trigger and ignition architecture differ significantly across the TU series** — this is the
  single most important thing to verify before starting, more so than on the other engines in this
  list.
- Early throttle-body-injection or distributor-based TU variants need the same kind of trigger
  fabrication and distributor-locking work described for the
  [Volvo B21/B23](volvo-b2xx.md#323-b21-and-b23) — plan hardware effort accordingly.

---

## Next steps

Wire the harness per [Wiring and hardware guide](../../../products/motorsteuergerat-24p-v1/wiring.md),
then follow [Setup and Commissioning](../../../products/motorsteuergerat-24p-v1/setup/index.md) to
flash and bring the board online. For tuning, see [Tuning Basics](../../tuning/basics.md). If the
engine won't start or run cleanly, see [Troubleshooting](../troubleshooting.md).
