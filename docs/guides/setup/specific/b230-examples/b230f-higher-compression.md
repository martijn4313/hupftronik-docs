# B230F with Raised Compression and a Mild Aftermarket Cam
--8<-- "status-ai-draft.md"

This build turns a B230F into a genuinely quick naturally aspirated street engine: compression
raised to around $10.5:1$ and a mild aftermarket camshaft, tuned on the Motorsteuergerät 24P V1.
Raised compression is the most efficient power modification there is — it improves torque
everywhere in the rev range and pays for itself in throttle response — but it consumes knock
margin, which is exactly why it belongs on a standalone ECU with a properly built timing map. The
head comes off for this one.

Everything not mentioned here follows the [Volvo B2xx Redblock guide](../volvo-b2xx.md).

---

## 1. Build goal

| Aspect | Target |
|--------|--------|
| Power | Roughly $130$–$145\,\text{hp}$ |
| Compression | $\sim 10.3$–$10.7:1$ (from stock $\sim 9.8:1$) |
| Camshaft | Mild aftermarket street grind |
| Fuel | **98 RON minimum — this is a hard requirement, not a preference** |
| Character | Strong mid-range, crisp response, still a daily driver |

## 2. Raising the compression

The usual route is skimming the cylinder head. As a rule of thumb on the 8v head, each
$0.5\,\text{mm}$ removed raises the ratio by roughly $0.3$; around $1.0$–$1.2\,\text{mm}$ off a
stock B230F head lands near $10.5:1$.

!!! warning "Measure, don't assume"
    Head castings vary and many used heads have been skimmed before. Measure the combustion
    chamber volume (burette and plate) and *calculate* your actual ratio before final assembly.
    These figures are drafted from community rules of thumb, not verified measurements.

Points to respect while the head is off:

1. Check how much material the casting has left — a previously skimmed head may not tolerate more.
2. A skim retards cam timing slightly (the head sits lower); an adjustable cam gear restores it,
   though at this mild level the effect is small.
3. Use a quality head gasket at stock thickness. Do not "gain" compression with a thin gasket of
   unknown quench behavior.
4. Have the valve seats and guides checked while the machinist has the head — a leaking valve
   wastes everything else on this page.

## 3. Camshaft and valvetrain

A mild street grind — the class of cam sold for fast-road redblocks by the established Swedish
grinders (KG Trimning / Enem "V15"-class and equivalents) — is the right partner for $10.5:1$:
enough duration to use the compression, not so much that idle vacuum and low-speed drivability
suffer.

* Fit new (or verified) followers, check valve springs against the grinder's specification, and
  re-shim clearances to the cam card.
* Follow the flat-tappet break-in procedure: assembly paste on the lobes, then
  $\sim 2000\,\text{RPM}$ for 15–20 minutes immediately after first start.
* Verify piston-to-valve clearance if combining the skim with the cam — at this mild level it is
  rarely a problem, but "rarely" is not "never".

## 4. Fueling — is stock hardware enough?

Yes, at this power level. Four $214\,\text{cc/min}$ injectors at a maximum of 85 % duty cycle
supply roughly:

$$4 \times 214 \times 0.85 \approx 728\,\text{cc/min} \approx 43.7\,\text{L/hr}$$

At a naturally aspirated requirement of $\sim 0.31\,\text{L/hr}$ per hp, that supports about
$140\,\text{hp}$ — adequate here, with nothing to spare. If your build creeps past that, the
B230FT's $337\,\text{cc/min}$ `0 280 150 804` injectors are the drop-in upgrade. Verify whatever
you fit on the bench: [Injector Flow Rate Testing](../../../workshop/injector-flow-testing.md).
The stock pump is sufficient; confirm its health per
[Fuel Pump Pressure and Flow Testing](../../../workshop/fuel-pump-testing.md).

## 5. ECU configuration

Start from [Volvo B2xx §9](../volvo-b2xx.md#9-rusefi-configuration). Deltas:

| Parameter | Value / change |
|-----------|----------------|
| Injectors | Stock `762` ($214\,\text{cc/min}$), measured flow entered |
| Rev limit | $6500\,\text{RPM}$ with verified springs; stock-spring engines stay at $6200$ |
| Ignition map | Build conservatively: at $10.5:1$ expect ~$2$–$4^\circ$ **less** total advance around peak torque than a stock-compression map |
| Target AFR at WOT | $\sim 12.8{:}1$ ($\lambda \approx 0.87$) |
| Spark plugs | One step colder than stock, gap per [Volvo B2xx §8.1](../volvo-b2xx.md#81-quick-scan) |

## 6. Tuning notes — knock margin is the whole game

!!! danger "Knock destroys this engine quietly"
    A $10.5:1$ redblock on pump fuel is close enough to the knock threshold that a careless timing
    map will damage pistons and ring lands *without audible warning* over the engine's normal
    noise. Tune WOT timing incrementally on the least-advance side, on 98 RON only, ideally with
    audio knock detection on the dyno. If the car might ever be fueled with 95 RON, keep a
    separate, retarded map for it.

* Approach MBT from below: advance in $1^\circ$ steps at each WOT cell and stop as soon as gains
  flatten — the last degree buys nothing and spends your entire safety margin.
* Heat soak matters more at high compression. Confirm the IAT sensor placement per
  [Volvo B2xx §6.3](../volvo-b2xx.md#63-design-rationale) and let the ECU's IAT timing correction
  pull advance on hot restarts.

## 7. Expected outcome

Roughly the output of the best factory NA redblocks, with better response than any of them, and a
broad, usable torque curve. This is the ceiling of sensible NA money on an 8v redblock — beyond
this point, [boost](b230ft-holset.md) is cheaper per horsepower.

---

## Next steps

Commission per the [Volvo B2xx guide §11](../volvo-b2xx.md#11-next-steps), then tune per
[Tuning Basics](../../../tuning/basics.md) with the knock discipline above. Wanting more than the
NA ceiling? Read the [B230F+T Holset example](b230ft-holset.md) — but note it prefers *stock*
compression, so decide before you skim the head.
