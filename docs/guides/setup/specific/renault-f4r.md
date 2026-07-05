# Renault F4R
--8<-- "status-ai-draft.md"

The Renault F4R (2.0L 16v inline-four, used across the Mégane, Scénic, Laguna, and the Clio Sport
variants) is a common standalone-ECU swap in the hot-hatch scene, largely because the Clio
182/197/200 versions are already tuned aggressively from the factory and respond well to further
work. This page assumes you're moving from the factory ECU to the Motorsteuergerät 24P V1.

!!! note "Variant matters"
    F4R covers naturally-aspirated and high-output variants (the Clio Sport engines in particular)
    across multiple generations, with real differences in trigger wheel and ignition hardware.
    Confirm your specific variant against your factory wiring diagram before assuming the details
    below apply unmodified.

---

## 1. Engine position sensor

### 1.1. Quick Scan

| Path | Target | Sensor | rusEFI Type | Hardware Effort |
|---|---|---|---|---|
| Factory crank sensor | 60-2 flywheel/pulley wheel | VR (Passive) | `60/2` | Plug & play |
| Factory cam sensor | Hall on intake cam | Hall (Active, 3-wire) | Cam sync input | Plug & play |

### 1.2. Technical Detail

Like most modern Renault engines, the F4R uses a 60-2 reluctor wheel read by a passive VR sensor —
wire directly to `VR_POS`/`VR_NEG`. A Hall-effect cam sensor is present for sequential injection
timing; as with the [VW 1.8T](vw-1.8t.md#1-engine-position-sensor), retaining it is worthwhile if
your firmware and wiring budget support the extra input, since it unlocks sequential fueling rather
than forcing batch fire. Wire its signal to a spare digital input (`SPARE_IN1`/`SPARE_IN2`) and
assign it as the cam input in firmware. Ignition remains wasted spark regardless — the board's two
ignition outputs cannot drive four coils individually (see [§3](#3-ignition)).

--8<-- "hall-sensor-polarity-warning.md"

### 1.3. Design Rationale

The same reasoning as the VW 1.8T applies: retaining the cam sensor costs one input but buys
sequential fueling capability that's particularly valuable on a high-output variant like the
Clio Sport engines. It does not buy sequential ignition — that would need four ignition outputs, and
the board has two.

---

## 2. Air charge sensing

F4R is naturally aspirated in most road-car applications, so a simple MAP-and-IAT speed-density setup
is the default — see [Planning your build §2](../planning.md#2-intake). If your build adds forced
induction, size the MAP sensor to your target boost with margin, following the same logic as
[Volvo B2xx §6](volvo-b2xx.md#6-air-charge-sensing).

---

## 3. Ignition

Later F4R variants use individual coil-on-plug ignition, each coil integrating its own power
stage — wire the $+5\,\text{V}$ logic-level trigger from the 24P V1 directly to the coils, and
confirm trigger polarity against the coil's datasheet before connecting. The board has **two
ignition outputs** (`IGN1`/`IGN2`), so drive the four coils in wasted-spark pairs: `IGN1` for
cylinders 1 and 4, `IGN2` for cylinders 2 and 3. Fully sequential per-cylinder ignition is not
possible on this hardware. Earlier or lower
trim variants may use paired coils (wasted spark) from the factory instead — verify which
architecture your specific car has before wiring.

---

## 4. rusEFI configuration

Key values to verify before the first start:

| Parameter | Value |
|---|---|
| Cylinder count | 4 |
| Injection mode | Sequential (if cam sensor retained — needs [output repurposing](../../../products/motorsteuergerat-24p-v1/wiring.md#43-4-channel-sequential-injection-routing)) or batch |
| Ignition mode | Wasted spark — coils paired 1+4 / 2+3 on `IGN1`/`IGN2` |
| Trigger type | `60/2` + cam sync |
| Trigger offset | Set via timing light or a known-good reference after first start |

---

## 5. Known issues

- **Coil architecture (individual vs. paired) varies by variant and model year** — confirm before
  wiring the ignition outputs.
- **Trigger tooth count and cam sync pattern should be verified against your specific factory wiring
  diagram**, as with any engine in this family.

---

## 6. Next steps

--8<-- "products/motorsteuergerat-24p-v1/vehicle-guide-next-steps.md"
