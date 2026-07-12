# Hardware Reference
--8<-- "status-reviewed.md"

This guide provides a walkthrough of the schematics and PCB designs for the Hüpftronik Engine Control Unit (ECU). 

!!! note "Design files"
    The board is currently in alpha testing (see the [product overview](24p_v1_overview.md)) and the
    schematic/PCB source files are not yet published. This page will link to the GitHub repository
    once the design is public.

This document covers how the ECU is built, how it stays cool, and how the electrical circuits handle signals and power.

---

## 1. Enclosure Options

Choosing the right case is important for protecting the electronics and keeping the unit from overheating.

### 1.1. Quick Selection Guide
| Case Choice | Cooling Performance | Effort to Build | Best For... |
| :--- | :--- | :--- | :--- |
| **AliExpress 24-Pin Aluminum** | **Excellent** | **Low** (Plug-and-play) | Standard builds, high-performance engines, and harsh environments. |
| **Custom / 3D-Printed** | **Poor** | **High** (Requires custom design) | Test benches or very tight spaces. |

### 1.2. Recommended: AliExpress 24-Pin Aluminum Enclosure
The PCB is designed specifically to fit the standard 24-pin cast aluminum waterproof enclosure. The connector on the board matches the one provided with these cases perfectly.

Using this aluminum case provides two major benefits:
* **Heat Sinking:** The metal case pulls heat away from the components, preventing them from burning out.
* **Electrical Shielding:** The metal shell acts as a shield, stopping electrical noise from the engine from interfering with the ECU's "brain."

![PCB in Case](./hupftronik_motorsteurgerat_24p_v1_in_case.jpg)

!!! tip "Sourcing"
    Search AliExpress or a similar marketplace for "24 pin waterproof aluminum ECU case" — several
    sellers offer this connector/enclosure combination. We don't yet have a vetted single source to
    link to directly; verify the connector pinout matches an FCI 24-pin sealed automotive connector
    (3×8 grid) before buying.

### 1.3. Custom / DIY Solutions
If you prefer your own housing, you can do so, but you must handle two things carefully:

1. **The Connector:** You will need to source the 24-pin automotive header separately, as it is not a standard part.

2. **The Heat:** Plastic (3D printed) cases trap heat. If you use plastic, you **must** design a flat aluminum base plate and use a thermal pad to connect the PCB to that metal plate.

---

## 2. Keeping it Cool (Thermal Management)

The "injector drivers" (the parts that fire your fuel injectors) generate heat. If they get too hot, they will fail.

If you use the aluminum enclosure, you can significantly improve cooling by placing a **Thermal Interface Material (TIM) pad** (a squishy, non-conductive heat pad) between the bottom of the PCB and the inside floor of the case.

| Setup | Heat Level | Cooling Requirement |
| :--- | :--- | :--- |
| **2 Cylinders per Driver** (Standard) | Low | Standard PCB cooling is usually enough. A thermal pad is a good "extra" safety measure. |
| **4 Cylinders per Driver** (High Stress) | High | **Mandatory:** You must use a thermal pad to bridge the heat directly to the aluminum case. |

*(For the math behind these requirements, see **§A.1 Thermal Analysis** in the Technical Appendix)*

---

## 3. Sensor Inputs (Analog Inputs)

Analog inputs are used to read sensors (like temperature or pressure). Because engine bays are "electrically noisy," the signals are cleaned up before they reach the processor.

### 3.1. Quick Specs
* **Input Voltage:** Accepts 0–5 V (scales it down to 0–3.24 V for the processor).
* **Filtering:** Removes high-frequency electrical noise.
* **Protection:** Includes a "TVS diode" to protect against static electricity (ESD).

### 3.2. How it Works
1. **Protection:** As soon as the signal enters the board, a diode blocks static shocks from hitting the processor.
2. **Cleaning:** A small network of resistors and a capacitor (an RC filter) smooths out the signal.
3. **Scaling:** The processor can only handle up to 3.3 V. The circuit scales the standard 5 V sensor signal down so it fits safely.

*(For a detailed circuit breakdown, see **§A.3 Analog Input Topology** in the Technical Appendix; for why this signal is fed straight into the MCU instead of through an op-amp buffer, see **§A.3.1 Why Direct-to-MCU Instead of Op-Amp Buffering**)*

### 3.3. Measured Noise at the MCU Pin

The RC filter's effectiveness can be seen on a real scope capture taken at the MCU pin with a
throttle-position sensor (TPS) / potentiometer connected as the source.

![TPS Input Noise at MCU Pin](measurements/input_noise.png)

| Scope Setting | Value |
| :--- | :--- |
| Horizontal | $2.0\ \text{µs/div}$ (@ $1\ \text{GS/s}$) |
| Channel 1 | $200\ \text{µV/div}$, BW limited, DC coupled |
| Measured ripple-RMS ($V_\mathrm{r}$) | $506\ \text{µV}$ ($0.506\ \text{mV}$) |
| DC average | $0.00\ \text{mV}$ |

The trace shows the residual noise at the MCU pin *after* the voltage-divider drops the 0–5 V sensor level down to the 0–3.24 V processor-friendly input range (with an active signal span of $\approx 3.15\ \text{V}$). 

Because the noise is measured at this scaled-down node, the Signal-to-Noise Ratio (SNR) compared to the active span is incredibly high:

$$\text{SNR} = 20 \log_{10}\left(\frac{3.15\ \text{V}}{0.506\ \text{mV}}\right) \approx 75.9\ \text{dB}$$

The RMS ripple is around $506\ \text{µV}$ and appears as random broadband noise rather
than coherent interference. For the MCU's $3.3\ \text{V}$ ADC, a 12-bit conversion has roughly
$0.806\ \text{mV/LSB}$ ($806\ \text{µV/LSB}$), so this residual RMS noise sits at just about $0.63\ \text{LSB}$ — low enough that normal
oversampling or firmware filtering keeps the sensor reading incredibly stable.

!!! tip "What this means in practice"
    A TPS typically swings from $\sim 0.5\ \text{V}$ to $\sim 4.5\ \text{V}$ at the board's connector, which corresponds to $\sim 0.32\ \text{V}$ to $\sim 2.92\ \text{V}$ at the MCU pin after the divider, giving a $\approx 2.6\ \text{V}$ active signal span. Sub-millivolt noise is entirely negligible for this throttle position signal. If you see much larger ripple in your own build, check sensor ground routing, the $+5\ \text{V}$ reference return path, and whether the input is picking up switching noise from injector or ignition wiring.

---

## 4. Outputs (Low-Side Drivers)

The ECU uses "Low-Side Drivers" to act as electronic switches for relays, solenoids, and injectors.

### 4.1. Why use discrete MOSFETs?
You might see "Smart Drivers" in other ECUs. We use discrete MOSFETs because they are cheaper, can handle more current, and switch faster. Since we know exactly what we are powering (relays and injectors), we don't need a "smart" chip to monitor them; we just need a strong, fast switch.

### 4.2. The "Translator" (Gate Drive)
The processor's brain (STM32) speaks in 3.3 V, but the power switches (MOSFETs) work better with 5 V. We use a **Buffer chip (SN74ACT244PWR)** to translate the 3.3 V signal into a strong 5 V signal to ensure the switches open and close as fast as possible.

### 4.3. Safety & Protection

#### 4.3.1. Active Clamping (Injectors & Solenoids)
To protect the switching MOSFETs from the high-voltage inductive "kickback" generated when a solenoid or injector coil turns off, this board utilizes **active clamping** (a feedback path between the Drain and Gate).

*   **How it Works:** When the driver turns off, the magnetic field in the injector coil collapses, generating a high-voltage spike. Once this voltage exceeds the Zener diode threshold, current flows back into the MOSFET's Gate. This turns the MOSFET slightly back on (into its linear region) to dissipate the inductive energy safely across its silicon channel.

*  **Fast Injector Closing:** By clamping the inductive spike at a relatively high voltage (settling to $\approx 40\ \text{V}$ on the Motorsteuergerät 24P V1), the magnetic field is forced to collapse rapidly. This results in fast and repeatable injector closing times, minimizing injector lag.

*  **Thermal Distribution:** The robust MOSFET silicon absorbs the bulk of the thermal energy spike, preventing small, discrete diodes on the board from overheating.

#### 4.3.2. The IAC Diode (Freewheeling)
Unlike the injectors, the Idle Air Control (`IAC`) channel operates under continuous high-frequency Pulse-Width Modulation (PWM).

*  **The Continuous Duty Challenge:** Because the `IAC` switch cycle repeats thousands of times per minute, using active clamping would dump continuous thermal energy into the MOSFET, leading to rapid overheating.

*  **The Solution:** The `IAC` channel features a dedicated **Freewheeling Diode** routed to $+12\ \text{V}$. When the channel switches off, the inductive current recirculates through this diode at a low voltage drop ($\approx 0.7\ \text{V}$). This shifts the thermal dissipation away from the MOSFET, keeping the driver cool during sustained PWM operation.

#### 4.3.3. Clamp & Switching Verification
The active clamp circuit and turn-on performance have been verified using an oscilloscope.

##### A. Injector Turn-Off (Active Clamping Transition)
The active clamping transient has been captured under two oscilloscope setups to document both the high-detail channel resolution and the logic-input timing correlation.

=== "Detailed Verification Capture"
    ![Active Clamp & Switching Scope Capture](measurements/active_clamp_scope.png)

    *In this high-detail single-channel capture of the active clamping transition, only the MOSFET Drain voltage ($V_{\mathrm{DS}}$, yellow trace) is measured.* 
    During the brief Zener turn-on delay, the Drain briefly spikes to about $67\ \text{V}$ for approximately $200\ \text{ns}$ before the feedback via the $36\ \text{V}$ Zener diode activates and the active clamp settles to a stable $\approx 40\ \text{V}$ plateau. This safely dissipates the coil's inductive energy in the MOSFET silicon.

=== "Logic Signal Correlation"
    ![Injector Closing & Clamping Logic Signal](measurements/injector_closing_clamping_logic_signal.png)

    *This capture depicts the exact timing relationship between the gate drive signal (CH1, yellow trace, 2.00V/div) and the resulting Drain voltage transition ($V_{\mathrm{DS}}$, CH2, blue trace, 10.0V/div) as the injector closes.*
    It confirms that as soon as the gate drive transitions low, current conduction ceases, causing the Drain voltage (blue) to pull up to the active clamping level of $\approx 40\ \text{V}$ where it remains clamped until the inductive field collapses and it settles back to the $+12\ \text{V}$—$+14\ \text{V}$ battery rail.

##### B. Injector Turn-On (Charging Transition)
To verify the speed and efficiency of the gate drive, the opening transition was captured to evaluate switching speed.

![Injector Opening Drain & Logic Signal](measurements/injector_opening_drain_logic_signal.png)

*The scope capture shows the opening transient of the injector: gate drive signal transitioning from 0V to 5V (CH1, yellow trace, 2.00V/div) and the corresponding rapid drop of the MOSFET Drain voltage ($V_{\mathrm{DS}}$, CH2, blue trace, 10.0V/div) from the battery supply level to 0V.*

The extremely steep falling edge of the Drain voltage (blue trace) indicates that the IRLR2905 switches ON rapidly. This fast transition minimizes the time the MOSFET spends in its highly resistive linear region, eliminating switching losses and preventing heat rise, while ensuring a highly consistent and linear injector dead-time.

??? tip "Why a 67 V spike is safe for the MOSFET"
    Although the $67\ \text{V}$ peak exceeds the IRLR2905's rated Drain-to-Source breakdown
    voltage ($V_{\mathrm{DSS}} = 55\ \text{V}$), the MOSFET is not harmed. Under this ultra-short
    sub-microsecond transient, the device enters its rated **avalanche breakdown** region. Modern
    power MOSFETs are fully avalanche-rated, and the tiny amount of energy transferred during this
    $200\ \text{ns}$ window is orders of magnitude below the transistor's avalanche ratings
    ($E_{\mathrm{AS}} = 210\ \text{mJ}$, $E_{\mathrm{AR}} = 11\ \text{mJ}$,
    $I_{\mathrm{AR}} = 25\ \text{A}$), allowing it to safely absorb the spike.

    ??? example "Show avalanche energy calculation"
        The exact avalanche energy is $E = \int V_{\mathrm{DS}}(t) I_{\mathrm{D}}(t)\,\mathrm{d}t$
        and requires the Drain-current waveform. The $25\ \text{A}$ figure is the MOSFET's
        maximum rated avalanche current ($I_{\mathrm{AR}}$), not the actual injector current.
        A far more realistic upper-bound is the peak injector-bank current from §A.1.1,
        $4.67\ \text{A}$ (four injectors in parallel at $14\ \text{V}$). Assuming the full
        $67\ \text{V}$ peak and that $4.67\ \text{A}$ persist throughout the complete
        $200\ \text{ns}$ interval:

        $$E_{\mathrm{avalanche}} \leq V \cdot I \cdot t = 67\ \text{V} \cdot 4.67\ \text{A} \cdot 200\ \text{ns} \approx 0.063\ \text{mJ} = 6.3 \times 10^{-5}\ \text{J}$$

        So the energy deposited in the MOSFET during the 200 ns Zener turn-on delay is at most
        **about $0.06\ \text{mJ}$** — roughly **0.06 millijoule**, or
        **$6 \times 10^{-5}\ \text{J}$**. The real energy is lower because both voltage and
        current vary during the transient, and the actual turn-off current is usually below the
        $4.67\ \text{A}$ peak. Even this conservative estimate is far below the
        $210\ \text{mJ}$ single-pulse avalanche-energy rating.

??? note "Scope capture walkthrough"
    *   **Gate Drive and Drain Roles:** In the dual-channel timing correlation screenshots (turn-on and turn-off logic/drain views), the blue trace is the MOSFET Drain voltage ($V_{\mathrm{DS}}$) and the yellow trace is the gate-drive signal.
    *   **Single-Channel Clamping Detail:** In the high-detail active clamping zoom-in Capture, Only the Drain voltage ($V_{\mathrm{DS}}$) is plotted, represented by the yellow trace because it's the sole active measurement channel.
    *   **Zener Turn-On Delay ($200\ \text{ns}$):** There is a short transient period of
        **$200\ \text{ns}$** representing the duration it takes for the feedback $36\ \text{V}$
        Zener diode (in series with a 1N4148 blocking diode) to fully turn on and start conducting.
        During this brief delay, the Drain voltage temporarily spikes to **$\approx 67\ \text{V}$**.
    *   **Clamping Plateau:** Once the Zener diode fully activates and delivers charge back to the
        MOSFET Gate, the active clamp settles neatly to a stable plateau of **$\approx 40\ \text{V}$**.
        The actual clamp voltage is higher than the $36\ \text{V}$ Zener rating because of the low
        gate resistor value and the additional voltage drop across the 1N4148 blocking diode. This
        high-voltage clamp minimizes injector closing times and safely dissipates the magnetic
        energy across the silicon channel.


---

### 4.4. Output Summary Table

All low-side channels are rated for automotive voltage levels. Due to heat dissipation constraints on the PCB, the practical on-board continuous current limits are lower than the standalone silicon ratings.

| Channel | Controls | MOSFET Used | Datasheet Max ($I_D$ @ 25°C) | Board Design Limit |
| :--- | :--- | :--- | :--- | :--- |
| `INJ1` & `INJ2` | Fuel Injectors | `IRLR2905` (D-PAK) | `42 A` | **Heatsink-Dependent** <br> Recommended **`< 5 A`** peak |
| `IAC` | Idle Air Control (PWM) | `NCE6005AS` (SOIC-8) | `5 A` | **Heatsink-Dependent** <br> **`< 2.0 A`** peak |
| `BOOST` | Boost Solenoid | `NCE6005AS` (SOIC-8) | `5 A` | **Heatsink-Dependent** <br> **`< 2.0 A`** peak |
| `FAN_RELAY` | Cooling Fan Relay | `NCE6005AS` (SOIC-8) | `5 A` | **Heatsink-Dependent** <br> **`< 2.0 A`** peak |
| `FP_RELAY` | Fuel Pump Relay | `NCE6005AS` (SOIC-8) | `5 A` | **Heatsink-Dependent** <br> **`< 2.0 A`** peak |

<small>\* *Note: The IRLR2905's silicon capability is high, but thermal performance on the PCB restricts actual continuous current. Refer to the thermal calculations in the Technical Appendix (§A.1–A.2) for multi-injector bank limit details.*</small>

<small>\* *The `NCE6005AS` channels are also heatsink-dependent, scaled down: the SOIC-8 package has
a much smaller footprint and lower thermal mass than the IRLR2905's D-PAK, so its board-mounted
derating is tighter in proportion. We haven't published a worked calculation for this package the
way we have for the injector drivers (§A.1–A.2) — treat `< 2.0 A` as the practical continuous
limit and avoid running it near the 5 A datasheet maximum on the PCB.*</small>

---

## 5. Ignition Outputs

Unlike the injector and relay channels, the two ignition outputs `IGN1` and `IGN2` are **logic-level
trigger outputs, not power drivers**. They are designed to command an external igniter (power stage)
or a smart coil with a built-in igniter — never an ignition coil primary directly.

### 5.1. Circuit

Each channel is driven by an `NSG4437` driver stage with a $330\ \Omega$ series resistor on the
output. The series resistor limits output current into the igniter input and damps ringing on the
trigger line, keeping the edge clean over a real-world harness run into the engine bay.

| Specification | Value |
| :--- | :--- |
| Output type | $+5\ \text{V}$ logic-level trigger (push/pull) |
| Driver | `NSG4437` |
| Series resistance | $330\ \Omega$ per channel |
| Intended load | External igniter input or smart-coil trigger input |
| Channels | 2 (`IGN1`, `IGN2`) |

### 5.2. Design Rationale

Driving ignition coils directly from inside the ECU generates intense localized heat and injects
severe flyback transients into the enclosure. By pushing the high-current switching out to a rugged,
inexpensive igniter mounted in the engine bay, the ECU's thermal and EMI environment stays clean —
and if a coil shorts, the external igniter fails instead of the ECU.

With two channels, a 4-cylinder engine runs **wasted spark**: `IGN1` fires the coils for the
cylinder pair 360° apart (e.g. 1+4), `IGN2` the other pair (2+3). Fully sequential per-cylinder
ignition would require four channels and is not available on this board.

---

## 6. Trigger Input (VR Interface)

Engine position comes in through a dedicated differential VR sensor interface built around the
`MAX9924` IC (pins `VR_POS`/`VR_NEG` — see the
[IO Overview](24p_v1_overview.md#3-io-overview)).

A VR (variable reluctance) sensor outputs an analog voltage swing whose amplitude grows with engine
speed — from well under a volt at cranking to tens of volts at redline. The `MAX9924` handles this
with:

*   **Differential input:** both sensor wires are measured against each other, not against ground,
    so noise induced equally on both wires (the dominant failure mode near ignition wiring) cancels
    out.
*   **Adaptive threshold:** the detection threshold tracks the signal amplitude, so the same wiring
    works from cranking speed to redline without adjustment.
*   **Zero-crossing detection:** the output edge lands on the true magnetic zero crossing, keeping
    the decoded tooth position stable regardless of signal amplitude.

The interface also accepts a conditioned $0$–$5\ \text{V}$ square-wave trigger on `VR_POS` for
non-VR sources — see the
[Volvo distributor-contact case](../../guides/setup/specific/volvo-b2xx.md#324-distributor-contacts)
for the required conditioning circuit.

For a Hall-effect **cam sync** sensor, use one of the general-purpose inputs `SPARE_IN1`/`SPARE_IN2`
(0–5 V digital) and assign it as the cam input in your firmware configuration.

---

## 7. Power Supply

The board takes automotive $12\ \text{V}$ power on two inputs (see the
[IO Overview](24p_v1_overview.md#3-io-overview)):

*   **`VIN_KL30`** — permanent battery feed. Keeps the MCU alive for functions that must survive
    ignition-off (e.g. closing the SD log file cleanly).
*   **`VIN_KL15`** — ignition-switched feed. Tells the ECU the key is on.

### 7.1. Input protection

Both inputs pass through a series Schottky diode (reverse-polarity protection) followed by a TVS
crowbar that clips short transient surges before they reach the voltage regulators — the standard
load-dump environment of an automotive supply is handled by design.

!!! warning "Long-term overvoltage"
    The TVS crowbar protects against *short* surges. Sustained overvoltage above $\sim 20\ \text{V}$
    (e.g. a 24 V jump start) overheats the TVS diode until it fails short. See the
    [product overview](24p_v1_overview.md#3-io-overview).

### 7.2. Internal rails

Behind the protection stage, onboard LDO regulators derive two logic rails:

| Rail | Used for | Exposed on |
| :--- | :--- | :--- |
| $+5\ \text{V}$ | Sensor reference, output buffer, RS232 header | Pin C5, header H3 |
| $+3.3\ \text{V}$ | MCU, logic | Header H2 (SWD) |

The $+5\ \text{V}$ rail on pin C5 is the **sensor reference** — power your TPS, MAP/T-MAP, and other
5 V sensors from it (never from switched +12 V through a divider) so sensor readings stay ratiometric
with the ADC reference.

!!! note "Sensor rail current budget: to be confirmed"
    The rated external load of the $+5\ \text{V}$ sensor rail (how many sensors it can feed with
    what margin) has not been published yet. A typical passive-sensor set (TPS + T-MAP + CLT) draws
    only a few tens of mA and is well within any LDO's capability; for unusual loads (many active
    sensors, external modules), wait for the confirmed figure or measure your own draw.

---

## 8. Communications and Storage

### 8.1. CAN bus

One ISO 11898 CAN channel is exposed on pins A5/B5 (`CAN_H`/`CAN_L`). See
[CAN Bus Basics](../../guides/setup/canbus-basics.md) for wiring and termination rules.

!!! note "Onboard termination: to be confirmed"
    Whether the board fits an onboard $120\ \Omega$ terminator (and whether it is jumper-selectable)
    will be documented here once confirmed against the production board. Until then, verify your bus
    empirically: with everything powered off, measure across `CAN_H`/`CAN_L` — $\approx 60\ \Omega$
    means two terminators are present (correct), $\approx 120\ \Omega$ means only one, open means
    none.

### 8.2. SD card logging

The SD card slot is wired to the MCU's native SDIO interface (not SPI), which is fast enough for
high-rate logging. Use a Class 10 card. Logging behavior (file format, start/stop conditions) is a
firmware feature — rusEFI and Speeduino each document their own SD logging configuration. Logs are
analyzed on a PC with the same tools used for TunerStudio datalogs.

### 8.3. USB

The full-speed USB port serves three roles: the TunerStudio/console connection during setup and
tuning, firmware console access, and DFU firmware flashing (see
[Flashing the PCB](setup/flashing.md#2-usb-dfu-bootloader)).

---

## 9. Technical Appendix

Sections 1–8 above cover what most builders need. The rest of this page shows the math and
component-level detail behind those numbers — read it if you want to verify the thermal limits
yourself, compare driver architectures, or adapt the board for a load outside the summary table.

This section contains the mathematical proofs and detailed component specifications for engineers and advanced users.

### 9.1. A.1. Thermal Analysis

In a 4-injector single-driver setup, the thermal load rises, but the design remains practical when heat is moved into the enclosure efficiently. The IRLR2905 MOSFET stays well within reach of a robust thermal solution when the PCB is coupled to the aluminum case with a thermal pad.

Without that path — PCB junction-to-ambient thermal resistance alone, $R_{\theta JA} = 50\ \text{°C/W}$ per the IRLR2905 datasheet, no thermal pad to the case — the junction temperature rise would be:

$$\Delta T_{\mathrm{JA}} = 3.88\ \text{W} \cdot 50\ \text{°C/W} = 194\ \text{°C}$$

With a 50°C ambient temperature it would reach about **244°C**.

!!! success "Thermal coupling to enclosure"
    A thermal pad drops the effective thermal resistance from the bare-PCB $50\ \text{°C/W}$ above to
    roughly $8.36\ \text{°C/W}$ by giving the heat a low-resistance path into the aluminum case
    (see §A.2.1 for the resulting junction temperatures with this coupling in place).

#### 9.1.1. A.1.1. Loss Calculations

*   **Conduction Losses ($P_{\mathrm{cond}}$)**
    Parallel resistance for 4 injectors is $3\ \Omega$; Peak current at 14V is $4.67\ \text{A}$.
    
    $$P_{\mathrm{cond}} = I_{\mathrm{peak}}^2 \cdot R_{\mathrm{DS(on)}} \cdot D = (4.67\ \text{A})^2 \cdot 0.035\ \Omega \cdot 0.80 \approx 0.61\ \text{W}$$

*   **Inductive Losses ($P_{\mathrm{clamp}}$)**
    At 6000 RPM (100 Hz switching), the energy dumped into the Zener clamp is:
    
    $$P_{\mathrm{clamp}} = E_{\mathrm{clamp}} \cdot f = 0.0327\ \text{J} \cdot 100\ \text{Hz} \approx 3.27\ \text{W}$$

*   **Total Thermal Load**
    
    $$P_{\mathrm{total}} = 0.61\ \text{W} + 3.27\ \text{W} = 3.88\ \text{W}$$

---

### 9.2. A.2. Discrete MOSFET vs. Automotive Smart Driver

Using an automotive smart low-side driver instead of a low-$R_{\mathrm{DS(on)}}$ discrete MOSFET shifts the thermal profile and alters the system's failure mode.

#### 9.2.1. A.2.1. Thermal Comparison

The physics of the inductive load remain identical — the energy from the injector coils must be dissipated. Because smart drivers use an internal active clamp, the $3.27\ \text{W}$ inductive loss remains fixed. However, smart drivers typically have a higher $R_{\mathrm{DS(on)}}$ (for example $70\ \text{m}\Omega$), which increases conduction losses.

| Parameter | Discrete (IRLR2905) | Smart Driver (Typical) |
| :--- | :--- | :--- |
| $R_{\mathrm{DS(on)}}$ | $35\ \text{m}\Omega$ | $70\ \text{m}\Omega$ |
| Conduction Loss | $0.61\ \text{W}$ | $1.22\ \text{W}$ |
| Inductive Loss | $3.27\ \text{W}$ | $3.27\ \text{W}$ |
| Total Thermal Load | $3.88\ \text{W}$ | $4.49\ \text{W}$ |

Using the same enclosure coupling introduced in §A.1 ($8.36\ \text{°C/W}$, PCB-to-case via thermal pad) at a $50\ \text{°C}$ ambient temperature, the smart driver runs hotter ($87.5\ \text{°C}$ vs $82.4\ \text{°C}$).

#### 9.2.2. A.2.2. Architecture & Failure Modes

The discrete IRLR2905 and NCE6005 will continue operating under extreme thermal stress until destructive failure. 

Check operating conditions and heatsinking with this widget.

<div style="margin: 0 0 0.25rem 0; padding: 0;">
  <iframe src="../interactive_heat.html" title="Interactive thermal comparison" style="width: 100%; height: 650px; min-height: 650px; border: 0; display: block; margin: 0;"></iframe>
</div>
<hr style="margin-top: 0.5rem; margin-bottom: 1rem;">

### 9.3. A.3. Analog Input Topology

ESD Protection
:   `USBLC6-2SC6` bidirectional TVS diode placed at the connector to prevent traces from acting as antennas for EMI.

RC Network
:   $R_{\mathrm{series}}$ ($1.8\ \text{k}\Omega$), $R_{\mathrm{shunt}}$ ($3.3\ \text{k}\Omega$), and $C_{\mathrm{shunt}}$ ($100\ \text{nF}$).

Corner Frequency
:   $f_c \approx 1.37\ \text{kHz}$

!!! info "Fault Tolerance"
    The TVS diode is designed to sacrifice itself if 12 V is accidentally applied to an input, maintaining signal purity for normal 0–5V operation.

!!! note "These values are for ratiometric channels (TPS, MAP/T-MAP)"
    The R/C values above are tuned for fast, ratiometric sensors whose signal already spans a wide
    voltage range and needs reasonable bandwidth. The thermistor-based `CLT`/`IAT` channels use a
    different, higher-impedance network with a larger capacitor — see **§A.3.2 Thermistor Channels
    (CLT/IAT)** below for why.

#### 9.3.1. A.3.1. Why Direct-to-MCU Instead of Op-Amp Buffering

A reasonable question when looking at this schematic is: why feed the divider node straight into the
MCU pin, rather than adding an op-amp (e.g. an `MCP6002`) as a unity-gain buffer for level shifting
and isolation? The short answer is that the divider's own source impedance is already low enough for
the ADC to sample directly, so a buffer stage would add cost, board space, and new failure modes
without fixing a problem that exists here.

**1. The divider's Thevenin impedance is already low.**
What matters for direct ADC connection is not the individual resistor values but the impedance the
ADC's sample-and-hold capacitor actually sees, looking back into the node between $R_{\mathrm{series}}$
and $R_{\mathrm{shunt}}$ with the source shorted to AC ground:

$$R_{\mathrm{source}} = R_{\mathrm{series}} \parallel R_{\mathrm{shunt}} = \frac{1.8\ \text{k}\Omega \cdot 3.3\ \text{k}\Omega}{1.8\ \text{k}\Omega + 3.3\ \text{k}\Omega} \approx 1.16\ \text{k}\Omega$$

This is comfortably under the source-impedance figures typically recommended for STM32-class ADCs to
fully charge their internal sampling capacitor within one acquisition phase — see **§A.3.3 ADC
Settling Time Budget** for the worked derivation of that limit on this board's `STM32F405` MCU.
$C_{\mathrm{shunt}}$ also helps: it acts as a small local charge reservoir sitting right at the ADC
pin, supplying the brief burst of charge the sampling capacitor demands so the resistor network
doesn't have to do all the work on its own.

**2. The divider is doing double duty.**
A unity-gain buffer only isolates impedance — it does not scale voltage. The 5 V→3.3 V-range scaling
still has to happen somewhere, either before the buffer (as a divider feeding the buffer's input) or
after it (as a second resistive stage). Either way you keep the resistor network *and* add an active
stage on top of it, rather than replacing one with the other.

**3. What a buffer would actually change.**

| Aspect | Passive divider + RC (used here) | Buffered (e.g. `MCP6002` follower) |
| :--- | :--- | :--- |
| Output impedance at MCU pin | $\approx 1.16\ \text{k}\Omega$ (Thevenin) | $\approx 0\ \Omega$ (op-amp output) |
| Extra supply rail needed | No | Yes — clean rail-to-rail supply per chip |
| Parts per channel | 2 resistors + 1 cap | Same, plus one op-amp channel (2 channels/`MCP6002`) |
| Tolerant of long/high-Z sensor wiring | Only if source impedance stays low | Yes — buffer absorbs it |
| Immune to ADC-mux charge-injection kickback | Only as good as $C_{\mathrm{shunt}}$ + source impedance | Yes — low-Z output soaks up the transient instantly |
| New failure modes | None beyond the existing TVS/passive network | Op-amp output can fail shorted to a rail; offset voltage error (a few mV); potential instability driving $C_{\mathrm{shunt}}$ directly without a series isolation resistor |
| Bill of materials / board space | Minimal | Higher — extra IC, decoupling, routing per channel |

**4. Why it doesn't matter here.**
The ratiometric sensors on this board (TPS, MAP/T-MAP) are moderate-bandwidth signals with modest
source impedance (potentiometers and resistive dividers in the low-kΩ range), read by a single-ended
ADC that samples channels sequentially rather than a fast simultaneous mux bank. Charge-injection
kickback and cable-length-driven source impedance — the two scenarios where a buffer earns its keep —
simply aren't in play. Given that, the passive divider is the simpler, cheaper, and more reliable
choice: fewer parts, no extra supply rail to sequence and decouple, and no new active-component failure
mode sitting between the sensor and the MCU.

The thermistor channels (`CLT`, `IAT`) run a higher Thevenin impedance than TPS/MAP (§A.3.2), but the
same logic still holds: firmware groups them with TPS on the same lower-rate ADC conversion group
(§A.3.3), which already gives them a longer sample time than a design would need to add a buffer for.

!!! tip "When you *would* want a buffer"
    If you're adapting this front-end for a sensor with much higher source impedance (e.g. a
    thermistor with a large pull-up resistor), a long unshielded harness run, or a shared ADC channel
    multiplexed at high speed across many inputs, a unity-gain buffer ahead of the RC filter becomes
    worthwhile. In that case, keep a small series resistor ($10$–$100\ \Omega$) between the op-amp
    output and $C_{\mathrm{shunt}}$ to prevent the op-amp from seeing the capacitor as a direct load,
    which can cause peaking or oscillation.

#### 9.3.2. A.3.2. Thermistor Channels (CLT/IAT): Higher-Z, Heavier Filtering

Coolant Temperature (`CLT`) and Intake Air Temperature (`IAT`) use a two-wire NTC thermistor rather
than a ratiometric sensor like the TPS. A thermistor has no built-in divider of its own — it's just a
variable resistor to ground — so the board has to supply that missing half of the divider itself, and
then filters the result more aggressively than the TPS/MAP channels because a temperature reading has
no need for millisecond-scale response.

**Bias resistor (sensor excitation).**
A $2.7\ \text{k}\Omega$ resistor pulls the raw sensor node up to $+5\ \text{V}$. The external NTC
thermistor, connected between that same node and sensor ground through the harness, forms the other
leg of the divider. As the thermistor's resistance falls with rising temperature, the node voltage
falls too — the classic pull-up/NTC arrangement, sized so the usable temperature range maps to a
reasonable swing across the sensor's resistance curve.

**RC filter stage.**
From that raw node, the signal passes through a series/shunt network before reaching the MCU:

| Component | Role | Value |
| :--- | :--- | :--- |
| $R_{\mathrm{series}}$ | Series resistor into the filter node | $10\ \text{k}\Omega$ |
| $R_{\mathrm{shunt}}$ | Shunt resistor to GND | $18\ \text{k}\Omega$ |
| $C_{\mathrm{shunt}}$ | Shunt capacitor to GND | $1\ \mu\text{F}$ |

Both resistors are roughly $5$–$6\times$ larger than the TPS channel's, and the capacitor is
$10\times$ larger ($1\ \mu\text{F}$ vs. $100\ \text{nF}$). Using the same Thevenin approach as §A.3.1:

$$R_{\mathrm{source}} = R_{\mathrm{series}} \parallel R_{\mathrm{shunt}} = \frac{10\ \text{k}\Omega \cdot 18\ \text{k}\Omega}{10\ \text{k}\Omega + 18\ \text{k}\Omega} \approx 6.43\ \text{k}\Omega$$

$$f_c = \frac{1}{2\pi \cdot R_{\mathrm{source}} \cdot C_{\mathrm{shunt}}} = \frac{1}{2\pi \cdot 6.43\ \text{k}\Omega \cdot 1\ \mu\text{F}} \approx 24.8\ \text{Hz}$$

That's roughly **55× lower** than the TPS channel's $1.37\ \text{kHz}$ corner frequency.

!!! success "Why heavier filtering makes sense here"
    Coolant and intake air temperature are governed by thermal mass — they physically cannot change
    in less than several seconds, let alone milliseconds. There's no downside to pushing the corner
    frequency far lower than on the TPS channel: it rejects far more electrical noise (e.g. injector
    and ignition switching transients coupled onto the long engine-bay harness runs these sensors
    typically use) while still tracking the real signal with enormous margin.

!!! note "Higher source impedance is still fine—the firmware already samples it slower"
    At $\approx 6.43\ \text{k}\Omega$, this channel's Thevenin impedance is higher than the TPS
    channel's $\approx 1.16\ \text{k}\Omega$ (§A.3.1). That's not a problem in practice: rusEFI-style
    firmware already reads `CLT`, `IAT`, and `TPS` together on the same lower-rate ADC conversion
    group (§A.3.3), which uses a much longer sample time than a high-rate channel would get — no
    special accommodation needed, no buffer required. The exact numbers are worked out in **§A.3.3**
    below.

#### 9.3.3. A.3.3. ADC Settling Time Budget: Putting a Number on "Low Enough"

The claims in §A.3.1 and §A.3.2 that these source impedances are "low enough" aren't just a rule of
thumb — they follow from the STM32's own ADC input model and the sample time the firmware actually
uses. This board's [`STM32F405RGT6`](24p_v1_overview.md#3-io-overview) is an F4-family part, so the
following uses ST's F4 ADC characteristics.

**rusEFI's ADC conversion groups.**
rusEFI splits ADC channels into a few independent conversion groups, each with its own sample-time
setting. The relevant one here is the **slow ADC group** (`stm32_adc_v2.cpp` on F4/F7, `stm32_adc_v4.cpp`
on H7) which handles `CLT`, `IAT`, `TPS`, battery voltage, and similar sensors, running at roughly
$500\ \text{Hz}$ with a deliberately long sample time — `ADC_SAMPLE_56` (56 ADC clock cycles) on
F4/F7 parts, or `ADC_SMPR_SMP_16P5` on H7. A separate, shorter-sample-time group exists for channels
that need a higher conversion rate; `TPS` is **not** in that group, so both the ratiometric channel
(§A.3.1) and the thermistor channels (§A.3.2) get the same generous sampling budget below.

**The ADC input model.**
Internally, every STM32 ADC channel looks like a resistor $R_{\mathrm{ADC}}$ (the sampling switch) in
series with a capacitor $C_{\mathrm{ADC}}$ (the sample-and-hold cap). For STM32F4 parts, ST's
datasheet gives approximately:

$$R_{\mathrm{ADC}} \approx 6\ \text{k}\Omega, \qquad C_{\mathrm{ADC}} \approx 12\ \text{pF}$$

During the sampling phase, whatever is driving the pin ($R_{\mathrm{source}}$, the Thevenin impedance
from §A.3.1/§A.3.2) has to charge $C_{\mathrm{ADC}}$ through both resistances in series, giving an RC
time constant of:

$$\tau = (R_{\mathrm{source}} + R_{\mathrm{ADC}}) \cdot C_{\mathrm{ADC}}$$

**How long is available to settle.**
At `ADC_SAMPLE_56`, the sampling phase lasts 56 ADC clock cycles. With the ADC clock at
$21\ \text{MHz}$ on F4 parts, that's:

$$t_{\mathrm{sample}} = \frac{56}{21\ \text{MHz}} \approx 2.67\ \mu\text{s}$$

To resolve a 12-bit conversion to within 1 LSB ($1/4096 \approx 0.0244\%$ of full scale), the RC network
needs roughly $n = 7$ to $9$ time constants to settle ($e^{-9} \approx 1/8100$, comfortably past the
1-LSB target with margin):

$$\tau_{\mathrm{max}} = \frac{t_{\mathrm{sample}}}{n} \approx \frac{2.67\ \mu\text{s}}{7\ \text{to}\ 9} \approx 296\ \text{to}\ 381\ \text{ns}$$

Solving for the maximum tolerable source impedance:

$$R_{\mathrm{source}} \leq \frac{\tau_{\mathrm{max}}}{C_{\mathrm{ADC}}} - R_{\mathrm{ADC}} \approx 18.7\ \text{to}\ 25.7\ \text{k}\Omega$$

**Applying it to this board's two channel types:**

| Channel | $R_{\mathrm{source}}$ (Thevenin) | vs. $18.7$–$25.7\ \text{k}\Omega$ ceiling |
| :--- | :--- | :--- |
| TPS / MAP (§A.3.1) | $\approx 1.16\ \text{k}\Omega$ | $\approx 16$–22× margin — comfortably clear |
| CLT / IAT (§A.3.2) | $\approx 6.43\ \text{k}\Omega$ | $\approx 3$–4× margin — comfortably clear |

!!! success "Both channel types settle with margin to spare"
    Because `TPS`, `CLT`, and `IAT` all share the same $\approx 500\ \text{Hz}$ slow ADC group and its
    56-cycle sample time, even the thermistor channels' higher $6.43\ \text{k}\Omega$ source impedance
    settles with $3$–$4\times$ margin before the conversion completes. The 28-cycle fast group
    (`ADC_SAMPLE_28`, $\approx 1.33\ \mu\text{s}$) exists for channels that need a much higher
    conversion rate than these sensors do — none of the analog inputs described in §A.3.1/§A.3.2 are
    on it, so the tighter timing budget that group implies doesn't apply here.

**A note on the external capacitors.**
A commonly cited generic guideline for a small capacitor placed directly at an ADC pin (with no series
resistor in front of it) is roughly $100\ \text{pF}$ to $1\ \text{nF}$ — just enough to buffer
high-frequency noise without materially loading the pin. $C_{28}$ ($100\ \text{nF}$) and $C_{32}$
($1\ \mu\text{F}$) on this board are both far larger than that. That's intentional, not an oversight:
unlike a bare stabilization cap, these capacitors sit behind a defined series resistor as part of a
purpose-built anti-alias filter with a calculated corner frequency ($1.37\ \text{kHz}$ for TPS/MAP,
$24.8\ \text{Hz}$ for CLT/IAT) — a different design goal than the generic "small cap at the pin" rule,
and one that only works because channels are read sequentially rather than multiplexed at high speed
(which is where a large cap combined with high source impedance would start causing channel-to-channel
crosstalk).

---

### 9.4. A.4. Output Characteristics

All channels are driven by the `SN74ACT244PWR` buffer (rail-to-rail `5 V`, `24 mA` source/sink).

| Specification | NCE6005AS (Relays/Solenoids) | IRLR2905 (Injectors) |
| :--- | :--- | :--- |
| **Gate Resistor** | `1 kΩ` | `220 Ω` *(chosen to maximize switching speed)* |
| **Rise Time (10–90%)** | `~2.15 µs` | `~756 ns` |
| **EMI Corner Frequency ($f_c$)** <br><small>Transition to $-40\text{ dB/dec}$ roll-off</small> | `~148 kHz` <br><small>$f_c = \frac{1}{\pi \cdot t_r}$</small> | `~421 kHz` <br><small>$f_c = \frac{1}{\pi \cdot t_r}$</small> |
| **Design Goal** | Conservative current draw; speed is not critical for slower inductive loads. | Optimized to **minimize switching losses** (reducing time spent in the linear region) and minimize injector dead-time. |