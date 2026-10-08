# Troubleshooting
--8<-- "status-ai-draft.md"

---

Every procedure page on this site points here when something doesn't work as described. This page
collects the symptoms builders hit most often, organized by the stage of commissioning they show up
in — flashing, first power-up, trigger sync, and running/tuning — with the likely cause and where to
go to fix it.

---

## 1. Flashing problems

| Symptom | Likely cause | Fix |
|---|---|---|
| Board not detected over USB in DFU mode | Boot switch not held during power-up, or released too early | Repeat the DFU entry sequence in [Flashing the Board §2](../../products/motorsteuergerat-24p-v1/setup/flashing.md#2-usb-dfu-bootloader), holding the switch through power-up |
| STM32CubeProgrammer can't connect via SWD | Wrong SWD wiring, or board unpowered | Recheck SWCLK/SWDIO/GND/3V3 wiring against [Flashing the Board §3](../../products/motorsteuergerat-24p-v1/setup/flashing.md#3-flashing-with-stm32cubeprogrammer) |
| Programming completes but board doesn't run | Wrong firmware file for your hardware revision, or flash didn't verify | Re-flash with `-v` (verify) set, confirm you built for the correct hardware profile |
| Board unresponsive after a full chip erase | Erase clears everything, including any working firmware | Re-flash a known-good firmware file immediately — see the warning in [Flashing the Board §2](../../products/motorsteuergerat-24p-v1/setup/flashing.md#2-usb-dfu-bootloader) |

---

## 2. First power-up problems

| Symptom | Likely cause | Fix |
|---|---|---|
| No status LED activity | No power reaching `VIN_KL30`/`VIN_KL15`, or reversed polarity | Verify voltage at the connector with a multimeter before assuming a board fault — see the power warning in the [product overview](../../products/motorsteuergerat-24p-v1/24p_v1_overview.md#3-io-overview) |
| TunerStudio won't connect / no serial data | Wrong COM port, wrong INI file for your firmware, or USB driver not installed | Confirm the port and INI match your firmware per [Software Tools §2](../tuning/software.md#2-connecting-to-the-board) |
| Sensor gauges show implausible values (e.g. -40°C coolant) | Sensor disconnected, wrong pull-up configuration, or wiring fault | Check continuity to the relevant pin in the [IO Overview](../../products/motorsteuergerat-24p-v1/24p_v1_overview.md#3-io-overview) |
| Fault LED lit / configuration error reported | Firmware configuration doesn't match your hardware (wrong pin assignments, wrong trigger type) | Recheck firmware configuration against your board's actual wiring before proceeding |

---

## 3. Trigger and cranking problems

| Symptom | Likely cause | Fix |
|---|---|---|
| No RPM signal while cranking | VR sensor miswired, wrong air gap, or wrong trigger type selected in firmware | Verify `VR_POS`/`VR_NEG` wiring and sensor gap; recheck trigger type matches your flywheel/crank wheel (see your engine's setup guide, e.g. [Volvo B2xx §3](specific/volvo-b2xx.md#3-engine-position-sensor)) |
| Engine cranks but won't catch | No trigger sync, no fuel delivery, or no spark | Confirm trigger sync first (a triggerscope/trigger monitor — see [Software Tools §3](../tuning/software.md#3-panels-youll-use-most)) before troubleshooting fuel or spark, since neither works without sync |
| RPM signal erratic or drops out at higher RPM | Sensor gap too large, sensor bracket not rigid, or a damaged tooth on the trigger wheel | Inspect the trigger wheel and bracket mechanically; re-gap the sensor per your engine's setup guide |

---

## 4. Running and tuning problems

| Symptom | Likely cause | Fix |
|---|---|---|
| Engine runs rich or lean at idle only | Closed-loop trims fighting a wrong base table, or a vacuum/boost leak | See [Tuning Basics §6](../tuning/basics.md#6-before-you-call-it-tuned) — large unstable trims mean the base table is wrong, not the sensor |
| Engine hesitates or stumbles on throttle tip-in | Missing or miscalibrated TPS-based acceleration enrichment | Recalibrate TPS against actual sensor limits, don't use generic constants — see your engine's setup guide |
| Injector driver or relay output runs hot | Output driven beyond its board design limit (see the [Hardware Reference output table](../../products/motorsteuergerat-24p-v1/reference.md#44-output-summary-table)) | Reduce continuous load on that channel, or add the thermal pad described in [Hardware Reference §2](../../products/motorsteuergerat-24p-v1/reference.md#2-keeping-it-cool-thermal-management) |
| Cooling fan or fuel pump doesn't run | Pump or fan wired directly to the low-side driver instead of through an external relay, or relay coil has no +12 V feed | The ECU output switches only the relay coil (terminal 85); the pump/fan current goes through the relay contacts — recheck against [Wiring guide §5](../../products/motorsteuergerat-24p-v1/wiring.md#5-relay-outputs) |

---

## 5. CAN bus problems

| Symptom | Likely cause | Fix |
|---|---|---|
| No CAN data at the dash or logger | Bit rate mismatch, or `CAN_H`/`CAN_L` swapped | Match the bit rate on every device; check A5 = `CAN_H`, B5 = `CAN_L` — see [CAN Bus Basics §3](canbus-basics.md#3-baud-rate-and-node-ids) |
| CAN works on the bench, fails or drops out in the car | Missing or extra termination, or long stubs | Measure about 60 Ω across `CAN_H`/`CAN_L` with everything off — see [CAN Bus Basics §2](canbus-basics.md#2-bus-topology-and-termination) |
| Data arrives but values are wrong | Receiver expects a different CAN ID map or byte layout | Match the device's expected message format to what your firmware broadcasts |

---

## 6. Next steps

If your symptom isn't listed here, go back to the setup step you're on —
[Setup and Commissioning](../../products/motorsteuergerat-24p-v1/setup/index.md) walks through
staged verification specifically so problems surface at the earliest possible step, where they're
easiest to isolate.
