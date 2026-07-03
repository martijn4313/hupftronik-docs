# Volvo B2xx Redblock
--8<-- "status-reviewed.md"

> "Sturdy beast of burden" — a description that's followed this engine family around the Volvo community for decades, and one it's earned.

<br>

![Volvo Turbo Hare](../../../assets/icons/volvo_turbo_hare.png)

---

## 1. Overview

The B2xx Redblock remains a well-understood inline-four with an impressive reputation across multiple disciplines. 

Running one on a standalone ECU is straightforward. 

Since the "LH2.4 era" of the B2xx production spans almost a decade, OEM parts to convert carbureted or K-Jetronic units are often inexpensive and easy to find. Of course, for exotic (turbo) builds, different routes exist, but those are conscious choices left up to you.

---

## 2. Variants covered

| Code | Displacement | Valvetrain | Notes |
|------|-------------|------------|-------|
| B21 | $2127\,\text{cc}$ | 8v SOHC | No factory flywheel cutout or VR location |
| B23 | $2316\,\text{cc}$ | 8v SOHC | No factory flywheel cutout or VR location |
| B230F | $2316\,\text{cc}$ | 8v SOHC | LH-Jetronic; 60-2 flywheel, stock VR sensor |
| B230FT | $2316\,\text{cc}$ | 8v SOHC | As B230F; verify flywheel variant (see below) |
| B230ET | $2316\,\text{cc}$ | 8v SOHC | Early turbo; early Motronic flywheel—requires swap |
| B204FT | $1986\,\text{cc}$ | 16v DOHC | LH-Jetronic; 60-2 flywheel, stock VR sensor |
| B234F | $2316\,\text{cc}$ | 16v DOHC | As B204FT |

Firing order for all variants: **1–3–4–2**. Cylinder 1 is at the front of the engine (timing cover end).

---


## 3. Engine position sensor

!!! standpunkt "Trigger integrity dictates engine survival"
    The trigger signal is the heartbeat of the ECU. Take this seriously. Chasing trigger or sync problems later on is a major headache, and a fluctuating timing signal causes immediate engine damage under high load.

### 3.1. Quick Scan

| Path | Target | Sensor | rusEFI Type | Hardware Effort |
|------|--------|--------|-------------|-----------------|
| Late B230 (LH2.4) | 60-2 Flywheel | VR (Passive) | `60/2` | Plug & play |
| Early B230 / B230ET | 60-2 Flywheel | VR (Passive) | `60/2` | Flywheel swap |
| B21 / B23 | 60-2 Crank wheel | VR (Passive) | `60/2` | Fabricate bracket |
| Distributor | 4 pulses / 2 revs | Contact | `Basic Distributor` | Lock advance weights |

### 3.2. Technical Detail

#### 3.2.1. Standard late B230
Late B230 engines (LH-Jetronic 2.4, roughly 1989 onward) come from the factory with a 60-2 toothed ring on the flywheel and a VR sensor mounted in a bracket on the back of the engine. There is a cutout in the bellhousing of the gearbox. Older M4x gearboxes sometimes lack this cutout. 

Verify the flywheel before assuming; Motronic and Renix flywheels look similar but have different tooth counts and use incompatible sensors.

#### 3.2.2. Early Motronic B230 and B230ET
The early Bosch Motronic system relies on two VR sensors at different positions rather than a single multi-tooth ring. Swap to a late B230 "dog-dish" flywheel with the standard 60-2 ring. Any late M46 or M47 flywheel from an LH2.4 car is a direct fit. Dual-mass M90 flywheels from a post-1995 940 technically work with an M90 gearbox, but they have lower limits for input torque and RPM.

!!! warning "Flywheel condition"
    Used parts accumulate significant mileage. When selecting a flywheel, inspect critically for micro-cracking and verify the condition of the damper on dual-mass units.

#### 3.2.3. B21 and B23
The B21 and B23 predate Volvo's move to flywheel-based trigger sensing. Press or key a 60-2 wheel onto the crankshaft snout at the front of the engine, and mount a VR pickup in a fabricated bracket. Target a sensor gap of $0.5 - 1.0\,\text{mm}$. The sensor bracket must be absolutely rigid.

You can swap to a later 60-2 flywheel and modify the bellhousing, but the early engine blocks lack the factory mounting holes for the rear VR sensor bracket.

#### 3.2.4. Distributor contacts
Although not optimal, you can use the distributor contact points as a trigger source. 

> This primarily applies to setups like older B18/B20 pushrod engines or carbureted engines with a good working mechanical distributor. You must build a board that takes the flyback pulse and conditions it for the ECU. 
> 
> For engines running L-Jetronic with Renix (Volvo 360 series), we advise using the 36-2-2 flywheel these engines already possess. To keep a stock appearance on a Volvo 360, retain the HT distributor but replace the intelligent Renix coil with a "dumb" coil from a Volvo 4xx series, triggered directly by the Motorsteuergerät.

!!! warning "Locking the distributor is irreversible"
    Welding or pinning the advance weights permanently removes mechanical advance. Do this with the
    distributor removed from the engine and the battery disconnected, and confirm before you start
    that you're committing to ECU-controlled timing — reverting requires a replacement distributor.

Weld or pin the mechanical advance weights solid in the fully advanced position. The trigger offset needs to be at least $\sim 40^\circ$ to create a workable solution. If you do not want to lock your distributor, you can run the ECU in "Fuel Only" mode.

??? info "Signal conditioning when using distributor contacts"
    The signal routes to the `VR_POS` trigger input (pin C4 — see the
    [IO Overview](../../../products/motorsteuergerat-24p-v1/24p_v1_overview.md#3-io-overview))
    through a conditioning circuit: a $1\,\text{k}\Omega$ pull-up resistor to $+5\,\text{V}$, a
    $10\,\text{nF}$ capacitor to ground for debounce, and a $1\,\text{k}\Omega$ series resistor to
    adapt the square wave for the differential VR stage.

### 3.3. Design Rationale

While alternative trigger options exist (e.g., front-mounted Hall sensors, aftermarket cam triggers), utilizing the factory 60-2 VR setup offers the best balance of high-resolution timing data and mechanical simplicity. The 60-2 wheel provides enough density for highly accurate ignition timing calculation during rapid acceleration transients, outperforming 4-pulse distributor setups entirely.

---


## 4. Camshaft position sensor

!!! standpunkt "Batch fueling and wasted spark meet the performance mandate"
    Adding a cam sync for fully sequential operation yields marginal idle emissions improvements but introduces unnecessary mechanical complexity to a B2xx. We optimize for robust performance, not theoretical perfection. The 24P V1 focuses on batch fueling and wasted spark, rendering a camshaft position sensor obsolete.

### 4.1. Quick Scan

| Component | Status | Target |
|-----------|--------|--------|
| Cam Sensor | Omitted | N/A |

### 4.2. Technical Detail

Do not install or wire a camshaft position sensor. The B2xx engine architecture does not require it for standard performance builds.

### 4.3. Design Rationale

The ECU calculates engine phase solely based on the primary crank trigger (60-2). Batch-fire injection and wasted spark ignition provide sufficient resolution, drivability, and power for both naturally aspirated and high-boost applications, completely bypassing the potential failure points of a retrofitted cam sync.

---


## 5. Throttle position sensor

!!! standpunkt "Transient fueling requires intent"
    A MAP sensor alone cannot predict rapid throttle transients; it only reacts to them after the manifold pressure drops. An analog TPS is mandatory for immediate acceleration enrichment. Relying solely on MAP for acceleration is a lazy configuration that compromises drivability.

### 5.1. Quick Scan

| Component | Part Number | Output | Connector |
|-----------|-------------|--------|-----------|
| Volvo 850 TPS | Volvo `1336385` / Bosch `0 280 122 001` | $\sim 0.5\,\text{V}$ (closed) to $4.5\,\text{V}$ (WOT) | 3-pin Bosch |

### 5.2. Technical Detail

The stock B2xx throttle body lacks an analog TPS, relying only on an idle contact switch. Bolt a Volvo 850 TPS (a three-wire Bosch potentiometer) to the throttle body using a fabricated adapter bracket. 

Wire it directly to the 24P V1:
*   **Ground:** Sensor ground
*   **+5V reference:** 5V sensor reference
*   **Signal:** Analog input (any free channel)

Calibrate in TunerStudio using the *TPS calibration* tool. Do not use generic constants; calibrate against your actual sensor limits.

### 5.3. Design Rationale

The Volvo 850 TPS is cheap, widely available, and its signal range perfectly matches the expectations of modern ADCs. We power the TPS exclusively from the 24P V1's dedicated $+5\,\text{V}$ sensor reference rail. Do not power the TPS from a switched $+12\,\text{V}$ line and divide the voltage down. The dedicated rail ensures the reference voltage remains absolutely stable relative to the MCU's Analog-to-Digital Converter, eliminating sensor drift when system voltage fluctuates under heavy electrical loads.

---


## 6. Air charge sensing

!!! standpunkt "Speed-density is the correct operating model"
    A speed-density tune belongs to the builder, not to the airbox. The OEM hot-wire Air Mass Meter (AMM) restricts airflow and ties fuel delivery to a specific intake geometry; MAP and IAT do not. Switching to speed-density is not a workaround for a missing sensor—it is a conscious engineering choice for a modified engine.

### 6.1. Quick Scan

| Application | Sensor Type | Bosch Part Number | Range (Absolute) |
|-------------|-------------|-------------------|------------------|
| Naturally Aspirated | MAP | `0 261 230 004` | $0 - 1.05\,\text{bar}$ |
| Mild Boost | T-MAP | `0 281 002 437` | $0.2 - 3.0\,\text{bar}$ |
| High Boost | T-MAP | `0 281 006 059` | $0.5 - 4.0\,\text{bar}$ |

### 6.2. Technical Detail

Leave the stock AMM disconnected. It serves no purpose in this installation. The 24P V1 supports Speed-Density natively using MAP and IAT. 

**Combined T-MAP Sensor**
A T-MAP sensor packages both MAP and IAT elements into a single body. The Bosch `0 281 002 437` provides a $3.0\,\text{bar}$ absolute range, sufficient for $2.0\,\text{bar}$ of boost. Thread it into an M12 bung in the intake manifold. 
*   **Pin 1 (GND):** Sensor ground
*   **Pin 2 (NTC):** IAT analog input
*   **Pin 3 (VCC):** 5V sensor reference
*   **Pin 4 (MAP):** MAP analog input

**Discrete Sensors**
If a T-MAP is unavailable, use an Audi `06B905379D` push-in IAT sensor paired with a standalone Bosch MAP sensor sized for your build pressure. Configure the IAT in TunerStudio using the standard Bosch NTC curve.

### 6.3. Design Rationale

We position the MAP/IAT sensor downstream of the throttle and intercooler, as close to the plenum as practical. Measuring air temperature before the intercooler provides false data to the speed-density algorithm, leaning out the engine under thermal load. The T-MAP is chosen because it minimizes wiring runs and eliminates a potential vacuum leak point by combining two critical sensors into one robust OEM housing.

---


## 7. Fueling

!!! standpunkt "Software cannot fix a dry pump"
    The fuel system must be mechanically sound before the ECU takes over. We retain high-headroom mechanical setups like twin-pump architectures because physical flow volume and anti-starvation mechanics trump algorithmic fault-tolerance. We do not attempt to patch a failing fuel system with software.

### 7.1. Quick Scan

#### 7.1.1. Injectors (Bosch EV1, High-Impedance)

| Engine | System | Bosch Part | Flow Rate (@ 3 bar) |
|--------|--------|------------|---------------------|
| B230F | LH2.2 | `0 280 150 734` | $200\,\text{cc/min}$ |
| B230F | LH2.4 | `0 280 150 762` | $214\,\text{cc/min}$ |
| B230FT | LH2.4 | `0 280 150 804` | $337\,\text{cc/min}$ |
| B234F | LH2.4 | `0 280 150 749` | $214\,\text{cc/min}$ |

#### 7.1.2. Fuel Pumps

| Setup | Pump Type | Part Number | Flow Rate |
|-------|-----------|-------------|-----------|
| Volvo 240 Main | Inline | Bosch `0 580 464 126` | $\sim 130\,\text{L/hr}$ |
| 940 Pre-1995 | Inline | Bosch `0 580 464 068` | $\sim 130\,\text{L/hr}$ |
| 940 Post-1995 | In-tank | Walbro GSS342 / DW200 | $255\,\text{L/hr}$ |
| K-Jetronic | Inline | Bosch `0 580 254 911` | $\sim 180\,\text{L/hr}$ |

### 7.2. Technical Detail

**Injection — Batch**
Wire the high-impedance EV1 injectors in parallel on each channel. Pair cylinders the same way as the wasted-spark ignition groups below (360° apart in the 720° cycle), not by physical adjacency, so each batch pulse lands evenly spaced across the cycle. Set the injector flow rate in TunerStudio and use a dead time of $1.1\,\text{ms}$ at $14\,\text{V}$ as a starting point.
*   **INJ1:** Cylinders 1 and 4
*   **INJ2:** Cylinders 2 and 3

**Fuel Pump Logic**
The ECU does not replicate OEM relay logic directly. Route the ECU fuel pump output to drive an external relay coil; do not run main pump current directly through the low-side driver. 
*   **240 Setups:** Wire both the transfer pre-pump and the inline main pump to run simultaneously from the relay. 
*   **940 Post-1995:** The fuel hanger easily accepts a modern $255\,\text{L/hr}$ upgrade pump (e.g., Walbro GSS342).
*   **K-Jetronic Conversions:** Utilize a conventional return-line regulator (e.g., $3.0\,\text{bar}$). Do not use a returnless setup, as the massive flow volume of a vane pump will overwhelm it.

### 7.3. Design Rationale

The 24P V1 injector drivers are discrete, un-limited MOSFETs. The silicon itself is rated far higher than the board can dissipate — the practical on-board limit is about $5\,\text{A}$ peak per channel, set by PCB thermal constraints (see the [output summary table](../../../products/motorsteuergerat-24p-v1/reference.md#44-output-summary-table)). Two high-impedance EV1 injectors wired in parallel draw approximately $2\,\text{A}$, operating well within the thermal limits of the board.

We retain K-Jetronic vane pumps on converted cars because their extreme flow headroom is highly beneficial for forced induction. The twin-pump architecture of the 240 prevents cavitation during high-G cornering—a physical reality that no software logic can correct. 

---


## 8. Ignition

!!! standpunkt "High cylinder pressures demand high spark energy"
    Relying on a 30-year-old distributor cap and rotor for forced induction is a liability. Wasted spark removes physical wear items and delivers consistent ignition energy at high RPM.

### 8.1. Quick Scan

| Setup | Coil Type | Coil Part Number | Igniter (Power Stage) | Plug Gap |
|-------|-----------|------------------|-----------------------|----------|
| Wasted Spark | 2x2 Pack | Bosch `0 221 503 407` | Bosch `0 227 100 200` | $0.6 - 0.7\,\text{mm}$ |
| OEM Distributor | Single Coil | Stock LH2.4 | Stock Bosch `-124` or `-145` | $0.7 - 0.8\,\text{mm}$ |

### 8.2. Technical Detail

!!! danger "Disconnect the battery before ignition wiring"
    Coil primary and HT secondary circuits can deliver a dangerous shock even with the engine off if
    the battery is connected and the ECU commands a spark event during wiring. Disconnect the
    battery negative terminal before wiring or rewiring any ignition component, and keep clear of
    plug leads and coil towers when the battery is reconnected for testing.

**Ignition — Wasted Spark (Recommended)**
Use a standard 4-cylinder wasted spark coil pack featuring two independent primary windings (the Bosch `0 221 503 407` is the European standard). Pair this with a 2-channel "dumb" external igniter (Bosch `0 227 100 200`). Wire the $+5\,\text{V}$ logic-level outputs from the ECU directly to the igniter inputs.
*   **IGN1:** Fired by channel 1 (Cylinders 1 and 4)
*   **IGN2:** Fired by channel 2 (Cylinders 2 and 3)

**Ignition — HT Distributor (Fallback)**
If you opt to retain the OEM single coil, high-tension (HT) distributor, and ignition leads, use the factory single-channel power stage. 
*   **Block-mounted distributors:** Standard on 240 series (and some older 760s). These are driven by the auxiliary shaft and are generally reliable. You cannot swap a block distributor to a 940 block without also swapping the auxiliary shaft.
*   **Head-mounted distributors:** Standard on 740/940 series. These frequently suffer from leaky shaft seals and mechanical play.
*   **Wiring Warning:** Verify the condition of the "Radio Suppression Relay" on 940 models, as a failing relay causes intermittent voltage drops to the coil.

### 8.3. Design Rationale

The 24P V1 uses $+5\,\text{V}$ logic-level ignition outputs rather than internal high-current IGBTs. Driving ignition coils directly generates intense localized heat and introduces severe flyback voltage spikes inside the enclosure. By pushing the high-current switching out to a rugged, inexpensive external Bosch igniter bolted to a heat sink in the engine bay, we optimize the ECU's thermal environment. If a coil shorts and over-currents the system, the external igniter burns out—an acceptable, avoidable failure mode that protects the microcontroller from catastrophic damage.

---


## 9. rusEFI configuration

Key values to verify before the first start:

| Parameter | Value |
|-----------|-------|
| Engine displacement | $2316\,\text{cc}$ (B230/B234) or $1986\,\text{cc}$ (B204) |
| Cylinder count | 4 |
| Firing order | 1-3-4-2 |
| Injection mode | Batch |
| Ignition mode | Wasted spark |
| Trigger type | `60/2` |
| Trigger offset | Set via timing light after first start |

---

## 10. Known issues

*   **B21/B23 Bracket Fabrication:** The front crank snout on early engines is shorter than on the later B230. Off-the-shelf trigger wheel kits designed for the B230 do not fit without significant modification. Design your brackets and spacer hubs intentionally.

---

## 11. Next steps

With the engine-specific decisions above folded into your plan, wire the harness per the
[Wiring and hardware guide](../../../products/motorsteuergerat-24p-v1/wiring.md), then follow
[Setup and Commissioning](../../../products/motorsteuergerat-24p-v1/setup/index.md) to flash and
bring the board online. For first-start tuning, see [Tuning Basics](../../tuning/basics.md). If
the engine won't start or run cleanly on the first attempt, see
[Troubleshooting](../troubleshooting.md).