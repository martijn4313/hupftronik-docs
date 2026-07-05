# B230F+T with a Holset Turbo
--8<-- "status-ai-draft.md"

The "+T" is the definitive budget redblock build: a naturally aspirated B230F bottom end, a
Holset turbocharger pulled from a Cummins diesel truck, and low boost on pump fuel. It works
because the B230F's forged crank and stout block tolerate mild boost, Holsets are cheap,
journal-bearing, and nearly indestructible — and because a standalone ECU like the Motorsteuergerät
24P V1 provides the boost-referenced fuel and retarded timing that make the combination safe.
This page lists the hardware and the ECU deltas; the risk framing below is part of the build, not
a disclaimer.

Everything not mentioned here follows the [Volvo B2xx Redblock guide](../volvo-b2xx.md).

---

## 1. Build goal — and the honest risk statement

| Aspect | Target |
|--------|--------|
| Power | Roughly $180$–$220\,\text{hp}$ at $0.4$–$0.7\,\text{bar}$ of boost |
| Bottom end | Stock B230F, $\sim 9.8:1$ compression, healthy and compression-tested |
| Fuel | **98 RON minimum** |
| Turbo | Holset — HE221/HE211 class (quick spool) or the classic HX35 (cheap, lazy below $3000\,\text{RPM}$ on a 2.3) |
| Character | Diesel-truck torque in a brick |

!!! warning "9.8:1 plus boost on pump fuel is the defining risk of this build"
    The factory turbo engine (B230FT) ran $8.7:1$ for a reason. Boosting the $9.8:1$ NA engine
    works *only* inside a narrow envelope: modest boost, cold intake charge (a real intercooler is
    mandatory, not optional), conservative timing, and rich mixtures under load. Step outside that
    envelope — a heat-soaked summer pull, a tank of 95 RON, a lazy timing map — and detonation
    will destroy the stock cast pistons' ring lands. If you want more than $\sim 0.7\,\text{bar}$,
    build a B230FT-based or forged-piston engine instead; this page is not that build.

## 2. Turbo hardware

| Item | Choice | Notes |
|------|--------|-------|
| Turbo | Holset HE221 / HE211 / HX35 | Journal bearing, oil-cooled only — no water lines needed. Verify shaft play when buying used |
| Exhaust manifold | B230FT factory manifold + adapter flange, or aftermarket log | Holset flanges are not T3; an adapter or the right manifold is part of the budget |
| Wastegate | Internal gate (HX35 variants) or external gate on the manifold | Many truck Holsets come *ungated* — verify before buying, an ungated turbo on this engine is a boost runaway |
| Oil feed | From the block's oil gallery, restrictor per Holset spec | Journal bearings want volume; follow Holset's fitting guidance, not ball-bearing restrictor lore |
| Oil drain | Steep, unrestricted, into the pan **above** the oil level | A poor drain is the number-one cause of turbo seal smoke |
| Intercooler | Front-mount, generously sized | Mandatory — see the risk statement above |
| Boost control | Wastegate spring only, to start | Get the engine tuned and reliable at spring pressure before adding electronic boost control |

## 3. Fueling

Boost multiplies airflow; the fuel system must lead it, never trail it.

* **Injectors:** the factory turbo injectors — Bosch `0 280 150 804`, $337\,\text{cc/min}$
  (see [Volvo B2xx §7.1.1](../volvo-b2xx.md#711-injectors-bosch-ev1-high-impedance)) — support
  roughly $185\,\text{hp}$ at 85 % duty on a boosted engine. For the top of this build's power
  band, step up to a $\sim 440\,\text{cc/min}$ EV1. Bench-verify whichever set you fit:
  [Injector Flow Rate Testing](../../../workshop/injector-flow-testing.md).
* **Regulator:** a $3.0\,\text{bar}$ return-style regulator with its reference port connected to
  the intake manifold, so rail pressure rises 1:1 with boost and injector flow stays constant
  relative to the manifold.
* **Pump:** the stock NA pump is not adequate. Fit a $255\,\text{L/hr}$ in-tank pump (Walbro
  GSS342 class, per [Volvo B2xx §7.1.2](../volvo-b2xx.md#712-fuel-pumps)) and remember that at
  $0.7\,\text{bar}$ of boost the pump works against $3.7\,\text{bar}$ — qualify it at that
  pressure: [Fuel Pump Pressure and Flow Testing](../../../workshop/fuel-pump-testing.md).

## 4. Sensors and ignition

* **T-MAP:** the $3.0\,\text{bar}$ Bosch `0 281 002 437` from
  [Volvo B2xx §6.1](../volvo-b2xx.md#61-quick-scan) covers this boost range with margin. Mount it
  after the intercooler, close to the plenum.
* **Ignition:** wasted spark per the base guide, unchanged. Fit spark plugs two heat ranges colder
  than stock NA and close the gaps to $0.6$–$0.7\,\text{mm}$ — boost pressure blows out wide gaps.
* **Camshaft:** the factory turbo `T` cam suits the build; the stock NA cam works for a first
  season. Avoid long-duration NA cams — overlap and boost make a bad pair with an internal-gate
  turbo.

## 5. ECU configuration

Start from [Volvo B2xx §9](../volvo-b2xx.md#9-rusefi-configuration). Deltas:

| Parameter | Value / change |
|-----------|----------------|
| Injectors | Measured flow of the fitted set (e.g. $337\,\text{cc/min}$ `804`s) |
| VE / fuel table axis | Extend the load axis to $\geq 180\,\text{kPa}$ absolute |
| Target AFR under boost | $\lambda \approx 0.80$ ($\sim 11.8{:}1$) at full boost — rich is cheap insurance here |
| Ignition under boost | Retard from the NA map as boost rises — a starting shape is roughly $1^\circ$ less advance per $0.1\,\text{bar}$ of boost, tuned from the safe side |
| Overboost protection | Hard fuel cut $0.15\,\text{bar}$ above target boost — configure this **before** the first boosted drive |
| Rev limit | $6000\,\text{RPM}$ — the turbo makes its torque low; there is nothing up top worth the valvetrain risk |

## 6. Tuning notes

1. First start and all base tuning happen **off boost** — vacuum and light load only — exactly as
   an NA engine, per [Tuning Basics](../../../tuning/basics.md).
2. Verify the boost-referenced rail pressure: with the engine idling, pull the regulator's vacuum
   line and confirm rail pressure rises accordingly.
3. Approach boost incrementally: short pulls, one load row at a time, watching lambda and listening
   (knock ears or dyno audio detection). Lean spikes under rising boost mean the fuel system is
   trailing — stop and find out why before the next pull.
4. Heat soak is the enemy. Watch IAT during back-to-back pulls; if it climbs past
   $\sim 50\,^\circ\text{C}$, the intercooler or its airflow is inadequate for the boost you are
   running.

## 7. Expected outcome

A wave of mid-range torque no NA redblock build approaches, delivered with truck-turbo lag and
truck-turbo durability. Kept inside the envelope — modest boost, 98 RON, cold charge, rich and
retarded under load — the stock B230F bottom end has a long community track record of surviving
this treatment. Pushed outside it, the failure mode is fast and expensive.

---

## Next steps

Commission the engine NA-first per the [Volvo B2xx guide §11](../volvo-b2xx.md#11-next-steps),
then work through the boost ramp-up above. Bench-qualify pump and injectors *before* first boost —
[Fuel Pump Pressure and Flow Testing](../../../workshop/fuel-pump-testing.md) and
[Injector Flow Rate Testing](../../../workshop/injector-flow-testing.md). If boost brings sync or
misfire trouble, start at [Troubleshooting](../../troubleshooting.md).
