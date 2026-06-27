# Volvo B2xx Redblock

![Volvo Turbo Hare](../../../assets/icons/volvo_turbo_hare.png)

The B2xx Redblock is a well-understood inline-four with no exotic cam or crank geometry. Running one on a standalone ECU is straightforward once the trigger situation is sorted — and that is the part that requires attention. The family spans decades and multiple OEM ignition systems, each with a different approach to crank position sensing. This guide maps each variant to a trigger path that is compatible with the Motorsteuergerät 24P V1 and explains what hardware work each path requires.

The 24P V1 has a single differential VR trigger input on the connector. There is no Hall input. Every trigger path described here produces a VR-compatible signal; that is the unifying constraint.

## Variants covered

| Code | Displacement | Valvetrain | Boost | Notes |
|------|-------------|------------|-------|-------|
| B21 | 2127 cc | 8v SOHC | — | No factory flywheel cutout or VR location |
| B23 | 2316 cc | 8v SOHC | — | No factory flywheel cutout or VR location |
| B230F | 2316 cc | 8v SOHC | — | LH-Jetronic; 60-2 flywheel, stock VR sensor |
| B230FT | 2316 cc | 8v SOHC | factory | As B230F; verify flywheel variant (see below) |
| B230ET | 2316 cc | 8v SOHC | factory | Early turbo; early Motronic flywheel — requires swap |
| B204FT | 1986 cc | 16v DOHC | factory | Flywheel varies with gearbox; confirm before installing |
| B234F | 2316 cc | 16v DOHC | — | As B204FT |
| B234FT | 2316 cc | 16v DOHC | factory | As B204FT |

Firing order for all variants: **1–3–4–2**.

## Trigger paths

The three viable trigger paths are flywheel VR, crank VR conversion, and locked distributor contacts. Which path applies depends on what the engine came with and what work you are willing to do.

### Flywheel VR — standard late B230

Late B230 engines (LH-Jetronic 2.2 and 2.4, from roughly 1985 onward) came from the factory with a 60-2 toothed ring on the flywheel and a passive VR sensor mounted in the bellhousing. This is the path that requires no hardware conversion: the sensor plugs directly into the 24P V1 trigger input and rusEFI understands the 60-2 pattern natively.

Verify the tooth count before assuming. Pull the bellhousing inspection cover and count — not all B230 flywheels are the same, and the trigger ring is easy to confuse visually with different patterns.

The stock Volvo VR sensor is a two-wire passive sensor. Wire it to pins <!-- TODO: confirm 24P V1 trigger +/− pin assignments --> on the 24P connector. Polarity matters; if the engine cranks but does not trigger, swap the two wires before chasing anything else.

**rusEFI trigger type:** `60/2` — set in TunerStudio under *Trigger Shape*.

### Flywheel swap — early Motronic B230 and B230ET

The earliest B230 production and the B230ET use an OEM Bosch Motronic system that relies on a different flywheel pattern — two VR sensors at different positions rather than a single multi-tooth ring. This pattern is not supported by rusEFI without a custom trigger definition, and the effort to define it is not worth it compared to simply swapping the flywheel.

Swap to a late B230 flywheel with the standard 60-2 ring. Any late M46 or M47 flywheel from a LH-Jetronic car is a direct fit. Once swapped, follow the standard flywheel VR path above.

!!! warning "Clutch balance"
    Flywheels are balanced as assemblies with the clutch cover. When swapping flywheels, rebalance the assembly or swap the clutch cover from the donor at the same time.

### Crank VR conversion — B21 and B23

The B21 and B23 predate Volvo's move to flywheel-based trigger sensing. There is no factory VR sensor mount location and no tooth ring on the flywheel. The practical path here is a crank-mounted trigger wheel: a 60-2 wheel pressed or keyed onto the crankshaft snout at the front of the engine, with a VR pickup in a fabricated bracket.

The bracket must locate the sensor at the correct gap to the tooth tips — typically 0.5–1.0 mm, but verify against your sensor's datasheet. The sensor must be rigid; any flex in the mount introduces jitter in the trigger signal.

Once installed, configure as the standard flywheel VR path: 60-2 trigger type, same wiring.

!!! note "Trigger offset"
    With a fabricated bracket you will not know the trigger offset until the engine runs. Set an approximate offset to get it started, then use the timing light procedure to dial in the actual value.

### Locked distributor contacts — all variants

Any Redblock that still has its distributor can use the contact points as a trigger source. This path requires no flywheel work and costs next to nothing. The trade-off is signal quality: points produce a voltage spike on open, not a clean sine wave, and the signal degrades as the points wear. It is a workable solution for a car that is already running on points and needs standalone ECU control without major engine work.

The mechanical advance weights must be welded or pinned solid. With the ECU controlling ignition timing, mechanical advance is no longer needed — and if the weights can move, the trigger position drifts with RPM, which will cause timing errors and is impossible to calibrate out.

With the weights locked, the points open four times per distributor revolution, which corresponds to four events per two crank revolutions. The signal goes to the 24P V1 trigger input through a pull-up resistor to +5V — the points signal is not a true VR sine wave and requires signal conditioning. <!-- TODO: confirm recommended pull-up / signal conditioning circuit for points input on VR differential stage -->

**rusEFI trigger type:** <!-- TODO: confirm correct trigger type for 4-pulse-per-2-rev distributor contact input -->

!!! warning "Wear interval"
    Check point gap and condition more frequently than on a carbureted car. Trigger signal quality is directly coupled to point condition; worn or pitted points cause misfires that look like tune problems.

## Wiring

With two injector channels and two ignition channels, the 24P V1 runs the Redblock in batch injection and wasted spark. On a four-cylinder this is the natural fit.

**Ignition — wasted spark**

| Channel | Cylinders |
|---------|-----------|
| IGN1 | 1 and 4 |
| IGN2 | 2 and 3 |

Use a wasted spark coil pack with two independent primary windings, or two separate coils. Each coil fires both cylinders in its pair simultaneously — one on the compression stroke, one on exhaust.

**Injection — batch**

| Channel | Injectors |
|---------|-----------|
| INJ1 | 1 and 2 |
| INJ2 | 3 and 4 |

Wire injectors in parallel on each channel. The 24P V1 injector drivers are discrete MOSFETs, not current-limited smart drivers. Size the injectors so the parallel pair does not exceed the driver's continuous current rating. <!-- TODO: confirm max continuous current per INJ channel from hardware ref -->

Cylinder numbering on the Redblock follows the Volvo convention: cylinder 1 is at the front of the engine (belt/timing cover end).

## Throttle position sensor

The stock B2xx throttle body has no TPS, or at best an idle contact switch, neither of which gives the ECU the analog position signal it needs for load calculation and accel enrichment. A TPS is required.

The practical solution is the TPS from a Volvo 850 — a three-wire Bosch potentiometer that bolts to the throttle body with a small adapter bracket. It is cheap, widely available on breakers, and the signal range matches what every standalone ECU expects.

**Volvo 850 TPS** — Volvo part <!-- TODO: 850 TPS Volvo part number --> / Bosch <!-- TODO: Bosch OE number -->

Wire it to the 24P V1 as follows:

| TPS pin | 24P V1 |
|---------|--------|
| Ground | Sensor ground |
| +5V reference | 5V sensor reference |
| Signal | Analog input (any free channel) |

The 24P V1 provides a 5V sensor reference rail for exactly this purpose. Do not power the TPS from a switched +12V line and divide down — use the dedicated 5V rail so the reference is stable relative to the MCU's ADC.

After wiring, calibrate in TunerStudio using *TPS calibration* (auto-detect with pedal at closed and WOT). Typical values for the 850 TPS are around 0.5V closed and 4.5V wide open, but calibrate against your actual sensor rather than using these as constants.

## Air charge sensing

The LH2.4 system uses a hot-wire air mass meter (AMM) as its primary load signal. rusEFI can accept MAF input, but its default and well-supported operating mode is speed-density: manifold absolute pressure (MAP) plus intake air temperature (IAT). Speed-density is simpler to calibrate, tolerates intake modifications without recalibration, and requires no sensor that is twenty-plus years old and increasingly hard to source.

Leave the stock AMM disconnected. It has no role in a rusEFI installation.

!!! standpunkt "Speed-density is the right model for a standalone ECU"
    A speed-density tune belongs to the builder, not to the airbox. The AMM ties fuel delivery to a specific intake geometry; MAP and IAT do not. Switching to speed-density is not a workaround for a missing sensor — it is the correct operating model for a car that may be modified.

The 24P V1 has five analog input channels. MAP and IAT each consume one. Three configurations cover the common cases.

### Combined T-MAP sensor

A T-MAP sensor (combined MAP and IAT in one body) gives both signals from a single manifold bung. This is the cleanest install for any fabricated intake or turbo manifold and the recommended approach where possible.

**Bosch `0 281 002 437`** is a widely available T-MAP used across turbodiesel applications and well-suited to boosted Redblock builds.

| Sensor pin | 24P V1 |
|-----------|--------|
| VCC | 5V sensor reference |
| GND | Sensor ground |
| MAP signal | Analog input |
| IAT signal | Analog input |

<!-- TODO: confirm 0 281 002 437 pinout, pressure range, and NTC curve name in rusEFI -->

The sensor threads into an M12 bung in the intake manifold, downstream of the throttle and as close to the plenum as practical. For a turbocharged build, it must be on the pressure side of the throttle (post-intercooler, post-throttle), not in the boost pipe.

### Audi `06B905379D` IAT + separate MAP

Where a T-MAP is unavailable or a specific pressure range is required, a discrete IAT and MAP sensor produce the same result. The Audi `06B905379D` is a two-wire NTC push-in sensor that fits a 12 mm bore drilled in the intake pipe. It uses the same resistance curve as most Bosch NTC sensors, which rusEFI knows natively — no custom calibration table needed.

Pair it with a standalone MAP sensor sized for the build:

| Application | Gauge pressure | Suitable sensor range |
|-------------|----------------|----------------------|
| Naturally aspirated | 0 bar | 0–1 bar absolute |
| Mild boost (stock B230FT to ~0.9 bar) | up to ~0.9 bar | 0–2.5 bar absolute |
| High boost | 0.9 bar+ | 0–4 bar absolute |

<!-- TODO: example Bosch MAP part numbers per pressure range -->

The IAT sensor wires to any free analog input. Configure it in TunerStudio using the standard Bosch NTC curve.

## Fuel system

### Fuel injectors

All stock Redblock injectors use the Bosch EV1 connector. They are high-impedance (ballast-resistor free), which is correct for the 24P V1's discrete MOSFET drivers.

| Engine | System | Flow rate | Bosch part |
|--------|--------|-----------|------------|
| B230F | LH2.2 | <!-- TODO: cc/min @ 3 bar --> | <!-- TODO --> |
| B230F | LH2.4 | <!-- TODO: cc/min @ 3 bar --> | <!-- TODO --> |
| B230FT | LH2.4 | <!-- TODO: cc/min @ 3 bar --> | <!-- TODO --> |
| B234F / B234FT | LH2.4 | <!-- TODO: cc/min @ 3 bar --> | <!-- TODO --> |

Enter the correct injector flow rate and dead time in TunerStudio under *Injector > Flow rate* and *Dead time*. Dead time varies with supply voltage — use the injector datasheet curve if available, or use <!-- TODO: typical dead time at 14V for these Bosch EV1 units --> as a starting point at 14V and adjust during tune.

!!! note "Batch pairing current draw"
    Two injectors fire simultaneously per channel in batch mode. Verify that the combined peak current of both injectors does not exceed the INJ driver rating. Stock Redblock injectors are well within limits, but upgraded high-flow injectors may not be.

### Fuel pumps

The standalone ECU does not replicate the OEM fuel relay logic. You will need to wire the fuel pump to a low-side driver channel on the 24P V1 (or an external relay driven by one), controlled by the ECU's fuel pump output. rusEFI runs the pump for a prime pulse on key-on, then continuously while the engine is running.

#### Volvo 240 twin pump

The 240 LH-Jetronic fuel system uses two pumps: a small in-tank pre-pump that lifts fuel to the main pump, and an external inline main pump. This setup works well on modified cars because the pre-pump keeps the main pump primed regardless of fuel level or cornering load, preventing cavitation.

Both pumps run together. Wire both to the fuel pump output — the pre-pump draws low current and can share the same switched feed as the main pump through a relay. Use the ECU fuel pump output to drive the relay coil; do not run pump current through the low-side driver directly.

| Pump | Location | Volvo part | Bosch part |
|------|----------|-----------|------------|
| Pre-pump (transfer) | In-tank | <!-- TODO --> | <!-- TODO --> |
| Main pump | Inline, under car | <!-- TODO --> | <!-- TODO --> |

#### 940 turbo fuel pump

The 940 turbo uses a single in-tank pump. Pre- and post-1995 cars use different units with different flow capacities.

| Year | Volvo part | Bosch part | Flow (L/hr @ 3 bar) |
|------|-----------|------------|---------------------|
| Pre-1995 | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Post-1995 | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |

The post-95 pump is a direct fit in the pre-95 tank sender unit and is the better choice for any mildly modified B230FT build.

#### K-Jetronic pump

Cars originally equipped with K-Jetronic mechanical injection (many B21 and early B23 applications) have a Bosch vane pump that flows substantially more than the later LH-Jetronic roller pumps. These pumps are worth keeping when converting to standalone — the flow headroom is useful for modified engines, and the pump is already in the car.

The K-Jet pump is designed to run at high pressure against the mechanical injection system's fuel distributor. When used as a supply pump for a return-style EFI system, it requires a conventional return-line fuel pressure regulator (typically 3 bar for a NA engine, 3 bar + boost for a turbo).

Do not use a returnless regulator configuration with a K-Jet pump. The pump flows far more than any normally-aspirated engine needs; the excess must return to the tank.

| Application | Bosch part | Flow (L/hr) |
|-------------|------------|-------------|
| K-Jet vane pump | <!-- TODO: confirm OEM number --> | <!-- TODO --> |

## rusEFI configuration

<!-- TODO: Base tune file / starting point for B230 8v -->

Key values to set before first start:

| Parameter | Value |
|-----------|-------|
| Engine displacement | 2316 cc (B230/B234) or 1986 cc (B204) |
| Cylinder count | 4 |
| Firing order | 1-3-4-2 |
| Injection mode | Batch |
| Ignition mode | Wasted spark |
| Trigger type | 60/2 (standard VR path) |
| Trigger offset | Set by timing light after first start |

## Known issues

**B230FT and B234FT with automatic gearbox** — the automatic flywheel may differ from the manual unit in tooth ring pattern or sensor position. Confirm before wiring.

**B21/B23 crank trigger bracket fabrication** — the front crank snout on these engines is shorter than on the B230. Off-the-shelf trigger wheel kits designed for the B230 may not fit without modification.

**Points signal conditioning** — the distributor contact path requires additional circuitry that the 24P V1 does not provide on-board. If you go this route, plan for an external pull-up and potentially a Schmidt trigger to clean the signal before it reaches the ECU.
