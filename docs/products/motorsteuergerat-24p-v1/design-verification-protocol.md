# Design Verification Test Protocol (DVTP)
--8<-- "status-ai-draft.md"

This protocol verifies the **design** of Motorsteuergerät 24P V1, not just a single assembled
board. It defines what must be demonstrated before declaring the design ready for broader field use
or a production run.

Use this protocol together with the [Hardware Test Protocol](hardware-test-protocol.md):

- The Hardware Test Protocol gives detailed bench procedures for each technical area.
- This DVTP defines sample sizes, coverage, pass/fail rules, and sign-off criteria.

---

## 1. Scope and intent

Design verification answers these questions:

1. Does the design meet functional requirements across all interfaces?
2. Does it tolerate expected electrical stress and thermal load?
3. Is board-to-board variation acceptable?
4. Are the known *to be confirmed* values now measured and documented?

This protocol is run by the project owner or designated verifier. Alpha testers are not required to
perform design verification.

---

## 2. Prepare the verification run

Before connecting a board, create one test record per unit and assign it a stable ID, for example
`DVT-01`. Photograph both sides of the unpowered board and label the image files with that ID.
Record the PCB revision, assembly batch, firmware commit, and any rework already performed.

Set up the bench before beginning the first board:

1. Fit a fuse at the bench-supply output and set the supply current limit before connecting power.
2. Confirm the DMM and scope probes are suitable for the expected voltage; use a probe rated above
	the injector flyback voltage.
3. Prepare the known-good firmware image, an empty Class 10 SD card, a CAN node, trigger source,
	relay, injector, and IAC/solenoid load.
4. Make one wiring harness that labels every connector pin. Reuse it for all boards so wiring is
	not a variable in the comparison.
5. Confirm the enclosure, TIM pad, and fasteners are ready before the thermal tests.
6. Prepare a second current-limited 5 V supply (or an inline USB current meter) for the
	`USBVCC` changeover tests.

!!! warning "One change at a time"
	 Do not change firmware, the harness, and the test load in the same test run. If a failure
	 occurs, first repeat the test with a known-good load and harness; then document every change
	 before retesting the board.

---

## 3. Units under test and builds

Test across multiple boards and at least two independent build batches if available.

| Phase | Minimum boards | Build spread | Purpose |
|---|---:|---|---|
| EVT (engineering) | 3 | Any available | Rapid issue discovery and bring-up |
| DVT (design verification) | 8 | At least 2 batches | Main evidence for design sign-off |
| PVT pilot (recommended) | 5 | Final assembly process | Check process repeatability |

If fewer boards are available, document the limitation explicitly in the final report.

---

## 4. Execution sequence

Run every DVT board through the following sequence. Complete a row on the results sheet before
moving on; this keeps an early electrical fault from being hidden by later tests.

| Step | Action | Practical guidance | Evidence |
|---|---|---|---|
| 1 | Assign and inspect | Photograph, record revision, then complete Hardware Test Protocol Stages 0 and 1 unpowered. | Photos and baseline resistance readings |
| 2 | Controlled first power | Run PWR-1 through PWR-4 at the stated 100 mA limit. Stop immediately if the supply current rises unexpectedly or a component heats. Then run PWR-9 through PWR-12 to qualify the `USBVCC` changeover circuit. | Current, rail-voltage, and changeover-threshold readings |
| 3 | Firmware baseline | Flash the locked test firmware/commit, confirm USB/TunerStudio, and start an SD log. | Flash log, firmware ID, SD log |
| 4 | Exercise inputs | Run analog and trigger tests with the same stimulus settings for every board. | Endpoint table and trigger captures |
| 5 | Exercise outputs | Test relay switching first, then injector and IAC waveform/thermal tests. | Scope captures and temperatures |
| 6 | Communications and soak | Test CAN, install the board in its enclosure with TIM, then perform the combined soak. | CAN capture and soak log |
| 7 | Review and disposition | Compare results with the other boards and open a failure record for every outlier. | Completed sheet and issue IDs |

Use one board as a known-good reference only after it has passed the complete protocol. If a later
board differs from it, record both values; do not silently adjust the acceptance limit.

---

## 5. Practical measurement guidance

### 5.1. Power and protection

Start every newly assembled board at the Stage 2 current limit of 100 mA. Observe the supply for
at least 30 seconds before proceeding. A current-limited supply is expected to hold its set voltage
when the board is healthy; a collapsed supply voltage or warming protection part is a stop condition.

For the 9 V to 16 V sweep, pause at 9 V, 12 V, 13.8 V, and 16 V. Record the 5 V rail, 3.3 V rail,
and supply current at each point. For brown-out testing, step down slowly, note the reset voltage,
then confirm normal USB/TunerStudio operation after returning to 13.8 V.

### 5.2. USB VCC changeover

The USB VCC changeover circuit switches the ECU supply from `USBVCC` to `VIN_KL15` at roughly
6 V. Verify it functionally rather than by component-level probing:

1. **USB-only operation:** With KL30/KL15 disconnected, apply 5 V to `USBVCC`. Confirm the board
	boots, the rails are in spec, and the current is comparable to the KL15-on value.
2. **Rising changeover:** Keep `USBVCC` at 5 V and raise `VIN_KL15` slowly. Record the threshold
	where `USBVCC` current drops to near zero as KL15 takes over. There must be no rail dip or
	reset during the transition.
3. **Falling changeover:** Lower `VIN_KL15` slowly from 13.8 V while `USBVCC` remains connected.
	Record the threshold where the board returns to `USBVCC` and confirm it does so without
	resetting.
4. **Isolation:** With KL15 at 13.8 V and USB disconnected, confirm there is no significant
	voltage on the `USBVCC` pin. Repeat with `USBVCC` at 5 V and KL15 open to confirm no
	back-feed into the KL15 rail.

Use the same 100 mA current limit for the first USB-only power-up. If the changeover threshold
varies by more than ±1 V between boards, treat it as a design or tolerance issue and open a
failure record.

### 5.3. Analog inputs

Use the same calibrated potentiometer or voltage source for all boards. Measure the voltage at the
connector pin with the DMM, not only at the source. Test 0.50 V, 2.50 V, and 4.50 V on every
channel; log the reported firmware voltage beside the DMM value.

For crosstalk, hold the victim input at 2.50 V and sweep the adjacent input through its full range.
The reported change on the held channel must remain below the Stage 4 limit. Repeat any unexpected
result after moving the stimulus leads away from output wiring.

### 5.4. Trigger and output waveforms

Save scope captures in a form that shows voltage scale, timebase, trigger level, and probe setting.
For an injector clamp capture, probe the output pin relative to board ground with the injector load
connected. Capture both the initial turn-off transient and the clamped plateau; do not use a scope
ground lead in a way that can short the vehicle supply.

For thermal output tests, measure and record ambient temperature before the run. Take readings at
start, 2 minutes, 5 minutes, and end of each soak. Stop the test if package temperature continues
to rise without stabilizing, the supply reaches its current limit, or the board loses communication.

### 5.5. CAN and integration soak

For CAN, record the configured baud rate, termination arrangement, and a short trace containing
valid frames. During bus-off recovery, remove the short before attempting any reset; the required
result is automatic recovery without a board power cycle.

Run the Stage 9 soak only after its individual input, output, and CAN tests have passed. Keep the
SD log, TunerStudio connection, and CAN trace active throughout the soak so a reset or sync loss
has an independent timestamped record.

---

## 6. Verification matrix

Run the corresponding stages from the Hardware Test Protocol on every DVT board unless marked
sampled.

| Requirement area | Baseline test(s) | Coverage | Pass rule |
|---|---|---|---|
| Visual and assembly integrity | Stage 0 | 100% | No safety-critical defects |
| Unpowered shorts and baseline impedance | Stage 1 | 100% | No hard shorts; values within established range |
| Power rails and protection behavior | Stage 2 (PWR-1..8) | 100% | All limits met across 9 V to 16 V sweep |
| USB VCC changeover and isolation | Stage 2 (PWR-9..12) | 100% | USB-only boot, changeover near 6 V, no back-feed |
| MCU boot, flash, and comms | Stage 3 | 100% | No flash/link failures |
| Analog input behavior | Stage 4 | 100% | Meets endpoint and crosstalk limits |
| Trigger decoding robustness | Stage 5 | 100% | Stable sync in full amplitude range |
| Low-side output behavior and clamps | Stage 6 | 100% | Correct switching and clamp behavior |
| Ignition logic outputs | Stage 7 | 100% | Valid logic levels and sequencing |
| CAN robustness | Stage 8 | 100% | No persistent bus errors |
| Combined thermal/functional stability | Stage 9 | 100% | 30 min soak passes with no reset or sync loss |

Sampled add-ons (recommended for DVT):

- Extended thermal soak: 2 boards, 2 hours, enclosure closed.
- Supply transient replay: 2 boards, 20 controlled brown-out cycles from 13.8 V to ~6 V and back.
- Reflash endurance: 3 boards, 20 flash cycles each.

---

## 7. Data requirements

For each board, store:

- Completed [Hardware Test Protocol](hardware-test-protocol.md) results sheet.
- Raw captures for critical waveforms (injector clamp, trigger input, ignition outputs).
- USB changeover threshold readings, USB-only current, and isolation measurements for both
	supply directions.
- Logged numeric values that previously appeared as TBC in overview/reference pages.
- Notes for every failure, rework action, and retest outcome.

Minimum traceability fields:

- Board serial and revision
- Firmware version and commit
- Date, tester, and equipment IDs
- Ambient temperature

Use a predictable archive layout so a result can be found without opening unrelated records:

```
verification/
	DVT-01/
		results-sheet.md
		photos/
		scope/
		logs/
		notes.md
```

Name captures with the board ID and test ID, for example `DVT-03_OUT-3_inj1-clamp.png` or
`DVT-03_SOK-1_sd-log.csv`. Preserve original instrument files when available, not just screenshots.

---

## 8. Failure handling

Classify each failure:

1. Critical: safety risk, hardware damage risk, or loss of core control function.
2. Major: functional failure with workaround.
3. Minor: cosmetic or non-blocking issue.

Rules:

- Any critical failure blocks design sign-off.
- Major failures require corrective action and re-test of affected areas on all DVT boards.
- Minor failures are tracked as open items with disposition.

For every failure, record the observed condition, exact setup, board ID, firmware commit, and
evidence file. Then choose one disposition: reproduce, repair, design change, or test-equipment
issue. A repair verifies that board only; a design change requires repeating the affected matrix
rows on every DVT board.

---

## 9. Exit criteria (design sign-off)

Design is considered verified when all are true:

1. DVT minimum board count is met, or shortfall is formally documented.
2. All required matrix rows pass on all required boards.
3. No open critical failures remain.
4. Remaining major/minor items have documented disposition and owner.
5. TBC values in the product docs are replaced with measured ranges.

---

## 10. Deliverables

At completion, publish:

- DVTP summary report (pass/fail by requirement area).
- Per-board results sheets.
- Waveform and log archive.
- Updated documentation pages with measured specifications.

Then proceed to [wiring](wiring.md) and [Setup and Commissioning](setup/index.md) for deployment.
