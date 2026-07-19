# Mini A-Series
--8<-- "status-ai-draft.md"

The BMC/Rover A-Series (848cc–1275cc pushrod inline-four, fitted to the classic Mini from 1959
through 2000) predates electronic fuel injection almost entirely — most examples left the factory
carbureted, with no crank trigger wheel, no injectors, and no ECU-relevant sensors at all. This page
covers converting a carbureted A-Series to standalone EFI, which is a different scope of work than
the other engines in this list: you're adding an entire trigger and injection system to an engine
that was never designed for one, not adapting an existing factory setup.

!!! note "This is a full EFI retrofit, not an adaptation"
    Unlike the [Volvo B2xx](volvo-b2xx.md) or [VW 1.8T](vw-1.8t.md), there is no factory wiring
    diagram to reference and no OEM trigger wheel to reuse. Budget significantly more fabrication
    time than for a factory-EFI engine swap. A small number of late A-series Minis (roughly
    1996–2000) left the factory with single-point injection and a factory ECU — if you have one of
    these, treat it as a partial donor for connectors and sensor locations, but still expect to
    replace the trigger and injection hardware to match this board's requirements.

---

## 1. Engine position sensor

### 1.1. Quick Scan

| Path | Target | Sensor | rusEFI Type | Hardware Effort |
|---|---|---|---|---|
| Fabricated crank trigger | Custom wheel on crank pulley/flywheel | VR (Passive) | `60/2` (recommended) | Fabricate |
| Distributor contacts (fallback) | 4 pulses / 2 revs | Contact | `Basic Distributor` | Lock advance weights |

### 1.2. Technical Detail

There is no factory trigger wheel to reuse. The most robust path is the same one described for the
[Volvo B21/B23](volvo-b2xx.md#323-b21-and-b23): press or key a 60-2 toothed wheel onto the crank
pulley or flywheel, and mount a VR pickup in a fabricated, rigid bracket. Target a sensor air gap of
$0.5$–$1.0\,\text{mm}$, and verify the bracket doesn't flex under engine vibration — a loose bracket
reads as an erratic trigger signal, which is far harder to diagnose than a fabrication problem caught
before first start.

If you want to avoid trigger fabrication entirely, the A-Series' distributor can serve as a trigger
source the same way described for the
[Volvo distributor-contact fallback](volvo-b2xx.md#324-distributor-contacts): you'll need
signal-conditioning circuitry between the points and the ECU, and you must lock the mechanical
advance weights solid, since the ECU — not the distributor — now controls timing.

!!! warning "Locking the distributor is irreversible"
    As with any distributor-lock conversion, do this with the distributor removed from the engine and
    the battery disconnected. Confirm you're committing to ECU-controlled timing before you weld or
    pin the advance mechanism.

### 1.3. Design Rationale

A fabricated crank-mounted trigger wheel gives far better timing resolution than the distributor's 4
pulses per two revolutions, which matters more on a high-compression or performance-built A-Series
than it would on a mild, stock-power engine — the same trade-off discussed for the
[Volvo B21/B23 case](volvo-b2xx.md#33-design-rationale).

---

## 2. Fueling and ignition

The A-Series has no factory injectors, fuel rail, or ignition coil suited to ECU control — this is
new hardware, not a wiring adaptation. Work through
[Planning your build](../planning.md) in full before sourcing parts: injector sizing depends on your
target power level and displacement, and ignition hardware (coil and igniter, or a wasted-spark pack
if you're running a twin-outlet head) needs to be selected for the engine you're actually building,
not copied from another engine's parts list.

---

## 3. rusEFI configuration

Key values to verify before the first start:

| Parameter | Value |
|---|---|
| Cylinder count | 4 |
| Injection mode | Batch (most common starting point for a from-scratch conversion) |
| Ignition mode | Wasted spark, or single coil/igniter if retaining a distributor-driven trigger |
| Trigger type | `60/2` (fabricated wheel) or `Basic Distributor` (contact fallback) |
| Trigger offset | Set via timing light after first start |

---

## 4. Known issues

- **No factory reference exists** — every dimension, bracket, and wiring run is bespoke to your
  build. Budget fabrication time accordingly, and design brackets and mounts up front rather
  than improvising under time pressure.
- **Distributor-based triggering caps timing resolution** at 4 pulses per two revolutions — acceptable
  for a mild build, a real limitation for anything performance-oriented.

---

## 5. Next steps

Once fueling and ignition hardware are selected, wire the harness per
[Wiring and hardware guide](../../../products/motorsteuergerat-24p-v1/wiring.md), then follow
[Setup and Commissioning](../../../products/motorsteuergerat-24p-v1/setup/index.md) to flash and bring
the board online. For tuning, see [Tuning Basics](../../tuning/basics.md). If the engine won't start or
run cleanly, see [Troubleshooting](../troubleshooting.md).
