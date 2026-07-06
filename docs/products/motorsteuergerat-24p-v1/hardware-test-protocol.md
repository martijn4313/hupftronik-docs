# Hardware Test Protocol
--8<-- "status-ai-draft.md"

This is the bench test protocol for qualifying a Motorsteuergerät 24P V1 board — every input,
output, interface, and protection feature, exercised in a fixed order on the bench, with recorded
results. It is written for two audiences:

- **Board qualification (full protocol):** run every stage before a board is shipped to an alpha
  tester or installed in a vehicle.
- **Incoming acceptance (tester subset):** tests marked **[A]** form a shorter acceptance pass an
  alpha tester runs on receipt, before any vehicle wiring. It catches shipping damage and confirms
  the board matches this documentation.

Work through the stages **in order** — each stage assumes the previous one passed, so a fault
surfaces at the earliest, cheapest point. Record every measured value in the
[results sheet](#12-results-sheet) (§12), including values that pass: the recorded numbers from
alpha boards are what turns the *to be confirmed* entries in the
[product overview](24p_v1_overview.md#2-specifications) into published specifications.

No fuel is involved anywhere in this protocol — it is purely electrical. For fuel-system bench
work, see [Injector Flow Rate Testing](../../guides/workshop/injector-flow-testing.md) and
[Fuel Pump Pressure and Flow Testing](../../guides/workshop/fuel-pump-testing.md).

---

## 1. Equipment and safety

### 1.1. Required equipment

| Item | Requirement | Used in |
|---|---|---|
| Bench power supply | 0–20 V, ≥ 5 A, adjustable current limit | All powered stages |
| Digital multimeter | Voltage, resistance, diode mode | §2, §3, §4, §9 |
| Oscilloscope | ≥ 10 MHz, 1 probe (2 preferred), rated ≥ 50 V | §7, §8 |
| Laptop | TunerStudio, `dfu-util` or STM32CubeProgrammer installed | §5 onward |
| USB cable | Data-capable, matching the board's USB connector | §5 |
| Firmware image | Known-good build for this board (see [Setup and Commissioning §4](setup/index.md#4-compilation-and-flashing)) | §5 |
| SD card | Class 10 | §5 |
| 10 kΩ potentiometer | Analog input stimulus | §6 |
| Resistor kit | 100 Ω / 1 kΩ / 2.49 kΩ (or similar known values), ≥ 0.25 W | §4, §6 |
| Trigger source | Function generator (sine), or an Ardu-Stim-style 60-2 pattern generator | §7 |
| Test loads | 1× high-impedance injector (> 10 Ω), 1× automotive relay, 1× solenoid or IAC valve | §8 |
| CAN interface | USB–CAN adapter, or a second known-good CAN node | §9 |
| Thermometer | IR thermometer or thermocouple | §8, §11 |
| Optional | ST-Link V2/V3 (SWD check), USB–RS232 adapter (H3 check) | §5 |

### 1.2. Safety rules for this protocol

!!! danger "Bench safety"
    - **Always current-limit the bench supply** as specified per stage. The current limit is the
      test instrument here — it converts a soldering-iron-hot fault into a logged number.
    - **Inductive loads bite.** Injectors, relay coils, and solenoids produce flyback voltage at
      turn-off. Use scope probes rated for it, and never disconnect an energized inductive load by
      pulling a wire.
    - **Never exceed 18 V supply.** Sustained input above ~20 V destroys the TVS protection —
      see the [overvoltage warning](24p_v1_overview.md#3-io-overview). The destructive limit is
      deliberately **not** tested by this protocol.
    - **H1 spare inputs have no dedicated ESD protection**
      ([overview §4](24p_v1_overview.md#4-expansion-headers)) — ground yourself before touching
      that header.

All pin references below are to the [IO Overview](24p_v1_overview.md#3-io-overview) and
[expansion headers](24p_v1_overview.md#4-expansion-headers) tables.

---

## 2. Stage 0 — Visual inspection **[A]**

Unpowered. With good light and ideally a loupe:

| ID | Check | Pass criterion |
|---|---|---|
| VIS-1 | Overall board condition | No cracked, lifted, or visibly burnt components; no bent connector pins |
| VIS-2 | Solder quality around connector and D-PAK/SOIC drivers | No bridges, no cold joints, no cracked fillets |
| VIS-3 | Flux residue / contamination | No conductive residue between fine-pitch pins |
| VIS-4 | SD slot, USB connector, boot switch | Mechanically sound, actuate cleanly |
| VIS-5 | Board revision marking | Matches the revision this documentation describes — record it |

---

## 3. Stage 1 — Unpowered electrical checks **[A]**

Multimeter only, board unpowered, nothing else connected.

| ID | Measurement | Pass criterion | Record |
|---|---|---|---|
| UNP-1 | Resistance `VIN_KL30` (B1) → GND (C1) | No hard short (≫ 1 kΩ; charging capacitance may ramp the reading) | Ω |
| UNP-2 | Resistance `VIN_KL15` (A1) → GND | Same as UNP-1 | Ω |
| UNP-3 | Resistance `+5V` (C5) → GND | No hard short | Ω |
| UNP-4 | Resistance H2 pin 1 (`+3V3`) → GND | No hard short | Ω |
| UNP-5 | Resistance `CAN_H` (A5) → `CAN_L` (B5) | ~120 Ω if an onboard terminator is fitted, high/open if not — **this answers the [termination TBC](reference.md#81-can-bus)**; record which | Ω |
| UNP-6 | Diode mode, GND → each `VIN` input | Consistent between both inputs (series Schottky path); record the readings for the board record | V |
| UNP-7 | Resistance between adjacent connector pins (spot-check each row) | No unexplained short between neighboring pins | — |

!!! note "UNP readings are baselines, not absolutes"
    Without published schematics, some unpowered readings can't be given exact expected values
    yet. Record them anyway: once a handful of known-good boards are measured, the recorded
    values become the reference range for this table, and a future board that deviates is suspect.

---

## 4. Stage 2 — First power-up and supply rails **[A]**

Bench supply to `VIN_KL30` (B1) and GND (C1/B8). **Current limit 100 mA** for PWR-1 through
PWR-4.

| ID | Test | Procedure | Pass criterion | Record |
|---|---|---|---|---|
| PWR-1 | KL30-only power-up | 13.8 V to KL30 only, KL15 open | Current settles, no heating anywhere | mA |
| PWR-2 | **Quiescent current** | Read steady-state current from PWR-1 | Stable; **record — this fills the [quiescent-draw TBC](24p_v1_overview.md#2-specifications)** | mA |
| PWR-3 | KL15 switch-on | Add 13.8 V to `VIN_KL15` (A1) | Board boots (status LED activity), current step is repeatable | mA |
| PWR-4 | Rail voltages | Measure `+5V` (C5) and H2 pin 1 (`+3V3`) against GND | 4.85–5.15 V and 3.20–3.40 V | V / V |
| PWR-5 | 5 V rail under load | Raise current limit to 500 mA. Load C5→GND with 100 Ω (≈ 50 mA), then 50 Ω (≈ 100 mA) | Droop < 50 mV at 100 mA; no LDO heating beyond warm — **record for the [sensor-rail budget TBC](reference.md#72-internal-rails)** | mV droop |
| PWR-6 | Reverse polarity | Supply **reversed** onto KL30, current limit 100 mA, ≤ 5 s | Current ≈ 0 (blocked by series Schottky); board unharmed — re-run PWR-3/PWR-4 to confirm | mA |
| PWR-7 | Supply sweep | Correct polarity, sweep 9 V → 16 V slowly | Rails from PWR-4 stay in spec across the sweep; no resets | — |
| PWR-8 | Brown-out behavior | Reduce supply to ~6 V, then restore 13.8 V | Board resets/recovers cleanly, no latch-up | — |

!!! warning "Do not test the overvoltage limit"
    PWR-7 stops at 16 V by design. The TVS crowbar's job is transient surges; holding the supply
    near or above 20 V destroys it (fails short). Confirming the protection ceiling is a
    destructive test reserved for a sacrificial board, not part of qualification.

---

## 5. Stage 3 — MCU, flashing, and interfaces **[A]**

Follows [Flashing the PCB](setup/flashing.md). Powered at 13.8 V, current limit 500 mA.

| ID | Test | Procedure | Pass criterion |
|---|---|---|---|
| MCU-1 | DFU entry | Hold boot switch, power up, connect USB | Device enumerates as STM32 DFU (`dfu-util -l` lists it) |
| MCU-2 | Firmware flash | Flash the known-good image per [Flashing §2](setup/flashing.md#2-usb-dfu-bootloader) | Flash completes and verifies without error |
| MCU-3 | Normal boot | Release boot switch, power-cycle | Status LED heartbeat; USB enumerates as serial device |
| MCU-4 | TunerStudio link | Connect per [Software Tools §2](../../guides/tuning/software.md#2-connecting-to-the-board) | Live gauges update; no connection drops over 5 min |
| MCU-5 | SD logging | Insert a Class 10 card, enable logging per firmware, run ≥ 2 min, power off, read the card on the laptop | Log file exists and is readable |
| MCU-6 | SWD *(optional)* | ST-Link on H2 per [Flashing §3](setup/flashing.md#3-flashing-with-stm32cubeprogrammer) | Programmer connects and reads the MCU ID |
| MCU-7 | RS232 header *(optional)* | USB–RS232 adapter on H3, per firmware console config | Console traffic in both directions |

---

## 6. Stage 4 — Analog inputs

Powered, TunerStudio connected. Stimulus: 10 kΩ potentiometer across `+5V` (C5) and GND, wiper to
the input under test. Watch the corresponding raw ADC / gauge value in TunerStudio.

Applies to: `LAMBDA_RAW` (A2), `IAT_RAW` (A3), `CLT_RAW` (A4), `MAP_RAW` (B3), `TPS_RAW` (C3),
`SPARE_IN1` (C2), `SPARE_IN2` (B2), and — via a temporary pin header — `SPARE_IN3`–`SPARE_IN5` on
H1.

| ID | Test | Procedure | Pass criterion |
|---|---|---|---|
| AIN-1 | Full-range sweep, every channel | Sweep the pot 0 → 5 V on each input in turn | Reading tracks smoothly and monotonically over the full range; no dead zones or jumps |
| AIN-2 | Endpoint accuracy | Set 0.50 V and 4.50 V (verify with the DMM at the pin) | Firmware-reported voltage within ±2 % of the DMM value at both points |
| AIN-3 | Crosstalk | Hold one channel at 2.50 V; sweep a neighboring channel 0 → 5 V | Held channel moves < 1 % |
| AIN-4 | Temperature-input bias | 2.49 kΩ resistor from `CLT_RAW` to GND (then `IAT_RAW`) with the firmware's NTC calibration active | Plausible, stable temperature reading; **record the resulting voltage — it documents the onboard/firmware pull-up behavior** ([troubleshooting](../../guides/setup/troubleshooting.md#2-first-power-up-problems) references it, nothing specifies it yet) |
| AIN-5 | Settling / noise | With 2.50 V applied, watch the gauge for 60 s | No drift or visible noise beyond ±1 LSB-equivalent flicker |

---

## 7. Stage 5 — VR trigger interface

Powered, TunerStudio connected, triggerscope/trigger monitor open
([Software Tools §3](../../guides/tuning/software.md#3-panels-youll-use-most)). Firmware trigger
type set to match the stimulus.

**Preferred stimulus:** an Ardu-Stim-style trigger generator producing a real 60-2 pattern —
this exercises the decoder, not just the input stage. **Fallback:** a function generator sine
(tests the [MAX9924 input stage](reference.md#6-trigger-input-vr-interface) and zero-crossing
behavior, but cannot produce sync on a missing-tooth decoder).

| ID | Test | Procedure | Pass criterion |
|---|---|---|---|
| TRG-1 | Cranking-amplitude sensitivity | 60-2 pattern (or sine) at **0.5 V peak-to-peak**, ~200 RPM equivalent, differentially into `VR_POS` (C4) / `VR_NEG` (B4) | Clean edges on the triggerscope; stable sync (pattern source) |
| TRG-2 | Running amplitude | Same signal at 5 V pp, ~3000 RPM equivalent | Stable sync; RPM reading correct and steady |
| TRG-3 | High amplitude | 20 V pp, ~7000 RPM equivalent | No missed or double-counted teeth |
| TRG-4 | Amplitude sweep | Ramp 0.5 → 20 V pp at fixed frequency | No sync loss across the sweep (adaptive threshold working) |
| TRG-5 | Square-wave input mode | 0–5 V square wave into `VR_POS` per the [conditioned-trigger note](reference.md#6-trigger-input-vr-interface) | Decodes correctly |
| TRG-6 | Hall cam input | 0–5 V square at half crank frequency into `SPARE_IN1`, assigned as cam input in firmware | Cam sync acquired alongside TRG-2 signal |

---

## 8. Stage 6 — Low-side driver outputs

Powered at 13.8 V; raise the current limit to the load's needs **plus margin, never above the
[board design limits](reference.md#44-output-summary-table)** (< 5 A injector channels, < 2 A
NCE6005AS channels). Loads wire from switched +12 V to the output pin; command each channel with
the firmware output test mode ([Calibration §4](setup/calibration.md#4-output-tests-before-first-start)).

**[A]** — for acceptance, run OUT-1 only, with a relay as the load on every channel.

| ID | Test | Procedure | Pass criterion |
|---|---|---|---|
| OUT-1 | Switching, every channel | Relay coil as load on `INJ1_DRV` (C8), `INJ2_DRV` (A8), `BOOST_DRV` (A6), `IAC_DRV` (A7), `FPRELAY_DRV` (B6), `FANRELAY_DRV` (B7) in turn; command on/off | Relay clicks on command; pin voltage < 0.5 V when on, ≈ supply when off; only the commanded channel responds |
| OUT-2 | Off-state leakage | Channel off, load connected, measure voltage across the load | ≈ 0 V across the load (no partial turn-on) |
| OUT-3 | Injector clamp voltage | Real high-impedance injector on `INJ1_DRV`; scope on the pin; pulse at 10 ms / 10 Hz | Turn-off flyback clamps at a flat top ≈ **36 V** ([active clamp](reference.md#431-active-clamping-injectors-solenoids)); repeat for `INJ2_DRV`. Record the plateau |
| OUT-4 | Injector switching speed | Same setup, zoom the turn-on edge | Clean, fast transition (sub-µs-class fall time per [§A.4](reference.md#94-a4-output-characteristics)); no ringing that re-crosses threshold |
| OUT-5 | IAC freewheel path | Solenoid/IAC valve on `IAC_DRV`; scope the pin; PWM ~100 Hz, 50 % | Turn-off voltage clamps ≈ supply + 0.7 V ([freewheeling diode](reference.md#432-the-iac-diode-freewheeling)), **not** ~36 V |
| OUT-6 | IAC thermal soak | Continue OUT-5 for 10 min at rated valve current (< 2 A) | Q3 package temperature stabilizes; record the temperature and ambient |
| OUT-7 | Injector dual-load soak | Two high-impedance injectors in parallel on `INJ1_DRV` (in-car batch configuration), 10 ms / 20 Hz for 10 min | IRLR2905 temperature stabilizes; record |

!!! warning "Bare board vs. enclosure"
    Stages 6 runs on a bare bench board, so thermal soak results are conservative relative to the
    [thermally-coupled enclosure](reference.md#2-keeping-it-cool-thermal-management). If a soak
    trends toward overheating on the bench, stop, record, and re-run in the enclosure with the
    TIM pad before judging the channel.

---

## 9. Stage 7 — Ignition outputs

The ignition outputs are **logic-level triggers, not power drivers** — never connect a coil
primary ([Hardware Reference §5](reference.md#5-ignition-outputs)). Scope directly on the pins.

| ID | Test | Procedure | Pass criterion |
|---|---|---|---|
| IGN-1 | Static levels | Command `IGN1_OUT` (C7), then `IGN2_OUT` (C6), via output test mode; scope on pin | Clean 0 ↔ ~5 V transitions |
| IGN-2 | Loaded level | Repeat with a 1 kΩ resistor from pin to GND | High level still ≥ 3.5 V (330 Ω series resistance forms a divider — record the level) |
| IGN-3 | Dwell pattern | Firmware test spark sequence; both channels on the scope | Channels fire alternately with commanded dwell; no cross-firing |
| IGN-4 | Igniter integration *(optional)* | Wire a real 2-channel igniter + wasted-spark coil pack with grounded plugs, per [Volvo B2xx §8.2](../../guides/setup/specific/volvo-b2xx.md#82-technical-detail) | Spark on command on the correct channel — follow the battery-disconnect and keep-clear warnings on that page |

---

## 10. Stage 8 — CAN bus **[A]**

| ID | Test | Procedure | Pass criterion |
|---|---|---|---|
| CAN-1 | Termination audit | Unpowered: resistance across `CAN_H` (A5)/`CAN_L` (B5) with the test bus connected | ≈ 60 Ω with exactly two terminators present ([CAN Bus Basics §2](../../guides/setup/canbus-basics.md#2-bus-topology-and-termination)); reconcile with UNP-5 |
| CAN-2 | Broadcast reception | USB–CAN adapter (or second node) at the firmware's baud rate; enable the firmware's CAN broadcast | Frames received at the documented IDs and rate; no error frames over 5 min |
| CAN-3 | Bus-off recovery | Short `CAN_H` to `CAN_L` for ~2 s while broadcasting, then remove | Board resumes transmitting without a power cycle |

---

## 11. Stage 9 — Integration soak

The final gate: everything at once, in the real enclosure.

**Setup:** board mounted in the aluminum enclosure with the TIM pad
([Hardware Reference §2](reference.md#2-keeping-it-cool-thermal-management)), 13.8 V supply,
trigger generator running ~3000 RPM equivalent, two injectors on `INJ1_DRV`, relay on
`FPRELAY_DRV`, solenoid PWM on `IAC_DRV`, CAN broadcast on, SD logging on, TunerStudio connected.

| ID | Test | Duration | Pass criterion |
|---|---|---|---|
| SOK-1 | Combined operation | 30 min | No resets, no sync loss, no TunerStudio disconnects, no gauge glitches |
| SOK-2 | Thermal | During SOK-1 | Case and (on opening) driver-package temperatures stabilized; record final values and ambient |
| SOK-3 | Log integrity | After SOK-1 | SD log covers the full run without gaps; RPM trace clean throughout |
| SOK-4 | Restart | Power-cycle after soak, repeat MCU-4 | Board returns to full operation |

---

## 12. Results sheet

Copy this block per board. File the completed sheet with the board's serial/revision — for alpha
boards, attach it to the tester's board so both sides know exactly what was verified.

```
Board serial / revision: __________      Firmware image + commit: __________
Tester: __________                       Date: __________
Bench supply: __________                 Ambient temp: __________ °C

Stage 0  VIS-1..5   [ ] pass   notes: ____________________
Stage 1  UNP-1..7   [ ] pass   KL30→GND __ Ω   +5V→GND __ Ω   CAN_H↔L __ Ω
Stage 2  PWR-1..8   [ ] pass   quiescent __ mA   +5V __ V   +3V3 __ V   droop@100mA __ mV
Stage 3  MCU-1..7   [ ] pass   notes: ____________________
Stage 4  AIN-1..5   [ ] pass   worst endpoint error __ %   CLT@2.49kΩ reads __ V / __ °C
Stage 5  TRG-1..6   [ ] pass   sync range __ – __ Vpp
Stage 6  OUT-1..7   [ ] pass   clamp INJ1 __ V  INJ2 __ V   Q3 soak __ °C   IRLR2905 soak __ °C
Stage 7  IGN-1..4   [ ] pass   loaded high level __ V
Stage 8  CAN-1..3   [ ] pass   onboard terminator: yes / no
Stage 9  SOK-1..4   [ ] pass   case temp __ °C after 30 min

Overall:  [ ] QUALIFIED   [ ] FAILED at stage ____ (attach notes)
```

**Acceptance subset [A]** (tester on receipt): Stage 0, Stage 1, Stage 2, Stage 3, OUT-1, Stage 8
— roughly an hour with no oscilloscope required.

---

## 13. Next steps

A board that passes qualification is ready for
[wiring](wiring.md) and [Setup and Commissioning](setup/index.md). A failure at any stage is
exactly the feedback alpha testing exists to collect — report it with the completed results sheet
per [Open-Source & Community §3](../../about/community.md#3-reporting-a-documentation-problem).
