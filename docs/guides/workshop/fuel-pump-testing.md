# Fuel Pump Pressure and Flow Testing
--8<-- "status-ai-draft.md"

Pump testing means measuring what a fuel pump actually delivers — pressure and flow, at realistic
supply voltage — before it goes anywhere near the engine. A used pump of unknown history is the
single most common weak link in a budget EFI build, and a pump that "runs" can still be down 40 %
on flow. On this page you build a small test loop, then run three measurements: maximum (dead-head)
pressure, flow at regulated working pressure, and current draw, with a repeat at reduced voltage.

The number that matters is **flow at working pressure**. Free-flow figures (no restriction) flatter
every pump and tell you almost nothing about behavior at $3.0\,\text{bar}$.

---

## 1. Safety first

!!! danger "Fuel, sparks, and electricity share this bench"
    Test with a non-flammable calibration fluid or diesel, or work outdoors if you must use
    gasoline. Every electrical connection must be made and broken with the supply off — a spark at
    a battery clamp above an open fuel container is how workshops burn down. Fuse the supply line
    ($15\,\text{A}$), keep an extinguisher in reach, and never run a pump dry for more than a few
    seconds: EFI pumps rely on the fuel itself for lubrication and cooling.

## 2. Bench setup

| Item | Purpose | Notes |
|------|---------|-------|
| 12 V supply | Powers the pump | A battery plus charger, or a bench supply rated $\geq 15\,\text{A}$ |
| Relay + fused feed | Switches the pump safely | Mirrors the in-car wiring; $15\,\text{A}$ fuse |
| Ammeter | Health indicator | A clamp meter on the supply lead is easiest |
| Pressure gauge, $0$–$8\,\text{bar}$ | Reads pump output | Teed in directly after the pump outlet |
| Adjustable regulator or valve | Sets the working pressure | A standard return-style EFI regulator works |
| Return line + reservoir | Closed loop | Sized generously — a $255\,\text{L/hr}$ pump moves over $4\,\text{L}$ per minute |
| Measuring container + stopwatch | Flow measurement | A $2\,\text{L}$ graduated container; a phone timer |

Plumb: reservoir → pump → tee (gauge) → regulator → return to reservoir. For the flow tests, the
regulator's return discharges into the measuring container instead of the reservoir. In-tank pumps
(e.g. Walbro GSS342) can be tested submerged in a bucket of test fluid with the wiring kept well
above the liquid line.

Record the supply voltage **at the pump terminals** during every test — pump output is strongly
voltage-dependent, and a reading taken at $13.8\,\text{V}$ is not comparable to one at
$12.0\,\text{V}$.

## 3. Test 1 — dead-head (maximum) pressure

With the regulator's return blocked (or a valve closed downstream of the gauge), run the pump for
**no more than five seconds** and read the peak pressure.

* A healthy EFI pump dead-heads well above its working pressure — typically in the
  $5$–$8\,\text{bar}$ region, limited by its internal relief valve.
* A pump that cannot exceed roughly $4\,\text{bar}$ has worn pumping elements or a stuck relief
  valve and will fall on its face under load, even if it idles a car convincingly.

!!! warning "Keep dead-head runs short"
    Dead-heading circulates no fuel through the pump, so nothing cools it. Five seconds is enough
    to read the gauge.

## 4. Test 2 — flow at working pressure

This is the qualifying test.

1. Set the regulator to $3.0\,\text{bar}$ (or your build's actual rail pressure) with the pump
   running.
2. Direct the regulator's return into the measuring container.
3. Run for exactly $30\,\text{s}$, then convert:

$$\text{Flow}\;(\text{L/hr}) = \text{measured volume}\;(\text{L}) \times \frac{3600}{\text{test time}\;(\text{s})}$$

4. Repeat the measurement at reduced supply voltage — around $12.0\,\text{V}$, using the battery
   without charger — to simulate a hot engine bay, aged wiring, and idle-speed alternator output.
   Expect roughly 10–20 % less flow; a pump that collapses at $12.0\,\text{V}$ will lean out on the
   road long before it fails on the bench at $13.8\,\text{V}$.

A free-flow measurement (regulator fully open, no restriction) is optional. It is only useful as a
gross triage — if a pump can't even free-flow near its rating, skip the rest and bin it.

## 5. Test 3 — current draw

Read the ammeter during the $3.0\,\text{bar}$ flow test and compare against expectations
(roughly $4$–$8\,\text{A}$ for common inline and in-tank EFI pumps at $3\,\text{bar}$; vane-type
K-Jetronic pumps run higher):

| Symptom | Likely cause |
|---------|--------------|
| Current high, flow low | Dragging armature or debris in the pumping element — failing pump |
| Current low, flow low | Worn pumping element bypassing internally, or severe supply-side restriction |
| Current normal, flow low, pressure normal | Blocked pre-filter / pickup sock on the suction side |
| Current fluctuating, flow surging | Pump ingesting air — check suction plumbing and fluid level |

## 6. Is the pump big enough for the build?

Required flow scales with target power. As a rule of thumb (via brake-specific fuel consumption,
gasoline):

$$\text{Required flow}\;(\text{L/hr}) \approx 0.31 \times P_{\text{hp}}\;\text{(naturally aspirated)} \qquad 0.37 \times P_{\text{hp}}\;\text{(boosted)}$$

Then demand headroom: the pump's **measured flow at working pressure and $12.0\,\text{V}$** should
be at least **1.25×** the requirement. Applied to the pumps from the
[Volvo B2xx guide §7.1.2](../setup/specific/volvo-b2xx.md#712-fuel-pumps):

| Pump | Nominal rating | Healthy result @ $3.0\,\text{bar}$ | Comfortable up to (boosted) |
|------|---------------|-------------------------------------|------------------------------|
| Bosch `0 580 464 126` / `068` inline | $\sim 130\,\text{L/hr}$ | $\geq 110\,\text{L/hr}$ | $\sim 240\,\text{hp}$ |
| Walbro GSS342 in-tank | $255\,\text{L/hr}$ | $\geq 210\,\text{L/hr}$ | $\sim 450\,\text{hp}$ |
| Bosch `0 580 254 911` K-Jet vane | $\sim 180\,\text{L/hr}$ | $\geq 150\,\text{L/hr}$ | $\sim 320\,\text{hp}$ |

Nominal ratings above are at $3\,\text{bar}$ and healthy charging voltage; treat the table as
guidance, not datasheet fact, and trust your own measurement over all of it. Remember that rising
rail pressure under boost (with a manifold-referenced regulator) cuts pump flow further — if your
build runs $1\,\text{bar}$ of boost, the pump works at $4.0\,\text{bar}$ absolute at full load, so
qualify it at that pressure too.

---

## Next steps

Qualify the injectors on the same bench — [Injector Flow Rate Testing](injector-flow-testing.md).
For in-car pump selection, wiring, and relay logic on the Volvo redblock, see
[Volvo B2xx §7](../setup/specific/volvo-b2xx.md#7-fueling). If the engine leans out under load
despite a healthy pump, work through [Troubleshooting](../setup/troubleshooting.md).
