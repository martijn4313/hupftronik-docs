# Injector Flow Rate Testing
--8<-- "status-ai-draft.md"

---

Flow testing means measuring how much fuel an injector actually delivers on a bench, instead of
trusting the number stamped on its body. The ECU's fuel math starts from the injector flow rate you
enter in TunerStudio — and a set of thirty-year-old injectors rarely flows what the part table says,
or evenly across the set. On this page you build a simple test rig from a fuel rail, a regulator,
and a pump, drive the injectors with the Motorsteuergerät 24P V1's output test mode, and measure
flow, spread across the set, spray pattern, and leak-down.

A matched set matters more than the absolute number: the ECU can be told any flow rate, but it
cannot correct one cylinder running 10 % leaner than the others.

---

## 1. Safety first

!!! danger "Never flow-test with gasoline indoors"
    Atomized gasoline from an open injector is an explosive aerosol. Use a dedicated injector test
    fluid (e.g. a Stoddard-solvent-based calibration fluid) or, at minimum, work outdoors away from
    any ignition source. Keep a dry-powder or CO₂ fire extinguisher within reach, wear safety
    glasses, and disconnect the test supply before touching any wiring. No smoking, no grinders, no
    running heaters anywhere near the bench.

Injector test fluids are formulated to match gasoline's viscosity and density closely enough that
measured flow transfers directly. Water does not — it reads roughly 10–15 % high and corrodes the
injector internals. Do not use it.

---

## 2. Bench setup

| Item | Purpose | Notes |
|------|---------|-------|
| Fuel rail | Holds the injectors under test | The engine's own rail works; test all four at once |
| Fuel pump | Supplies pressure | Any EFI pump — see [Fuel Pump Pressure and Flow Testing](fuel-pump-testing.md) |
| Pressure regulator + gauge | Holds the reference pressure | Set to $3.0\,\text{bar}$, the pressure the part tables quote |
| Graduated cylinders, $100\,\text{mL}$ or larger | One per injector | Equal-height, transparent — supermarket measuring cups are not accurate enough |
| Reservoir + return line | Closed fluid loop | A metal can with a sealed lid and two bulkhead fittings |
| 24P V1 + laptop | Pulse source | Powered from a bench supply or battery, $13.8\,\text{V}$ nominal |
| Stopwatch | Timing the test | Phone timer is fine |

Plumb the loop: reservoir → pump → rail → regulator → back to the reservoir. Mount the rail
horizontally above the graduated cylinders so each injector sprays straight down into its own
cylinder. Bring the system to $3.0\,\text{bar}$ and check every joint for leaks **before** the first
injector pulse.

!!! warning "Verify the pressure, not the regulator label"
    Flow scales with the square root of pressure, so a regulator that actually holds
    $2.7\,\text{bar}$ instead of $3.0\,\text{bar}$ skews every reading by about 5 %. Use a gauge you
    trust, teed in at the rail.

---

## 3. Driving the injectors from the 24P V1

The board you already own is the pulse source — the same output test mode used in
[Calibration §4](../../products/motorsteuergerat-24p-v1/setup/calibration.md#4-output-tests-before-first-start)
fires injector channels on command from TunerStudio.

1. Power the 24P V1 from the bench supply and connect the laptop as for a normal tuning session.
2. Wire the injectors under test to the injector outputs exactly as in the vehicle (high-impedance
   EV1 injectors can sit two-per-channel in parallel, matching the in-car batch wiring).
3. In TunerStudio, open the output test dialog for the injector channels. Two modes are useful:
   * **Held open (static test):** the channel stays on continuously. This measures the *static*
     flow rate — the cc/min figure the part tables and TunerStudio expect.
   * **Pulsed test:** fixed pulse width and frequency. Useful for comparing dynamic behavior across
     the set, but keep the static test as your primary measurement.

If your firmware's test mode limits how long a channel stays on, a repeated long pulse (e.g.
$20\,\text{ms}$ at high frequency) approximates static flow closely enough for matching purposes.

---

## 4. Static flow test procedure

1. Trigger the pump and confirm $3.0\,\text{bar}$ on the gauge with the injectors closed.
2. Command the injector channel(s) **held open** and start the stopwatch at the same moment.
3. Run for a fixed time — $30\,\text{s}$ for a first pass, $60\,\text{s}$ for a more accurate
   measurement. Watch the gauge: pressure must hold steady during the test. If it sags, the pump
   can't keep up and every reading is invalid — fix that first.
4. Close the channel, stop the clock, and read each cylinder's volume at eye level.
5. Convert to flow rate:

$$\text{Flow}\;(\text{cc/min}) = \frac{\text{measured volume}\;(\text{mL})}{\text{test time}\;(\text{s})} \times 60$$

A $214\,\text{cc/min}$ injector should deliver about $107\,\text{mL}$ in $30\,\text{s}$.

---

## 5. Interpreting the results

| Observation | Verdict |
|-------------|---------|
| Set spread within ~2 % of the mean | Excellent — fit and go |
| Spread 2–5 % | Acceptable for a street engine; note which cylinder runs leanest |
| Spread over 5 %, or one clear outlier | Clean (ultrasonic + new filter baskets) and retest |
| Outlier persists after cleaning | Replace the injector — worn pintle or damaged seat |
| Whole set reads low but even | Often varnish; clean and retest before condemning the set |

Enter the **measured mean** flow rate in TunerStudio, not the catalog number.

**Rescaling for a different rail pressure.** Flow follows the square root of the pressure drop
across the injector:

$$Q_2 = Q_1 \sqrt{\frac{P_2}{P_1}}$$

A $214\,\text{cc/min}$ (at $3.0\,\text{bar}$) injector flows about $233\,\text{cc/min}$ at
$3.55\,\text{bar}$. If you test at exactly the pressure you will run, no correction is needed.

---

## 6. Spray pattern and leak-down checks

While the rig is pressurized, two quick visual checks catch faults that a flow number hides:

* **Spray pattern:** during a pulsed test, each injector should produce an even, symmetrical cone
  of fine mist. A visible jet, a lopsided cone, or dribbling streams means a partially blocked or
  damaged nozzle — clean and retest.
* **Leak-down:** close all channels, hold the system at $3.0\,\text{bar}$, and watch each injector
  tip for one minute. Any forming droplet is a leaking injector. In the engine it means hot-start
  problems and a hydrolocked-cylinder risk in the worst case. Cleaning sometimes fixes it; a
  persistent leaker gets replaced.

---

## 7. Next steps

If the rig's pressure sagged during testing, qualify the pump on the same bench —
[Fuel Pump Pressure and Flow Testing](fuel-pump-testing.md). Enter the measured flow rate and a
starting dead time per [Calibration §1](../../products/motorsteuergerat-24p-v1/setup/calibration.md#1-injector-dead-time).
For known-good part numbers and in-car fuel system wiring on the Volvo redblock, see
[Volvo B2xx §7](../setup/specific/volvo-b2xx.md#7-fueling).
