# B230F+T with a Holset Turbo
--8<-- "status-in-review.md"

---

The "+T" is the definitive budget redblock build: a naturally aspirated B230F bottom end, a
Holset turbocharger pulled from a Cummins diesel truck, and low boost on pump fuel. It works
because the bottom end is nowhere near its limits at this power level — the stout block is good
for some 600 hp, and the cast (but famously strong) crank takes boost in stride; the first real
limit is the 9.8:1 compression, not the iron — and because Holsets are cheap, journal-bearing,
and nearly indestructible.

This page lists the hardware and the ECU deltas; the risk framing below is part of the build, not a disclaimer.

Everything not mentioned here follows the [Volvo B2xx Redblock guide](../volvo-b2xx.md).

---

## 1. Build goal

| Aspect | Target |
|--------|--------|
| Power | Roughly $250$–$350\,\text{hp}$ at $1$–$1.5\,\text{bar}$ of boost |
| Bottom end | Stock B230F, $\sim 9.8:1$ compression, healthy and compression-tested; a 13 mm-rod engine (~1990+) is strongly preferred — see [B230 bottom-end versions](../volvo-b2xx.md#21-b230-bottom-end-versions) |
| Fuel | **98 RON minimum**, or "the devil's fuel," E85 |
| Turbo | Holset — HE351CW (cheap, lazy below $3000\,\text{RPM}$ on a 2.3) |
| Character | Turbo-lag is fun |

!!! warning "9.8:1 plus boost on pump fuel is the defining risk of this build"
    The factory turbo engine (B230FT) ran $8.7:1$ for a reason. Step outside the safe tuning envelope—a heat-soaked summer pull, or a tank of 95 RON—and detonation **will** destroy the head gasket or melt the ring lands. 

**Why it survives:** Stock compression is workable with a large turbo and cam because the combination lowers the engine's *dynamic* compression: the turbo's low exhaust backpressure is what allows the higher-overlap camshaft (see [§5](#5-sensors-and-ignition)) in the first place. Community experience puts the comfortable ceiling around $1.2\,\text{bar}$ at this compression on a large-turbo, low-backpressure setup with a mild-duration cam (`D` or `V` class) — the top of this build's $1$–$1.5\,\text{bar}$ range demands the most careful tuning. Provided you have a **real** intercooler and tune carefully, it works beautifully.

**The mechanical fuse:** Keep the OEM-style composite head gasket in place. If detonation occurs, it typically blows the gasket before melting the pistons—a much cheaper failure.

**Going further:** If you want more than $\sim 1.5\,\text{bar}$, or you're tuning for serious torque, lower the compression to around $8.2:1$ — B230FT pistons, larger combustion chambers, or a dish machined into the stock pistons on a lathe all get you there. 

But building a classic setup will often provide plenty of smiles per gallon. You can always upgrade later. 

---

## 2. Turbo hardware

| Item | Choice | Notes |
|------|--------|-------|
| Turbo | **HE351CW**, **(super)HX40**, or **HX35** | Journal bearing, oil-cooled only — no water lines needed. HE351CW: mid-range spool, flexible. superHX40: later HX40 revision, better flow. HX35: classic, lazy below 3000 RPM. Verify shaft play and endplay when buying used. |
| Exhaust manifold | **Volvo 90+ turbo cast manifold** (common, cheap), or **DIY log/tubular** | The Volvo 90+ turbo manifold is the easy option, but beware of severely cracked ones—they all have some cracks, but some are worse than others. DIY log offers good flow and clearance in tight engine bays. |
| Wastegate | **External gate** on manifold preferred. <br> Internal only after porting | Internal gates (especially on these diesel turbos) require porting to flow properly. External gate: simpler, more reliable, bolt to the manifold leg. **Do not buy ungated turbos** — boost runaway is instant and final. |
| Turbo cooling | **Oil feed** from block gallery | Holset journal bearings need oil volume and generally **do not** use a restrictor (use a minimum -4AN line). A restrictor orifice could be used to reduce bearing drag (~1.5mm). |
| | **Oil drain** steep, unrestricted, into pan **above** oil level | Poor drain is the #1 cause of turbo seal smoke and coking. |
| | **Water cooling** (optional, DIY) | Some builders coolant-flow a Holset centre housing for heat rejection, especially in tight engine bays or sustained high-boost use. Extra complexity; evaluate intercooler sizing first. |
| Intercooler | **Front-mount, generously sized** (≥ 27″ × 7″ nominal) | Mandatory — see the risk statement above. Prioritize core volume over bar-plate density. |
| Bypass / BOV | **Audi/Bosch 1.8T style** or **AliExpress BOV** | Diesel Holsets lack a bypass valve. Pushing $1.5\,\text{bar}$ without one causes harsh compressor surge. Bosch plastic recycle valves are cheap and fit the frugal theme; generic aftermarket valves work if you match the spring to idle vacuum. |
| Boost control | **Wastegate spring only, to start** | Get the engine tuned and reliable at spring pressure before adding electronic boost control. Select spring for about 50% of target boost for optimal control range (typically 0.6–0.7 bar). |

---

## 3. Exhaust and Drivetrain

The engine will survive, but some of the parts bolted to it won't unless upgraded.

| Item | Choice | Notes |
|------|--------|-------|
| Exhaust | **Large Downpipe ($3$–$3.5\,\text{in}$), $2.5\,\text{in}$ system** | The *only* reason the 9.8:1 compression survives is because of low exhaust backpressure. You must help the engine breathe early on. A $3.5\,\text{inch}$ downpipe immediately out of the turbo (stepping down to $3\,\text{inch}$ where space constricts) into a $2.5\,\text{inch}$ exhaust system is the sweet spot. Full $3\,\text{inch}$ exhausts offer diminishing returns here. |
| Clutch | **Sachs -33 turbo plate & M90 diesel/850 GLT disc** | A stock NA clutch will instantly slip. For up to $1\,\text{bar}$, the best value OEM upgrade on a stepped "dog dish" flywheel is a Sachs -33 turbo pressure plate with an M90 diesel or 850 GLT sprung organic disc. Beyond that, consider a Sachs 763. |
| Gearbox | **M90, AW71, or BMW ZF swap** | The stock M47, M46, or AW70 will shatter under the torque spike. The M90 manual is a good swap (beware the weak 3rd gear synchro stop ring on pre-L2 variants). For automatics, the AW71 (especially with the accumulator mod) can handle $\sim 300\,\text{hp}$. A welded ZF or Getrag swap is the bulletproof solution. |

---

## 4. Fueling

Boost multiplies airflow; the fuel system must lead it, never trail it.

| Item | Choice | Notes |
|------|--------|-------|
| Injectors | **$\geq 630\,\text{cc/min}$ EV1/EV14** | Factory turbo injectors ($337\,\text{cc/min}$) only support $\sim 185\,\text{hp}$. For $300\text{+}$ hp, step up to at least $630\,\text{cc/min}$ for pump gas, or $\geq 875\,\text{cc/min}$ (e.g., Bosch EV14 $1000\,\text{cc/min}$) for E85. Bench-verify: [Injector Flow Testing](../../../workshop/injector-flow-testing.md). |
| Regulator | **$3.0\,\text{bar}$ return-style** | Connect the reference port downstream of the throttle body so fuel pressure rises 1:1 with boost, keeping effective injector flow constant. |
| Pump | **$255\,\text{L/hr}$ in-tank** | The stock NA pump is inadequate. Fit a Walbro GSS342 class (per [Volvo B2xx §7.1.2](../volvo-b2xx.md#712-fuel-pumps)). At $1.5\,\text{bar}$ boost it works against $4.5\,\text{bar}$ rail pressure. Qualify it: [Pump Testing](../../../workshop/fuel-pump-testing.md). |

---

## 5. Sensors and ignition

| Item | Choice | Notes |
|------|--------|-------|
| T-MAP | **$3.0\,\text{bar}$ Bosch `0 281 002 437`** | Covers this boost range with margin. Mount it after the intercooler, close to the plenum. (See [Volvo B2xx §6.1](../volvo-b2xx.md#61-quick-scan)). |
| Ignition | **Wasted spark** | Unchanged from the base guide. Fit spark plugs two heat ranges colder than **stock NA** and close the gaps to $0.6$–$0.7\,\text{mm}$ — boost pressure blows out wide gaps. |
| Camshaft | **`D`, `K`, `VX3`, `VX` or Aftermarket** | On a high-compression B230F with a Holset, you must take advantage of the low exhaust backpressure. Run longer duration cams with overlap. The OEM `D`, `K`, `VX3`, and `VX` cams work very well. The `A` cam is acceptable for lower boost limits. Aftermarket options like KG2T, Stage 2/3 regrinds, or IPD Turbo are excellent. **Do NOT use the factory turbo `T` cam**, it will choke the engine and increase risk. |

---

## 6. ECU configuration

Start from [Volvo B2xx §9](../volvo-b2xx.md#9-rusefi-configuration). Deltas:

| Parameter | Value / change |
|-----------|----------------|
| Injectors | Measured flow of the fitted set (e.g. $630\,\text{cc/min}$ or $1000\,\text{cc/min}$ EV14s) |
| VE / fuel table axis | Extend the load axis to $\geq 250\,\text{kPa}$ absolute (to cover up to $1.5\,\text{bar}$ boost) |
| Target AFR under boost | $\lambda \approx 0.76$–$0.78$ ($\sim 11.2{:}1$–$11.5{:}1$) at full boost on pump gas. While excessive fuel costs power, erring on the rich side provides crucial cooling margins on a 9.8:1 compression build. |
| Ignition under boost | Retard from the NA map as boost rises — a starting shape is roughly $1^\circ$ less advance per $0.1\,\text{bar}$ of boost, tuned from the safe side |
| Overboost protection | Hard fuel cut $0.15\,\text{bar}$ above target boost — configure this **before** the first boosted drive |
| Rev limit | **Base B230F valvetrains require upgrades.** The weak stock NA valve springs are highly prone to valve float under boost. Fresh B230FT springs are the minimum OEM upgrade. For $7200\,\text{RPM}$ use, stiff aftermarket springs (e.g., from Folkraceshop) are absolutely mandatory to handle both the boost pressure on the intake valves and the increased RPM. |

---

## 7. Tuning notes

1. First start and all base tuning happen **off boost** most of the time — vacuum and light load only — exactly as
   an NA engine, per [Tuning Basics](../../../tuning/basics.md).
2. Verify the boost-referenced rail pressure: with the engine idling, pull the regulator's vacuum
   line and confirm rail pressure rises accordingly.
3. Approach boost incrementally: short pulls, one load row at a time, watching lambda and listening
   (knock ears or dyno audio detection). Lean spikes under rising boost mean the fuel system is
   trailing — stop and find out why before the next pull.
4. Heat soak is the enemy. Watch IAT during back-to-back pulls; if it climbs past
   $\sim 50\,^\circ\text{C}$, the intercooler or its airflow is inadequate for the boost you are
   running.

---

## 8. Expected outcome

A wave of torque no NA redblock build approaches, delivered with truck-turbo lag and
truck-turbo sound. 

> *Step on the gas... nothing... nothing... then boost begins to build slowly. As the engine breathes more air, exhaust volume increases, driving the turbine harder and causing the boost to build faster and faster in a compounding wave. And off you go. Very fun.*

Kept inside the envelope — modest boost, 98 RON, cold charge, rich and
retarded under load — the stock B230F bottom end has a long community track record of surviving
this treatment. Pushed outside it, failure ***will*** happen.

A B230F in good tune sounds eager—a bit angry, but not strained. A Redblock, especially with stock NA compression and stock 530 head, can show nervous combustion when approaching 1 bar boost. 

!!! success "Making a Redblock 'sing'"
    When listening with knock headphones, you must distinguish between normal mechanical noise and actual detonation. Over-retarding the timing to chase "ghost" mechanical noises will kill the engine's eagerness, but ignoring actual early detonation will destroy the 9.8:1 cast pistons. Safely finding this limit is the art of making the Redblock sing. 

---

## 9. Quick reference: Part numbers

To make sourcing parts easier, here is a summary of the specific components and OEM upgrades referenced in this guide:

| Category | Component | Part Number / Specification |
|----------|-----------|-----------------------------|
| **Turbo** | Holset Turbos | HE351CW, (super)HX40, or HX35 |
| **Sensors** | T-MAP Sensor ($3.0\,\text{bar}$) | Bosch `0 281 002 437` |
| **Fueling** | In-tank Fuel Pump | Walbro `GSS342` ($255\,\text{L/hr}$) |
| | Injectors ($630\,\text{cc/min}$) | Siemens Deka `FI114961` or Bosch EV14 equivalents |
| | Injectors ($1000\,\text{cc/min}$) | Bosch EV14 `0 280 158 117` (common 980/1000cc) |
| **Drivetrain** | OEM Upgrade Pressure Plate | Sachs `3082 204 033` (the "-33" plate) |
| | OEM Upgrade Clutch Disc | Volvo `271266` (M90 Diesel) or `272218` / `272236` (850 GLT) |
| | Heavy Duty Pressure Plate | Sachs Race Engineering `3082 999 763` |
| **Hardware** | Bypass Valve (CBV) | VAG / Bosch `06A 145 710 N` (or equivalent Bosch `0 280 142 114`) |
| | Recommended OEM Camshafts | Volvo `D`, `K`, `VX`, `VX3` (or `A` for low boost limits) |
| | Recommended Aftermarket Cams| KG Trimning `KG2T`, Stage 2/3 regrinds, IPD Turbo cam |
| | **Avoid** | Factory Volvo `T` or `M` cams (too little duration/overlap) |

---

## 10. Next steps

Commission the engine NA-first per the [Volvo B2xx guide §11](../volvo-b2xx.md#11-next-steps),
then work through the boost ramp-up above. Bench-qualify pump and injectors *before* first boost —
[Fuel Pump Pressure and Flow Testing](../../../workshop/fuel-pump-testing.md) and
[Injector Flow Rate Testing](../../../workshop/injector-flow-testing.md). If boost brings sync or
misfire trouble, start at [Troubleshooting](../../troubleshooting.md).
