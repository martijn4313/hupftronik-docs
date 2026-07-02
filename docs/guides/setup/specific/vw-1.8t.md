# Volkswagen 1.8T
<div class="content-status status-ai-draft" title="AI-drafted from general engineering knowledge this session — verify against your specific hardware, engine code, or factory documentation before relying on it. See About > Open-Source &amp; Community for what this means.">AI-drafted — verify before use</div>

The VW/Audi 1.8T (EA827-based, 20-valve turbo four-cylinder, common engine codes AEB/APU/AWP/AWU
and others across the Mk4 Golf/Jetta, B5 Passat, and Audi A4/A3 platforms) is one of the
best-documented turbo four-cylinders in the standalone ECU community — factory coil-on-plug
ignition and a clean 60-2 trigger setup make it a straightforward sequential-injection swap. This
page assumes you're moving from the factory Motronic ECU to the Motorsteuergerät 24P V1.

!!! note "Engine code matters"
    "1.8T" covers many engine codes across a decade of production with real differences in trigger
    wheel, cam sensor, and injector sizing. Confirm your specific engine code's trigger tooth count
    and connector pinouts against your factory wiring diagram before assuming the details below
    apply unmodified.

---

## 1. Engine position sensor

### 1.1. Quick Scan

| Path | Target | Sensor | rusEFI Type | Hardware Effort |
|---|---|---|---|---|
| Factory crank sensor | 60-2 flywheel/pulley wheel | VR (Passive) | `60/2` | Plug & play |
| Factory cam sensor | Single-tooth on intake cam | Hall (Active, 3-wire) | Cam sync input | Plug & play |

### 1.2. Technical Detail

The 1.8T uses a 60-2 toothed wheel on the crank pulley read by a passive VR sensor — wire this
directly to `VR_POS`/`VR_NEG` the same as any other 60-2 setup. Unlike the Volvo B2xx (batch fire,
no cam sync — see [Volvo B2xx §4](volvo-b2xx.md#4-camshaft-position-sensor)), the 1.8T's factory Hall
cam sensor is worth retaining: it enables fully sequential injection and individual-cylinder ignition
timing, which the factory coil-on-plug hardware is already wired for. A Hall sensor needs a switched
+5V or +12V supply (check your sensor's datasheet — Hall sensors, unlike VR sensors, are powered and
polarity-sensitive) in addition to signal and ground.

!!! warning "Hall sensors are polarity-sensitive"
    Unlike the passive VR crank sensor, the Hall cam sensor has a supply, ground, and signal pin that
    must be wired correctly — reversing supply and ground can damage the sensor. Verify pinout against
    your factory wiring diagram before connecting power.

### 1.3. Design Rationale

Retaining the factory cam sensor costs one spare input pin but unlocks sequential injection and
per-cylinder ignition timing — both already meaningful for a turbocharged engine's knock margin and
part-throttle drivability, which is why we recommend keeping it rather than running batch/wasted
spark as a simplification.

---

## 2. Air charge sensing

The factory MAF (Mass Air Flow) sensor is a restriction the standalone install is a good opportunity
to remove — same reasoning as [Volvo B2xx §6](volvo-b2xx.md#6-air-charge-sensing). Run
speed-density from a MAP sensor sized for your boost target and an IAT sensor positioned after the
intercooler, disconnect the factory MAF, and don't attempt to read it.

## 3. Ignition

Factory coil-on-plug ("pencil coil") ignition needs no external igniter — each coil has its own
integrated power stage triggered by a $+5\,\text{V}$ logic-level signal, matching the 24P V1's
`IGN1`/`IGN2` outputs directly for a 2-channel wasted-spark fallback, or all four coils individually
if you're running the full sequential setup enabled by the retained cam sensor. Confirm your coils'
trigger voltage and polarity against their datasheet — some coil-on-plug designs invert the trigger
logic relative to a simple wasted-spark igniter.

## 4. Boost control

The factory N75-family boost control solenoid switches manifold vacuum to the wastegate actuator and
wires directly to `BOOST_DRV` the same way any other solenoid does — see
[Wiring and hardware guide §4](../../../products/motorsteuergerat-24p-v1/wiring.md#4-configurations)
for driver output limits before wiring it in.

## 5. rusEFI configuration

Key values to verify before the first start:

| Parameter | Value |
|---|---|
| Cylinder count | 4 |
| Injection mode | Sequential (if cam sensor retained) or batch |
| Ignition mode | Coil-on-plug, sequential or wasted spark |
| Trigger type | `60/2` + cam sync |
| Trigger offset | Set via timing light or a known-good reference after first start |

---

## 6. Known issues

- **Trigger tooth count varies by exact engine code and model year** — verify against your specific
  factory wiring diagram rather than assuming every 1.8T uses the same reluctor wheel.
- **Coil-on-plug trigger polarity varies by coil design** — confirm before wiring all four
  individually.

---

## Next steps

Wire the harness per [Wiring and hardware guide](../../../products/motorsteuergerat-24p-v1/wiring.md),
then follow [Setup and Commissioning](../../../products/motorsteuergerat-24p-v1/setup/index.md) to
flash and bring the board online. For tuning, see [Tuning Basics](../../tuning/basics.md). If the
engine won't start or run cleanly, see [Troubleshooting](../troubleshooting.md).
