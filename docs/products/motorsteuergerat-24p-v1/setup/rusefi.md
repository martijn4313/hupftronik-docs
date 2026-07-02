# rusEFI Setup Guide for Motorsteuergerät 24P V1
<div class="content-status status-ai-draft" title="AI-drafted from general engineering knowledge this session — verify against your specific hardware, engine code, or factory documentation before relying on it. See About > Open-Source &amp; Community for what this means.">AI-drafted — verify before use</div>

This guide walks through first-time rusEFI configuration on a freshly-flashed Motorsteuergerät 24P
V1 — telling the firmware which pin does what, so the generic rusEFI image becomes a config specific
to your board and engine. Do this once, right after
[flashing](flashing.md) and before you crank the engine. It assumes you've already read
[Setup and Commissioning §3](index.md#3-firmware-architecture-choosing-your-path) and chosen rusEFI
deliberately.

---

## 1. Prerequisites

- A flashed board (see [Flashing the PCB](flashing.md)).
- TunerStudio installed and connected — see [Software Tools §2](../../../guides/tuning/software.md#2-connecting-to-the-board).
- Your engine's decisions from [Planning your build](../../../guides/setup/planning.md) settled
  (injector count/impedance, throttle type, sensor selection) — you'll be entering these as
  configuration values, not deciding them for the first time here.
- Vehicle-specific notes, if your engine has one: see the
  [vehicle-specific guides](../../../guides/setup/planning.md) for known-good starting configs.

## 2. Pin mapping

rusEFI's board configuration maps every logical function (injector 1, ignition 1, IAT sensor, …) to
a physical MCU pin. On the Motorsteuergerät 24P V1 these map directly to the connector pins in the
[IO Overview](../24p_v1_overview.md#3-io-overview) — you're confirming the mapping matches the
silkscreen/connector labels, not choosing arbitrary pins:

| Function | Board signal |
|---|---|
| Injector 1 / 2 | `INJ1_DRV` / `INJ2_DRV` |
| Ignition 1 / 2 | `IGN1_OUT` / `IGN2_OUT` |
| Crank/cam trigger | `VR_POS` / `VR_NEG` |
| MAP / TPS / CLT / IAT | `MAP_RAW` / `TPS_RAW` / `CLT_RAW` / `IAT_RAW` |
| O₂ sensor | `LAMBDA_RAW` |
| Idle air control | `IAC_DRV` |
| Boost solenoid | `BOOST_DRV` |
| Fuel pump / fan relay | `FPRELAY_DRV` / `FANRELAY_DRV` |

If a board-specific rusEFI configuration profile for the 24P V1 exists in the firmware repository,
select it and this mapping is already done for you — confirm it against the table above rather than
re-entering it by hand.

## 3. Engine basics

Configure, in order, since later steps depend on earlier ones:

1. **Cylinder count and firing order.** Wrong here invalidates every other setting.
2. **Trigger type**, matching your crank/cam wheel — see your engine's setup guide (for example,
   [Volvo B2xx §3](../../../guides/setup/specific/volvo-b2xx.md#3-engine-position-sensor) for a
   worked `60/2` example) — and confirm sync with the triggerscope before proceeding (see
   [Software Tools §3](../../../guides/tuning/software.md#3-panels-youll-use-most)).
3. **Injection mode** (batch, bank, or sequential) and channel assignment — see
   [Wiring and hardware guide §4](../wiring.md#4-configurations) for how your chosen mode maps to
   `INJ1`/`INJ2` and any repurposed channels.
4. **Ignition mode** (wasted spark or sequential) and channel assignment.
5. **Injector characteristics** — flow rate and dead time, from your injector's datasheet or the
   values in your engine's setup guide.

## 4. Sensor calibration

Set the calibration curve for each analog input (IAT, CLT, MAP, TPS, O₂) to match the actual sensor
you wired — using a generic default curve for a sensor with different characteristics produces
believable-looking but wrong readings. Calibrate TPS against its own physical limits (closed and
wide-open throttle), not a textbook value — see
[Volvo B2xx §5.2](../../../guides/setup/specific/volvo-b2xx.md#52-technical-detail) for a worked
example.

## 5. Auxiliary outputs

Configure the idle air control, boost control, fuel pump, and fan outputs against the physical loads
you wired to `IAC_DRV`, `BOOST_DRV`, `FPRELAY_DRV`, and `FANRELAY_DRV` — confirm each against
[Wiring and hardware guide](../wiring.md) if you used a non-default channel assignment (for example,
a repurposed channel from a sequential injection configuration).

## 6. First start

Load a base fuel and ignition map appropriate for your engine (see
[Tuning Basics §3](../../../guides/tuning/basics.md#3-building-a-base-map)) before the first crank.
Do not attempt to start the engine on an unconfigured or default map.

---

## Next steps

Continue to [Tuning Basics](../../../guides/tuning/basics.md) for the tuning process itself. If the
engine won't sync, start, or run cleanly, see
[Troubleshooting](../../../guides/setup/troubleshooting.md).
