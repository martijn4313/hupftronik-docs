# Calibration and Dynamic Testing
--8<-- "status-ai-draft.md"

This page covers the calibration phase: the work between "the board communicates and the sensors
read" ([Setup and Commissioning §6](index.md#6-verification-and-testing)) and "the engine is ready
to tune" ([Tuning Basics](../../../guides/tuning/basics.md)). Everything here happens before and
during the first start — get these values right and the tuning phase starts from a trustworthy
baseline; get them wrong and every table you tune afterward absorbs the error.

Firmware-specific menus differ — see the [rusEFI](rusefi.md) or [Speeduino](speeduino.md) setup
guide for where each setting lives — but the calibration work itself is the same.

---

## 1. Injector dead time

An injector doesn't flow the instant the driver opens it — the solenoid takes time (roughly
$0.5$–$1.5\,\text{ms}$, varying with battery voltage) to lift the pintle. The ECU adds this **dead
time** to every calculated pulse width, so an error here is a *fixed offset* on every injection
event: proportionally huge at idle (short pulses), negligible at full load (long pulses). The
symptom of a wrong dead time is a tune that can't be right at idle and cruise at the same time.

1. Start from the manufacturer's dead-time figure at $14\,\text{V}$ (see your engine's
   vehicle-specific guide for known values, e.g.
   [Volvo B2xx §7.2](../../../guides/setup/specific/volvo-b2xx.md#72-technical-detail)).
2. Enter the voltage-compensation curve if your firmware and data support it — dead time grows
   substantially as battery voltage drops, which matters during cranking.
3. Treat the value as calibration, not gospel: if closed-loop trims at idle diverge from trims at
   cruise in opposite directions, dead time is the first suspect.

## 2. TPS calibration

Calibrate the throttle position sensor against its own physical limits: with the engine off, set
the closed-throttle point at rest, then the wide-open point with the pedal fully down. Never use
generic constants — sensor output ranges differ between part numbers and even between individual
sensors. Recalibrate after any throttle-body or linkage work. See
[Volvo B2xx §5.2](../../../guides/setup/specific/volvo-b2xx.md#52-technical-detail) for a worked
example.

## 3. Sensor sanity pass

Before cranking, with the key on and the engine cold and heat-soaked to ambient:

- **CLT and IAT should read the same temperature**, close to actual ambient. A large offset means a
  wrong calibration curve for the sensor you wired (see the
  [rusEFI](rusefi.md#4-sensor-calibration) / [Speeduino](speeduino.md#4-sensor-calibration) setup
  guides).
- **MAP should read barometric pressure** (roughly $100\,\text{kPa}$ at sea level, engine off).
- **TPS should sweep smoothly** from 0 to 100% with no dead spots or jumps as you move the pedal
  slowly through its range.

## 4. Output tests before first start

Both firmwares provide output test modes that fire each channel on command. With the fuel pump fuse
pulled (so cranking can't flood the engine):

1. **Fuel pump relay** — command it and listen for the relay click; then restore the fuse and
   confirm the pump primes for a few seconds at key-on.
2. **Injectors** — pulse each channel and confirm the correct injector(s) click, matching your
   channel assignment from the [wiring guide](../wiring.md#4-configurations).
3. **Ignition** — with plugs grounded to the block or a spark tester (never floating), pulse each
   channel and confirm spark on the correct cylinder pair. Keep clear of the coils and leads.
4. **Fan and auxiliary outputs** — command each and confirm the right relay or actuator responds.

!!! danger "Do output tests with the fuel system disabled"
    Repeated injector test pulses on a primed rail wash the cylinder walls with fuel. Pull the fuel
    pump fuse (or run the pump dry) during injector and ignition tests, and crank with the throttle
    open to clear any accumulated fuel before a real start attempt.

## 5. IAC base position

If you wired an idle air control valve to `IAC_DRV`, set its base duty cycle (or base position)
before the first start: enough opening that a cold engine catches and holds a fast idle, not so much
that it races. A typical starting point is mid-range; refine it warm, once the engine runs. Confirm
the valve actually moves during the output test above — a stuck IAC reads exactly like a bad idle
tune later.

## 6. First start and dynamic testing

With a base map loaded ([Tuning Basics §3](../../../guides/tuning/basics.md#3-building-a-base-map)):

1. **First start attempt.** Crank with a timing light on cylinder 1. If the engine catches, hold it
   at fast idle and immediately verify the **trigger offset**: the timing light must show the
   advance the ECU commands. Adjust the offset until commanded and measured timing agree — do not
   proceed until they do.
2. **Warm-up observation.** Let the engine reach operating temperature at idle. Watch CLT climb
   smoothly, confirm the fan relay triggers at its configured threshold, and confirm closed-loop
   trims (if enabled) stay small.
3. **No-load rev sweep.** Sweep the RPM range gently with no load, watching for sync loss (RPM
   signal dropouts — see [Troubleshooting §3](../../../guides/setup/troubleshooting.md#3-trigger-and-cranking-problems))
   and implausible sensor excursions.
4. **Loaded testing.** Only after all of the above holds: proceed to on-road or dyno work per
   [Tuning Basics §4](../../../guides/tuning/basics.md#4-fueling-cell-by-cell-refinement), starting
   at low load.

---

## Next steps

Continue to [Tuning Basics](../../../guides/tuning/basics.md) for the tuning process itself. If any
step here fails, [Troubleshooting](../../../guides/setup/troubleshooting.md) is organized by
commissioning stage.
