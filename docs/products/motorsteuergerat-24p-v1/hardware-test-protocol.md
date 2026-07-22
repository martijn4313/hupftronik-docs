# Practical Hardware Checks
--8<-- "status-ai-draft.md"

---

This page is a practical checklist for bringing up a Motorsteuergerät 24P V1 board. It is not a
formal qualification or certification process. Use the checks that match your equipment and
experience, and share anything unusual with the project.

Alpha testers are not expected to own an oscilloscope, CAN adapter, trigger generator, or a full
set of test loads. A careful visual inspection, current-limited first power-up, and basic
input/output checks provide useful feedback.

---

## 1. Safety essentials

!!! danger "Bench safety"
    - Use a fused, current-limited bench supply for first power-up.
    - Never exceed 18 V. Sustained voltage near or above 20 V can destroy the TVS protection.
    - Injectors, relays, and solenoids produce a voltage spike when switched off. Do not disconnect
      an energized inductive load by pulling a wire.
    - The ignition outputs are logic-level triggers. Never connect a coil primary directly.
    - Disconnect power before changing wiring.

See the [IO Overview](24p_v1_overview.md#3-io-overview) for pin assignments and design limits.

---

## 2. Recommended checks

### 2.1. Inspect the unpowered board

- Check for bent pins, solder bridges, cracked parts, and conductive debris.
- Confirm the board revision and connector orientation.
- With a multimeter, check that `VIN_KL30`, `VIN_KL15`, `+5V`, and `+3V3` are not shorted to
  ground.
- If fitted, check CAN termination: about 120 Ω across `CAN_H` and `CAN_L` indicates one
  terminator.

Do not power the board if a supply rail appears shorted or anything looks damaged.

### 2.2. Perform a current-limited first power-up

1. Set the bench supply to 13.8 V with a 100 mA current limit.
2. Connect `VIN_KL30` and ground, then add `VIN_KL15`.
3. Stop immediately if the supply remains in current limit, a component heats quickly, or there is
   smoke or an unusual smell.
4. Check for normal status LED activity.
5. Measure approximately 5 V at `+5V` (C5) and 3.3 V at H2 pin 1.

If these checks pass, raise the current limit only as needed for the later test load.

### 2.3. Check firmware and communication

- Enter DFU mode and flash the board by following [Flashing the PCB](setup/flashing.md).
- Power-cycle and confirm that the firmware starts normally.
- Connect TunerStudio and check that live values update.
- If you plan to use SD logging, create a short log and confirm that it can be read.

### 2.4. Check the functions you will use

There is no need to test every possible configuration. Concentrate on the inputs and outputs needed
by your installation:

- Move each connected analog sensor through a plausible range and watch its TunerStudio reading.
- Apply a suitable trigger signal and confirm stable RPM and sync.
- Use firmware output-test mode to switch each connected relay or actuator one at a time.
- Check that ignition logic outputs switch correctly before connecting an igniter.
- If using CAN, check termination and confirm that expected frames are received.

Follow [Calibration §4](setup/calibration.md#4-output-tests-before-first-start) before the first
engine start.

---

## 3. Optional deeper checks

The following checks are useful when developing hardware, investigating a problem, or documenting
the design, but are not expected from every builder:

- Measure analog-input accuracy at several known voltages.
- Scope the VR input across low and high trigger amplitudes.
- Scope injector flyback and IAC freewheel behavior with a suitable probe.
- Exercise CAN bus-off recovery.
- Sweep the supply between 9 V and 16 V and check for resets.
- Run the board in its enclosure under representative loads while watching temperatures and logs.

Stop a thermal test if temperature continues to rise, communication is lost, or the supply reaches
its current limit.

---

## 4. Share a short result

A simple report is enough:

```text
Board revision:
Firmware version/commit:
Supply voltage and current limit:
Checks performed:
Result:
Unexpected behavior:
Test equipment or loads used:
```

Include measured values, photos, or scope captures when they help explain a result. Report failures
and documentation corrections through [Open-Source & Community](../../about/community.md), even if
you could not complete every check.
