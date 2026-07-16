# Hardware Reference
--8<-- "status-reviewed.md"

An overview of the Hüpftronik ECU's enclosure, thermal design, and input/output circuits.

!!! note "Design files"
    The board is currently in alpha testing (see the [product overview](24p_v1_overview.md)) and the
    schematic/PCB source files are not yet published. This page will link to the GitHub repository
    once the design is public.

---

## 1. Enclosure Options

### 1.1. Quick Selection Guide
| Case Choice | Cooling Performance | Effort to Build | Best For |
| :--- | :--- | :--- | :--- |
| **AliExpress 24-Pin Aluminum** | **Excellent** | **Low** (Plug-and-play) | Standard builds, high-performance engines, and harsh environments. |
| **Custom / 3D-Printed** | **Poor** | **High** (Requires custom design) | Test benches or very tight spaces. |


### 1.2. Recommended: AliExpress 24-Pin Aluminum Enclosure
The PCB fits the standard 24-pin cast-aluminum waterproof enclosure and mates directly with its connector. The aluminum shell:

* **Heat sinking:** pulls heat away from the power components.
* **Electrical shielding:** blocks engine-bay electrical noise from reaching the electronics.

![PCB in Case](./hupftronik_motorsteurgerat_24p_v1_in_case.jpg)

!!! tip "Sourcing"
    Search AliExpress or a similar marketplace for "24 pin waterproof aluminum ECU case" — several
    sellers offer this connector/enclosure combination. We don't yet have a vetted single source to
    link to directly; verify the connector pinout matches an FCI 24-pin sealed automotive connector
    (3×8 grid) before buying.

### 1.3. Custom / DIY Solutions
A custom housing works, but you must handle two things yourself:

1. **The connector:** source the 24-pin automotive header separately — it is not a standard part.

2. **The heat:** plastic (3D-printed) cases trap heat. If you use plastic, you **must** add a flat aluminum base plate and couple the PCB to it with a thermal pad.

---

## 2. Keeping it Cool (Thermal Management)

Injector drivers generate heat. With the aluminum enclosure, use a **Thermal Interface Material (TIM) pad** between the PCB and case floor to conduct it into the metal.

| Setup | Heat Level | Cooling Requirement |
| :--- | :--- | :--- |
| **2 Cylinders per Driver** (Standard) | Low | Standard PCB cooling is usually enough. A thermal pad is a good "extra" safety measure. |
| **4 Cylinders per Driver** (High Stress) | High | **Mandatory:** You must use a thermal pad to bridge the heat directly to the aluminum case. |

*(Math: **§A.1 Thermal Analysis** in the Technical Appendix.)*

---

## 3. Sensor Inputs (Analog Inputs)

Analog inputs accept 0–5 V sensors such as TPS, MAP, and temperature sensors. Each signal is protected, filtered, and scaled before reaching the MCU.

### 3.1. Quick Specs
* **Input Voltage:** Accepts 0–5 V (scales it down to 0–3.24 V for the MCU).
* **Filtering:** Removes high-frequency electrical noise.
* **Protection:** Includes a "TVS diode" to protect against static electricity (ESD).
* **Input Load:** The divider presents roughly **5.1 kΩ to ground**. Verify your sensor can drive
  this load — some active sensors (notably certain Bosch MAP sensors) require a minimum load of
  10 kΩ or more. See **§A.3.4**.

### 3.2. How it Works
1. **Protection:** A TVS diode at the connector blocks ESD before it reaches anything else.
2. **Cleaning:** An RC filter smooths out high-frequency noise.
3. **Scaling:** A voltage divider drops the 0–5 V sensor range to the MCU's 3.3 V-safe input range.

*(Circuit details: **§A.3 Analog Input Topology**; why there's no op-amp buffer: **§A.3.1**.)*

### 3.3. Measured Noise at the MCU Pin

This capture was taken at the MCU pin with a throttle-position sensor (TPS) / potentiometer as the
source, after the divider scaled the 0–5 V input to 0–3.24 V (active span $\approx 3.15\ \text{V}$).

![TPS Input Noise at MCU Pin](measurements/input_noise.png)

| Scope Setting | Value |
| :--- | :--- |
| Horizontal | $2.0\ \text{µs/div}$ (@ $1\ \text{GS/s}$) |
| Channel 1 | $200\ \text{µV/div}$, BW limited, DC coupled |
| Measured ripple-RMS ($V_\mathrm{r}$) | $506\ \text{µV}$ ($0.506\ \text{mV}$) |
| DC average | $0.00\ \text{mV}$ |

Residual noise is $\approx 506\ \text{µV}$ RMS, with no coherent interference. Relative to the active
span, the SNR is roughly $76\ \text{dB}$:

$$\text{SNR} = 20 \log_{10}\left(\frac{3.15\ \text{V}}{0.506\ \text{mV}}\right) \approx 75.9\ \text{dB}$$

On the MCU's 12-bit, $3.3\ \text{V}$ ADC ($0.806\ \text{mV/LSB}$), this is about $0.63\ \text{LSB}$;
normal oversampling or firmware filtering keeps readings stable.

!!! tip "What this means in practice"
    A TPS typically spans $\sim 0.5$–$4.5\ \text{V}$ at the connector ($\sim 0.32$–$2.92\ \text{V}$ at the MCU pin), so sub-millivolt noise is negligible. Larger ripple points to sensor-ground routing, the $+5\ \text{V}$ reference return path, or nearby injector/ignition wiring.

---

## 4. Outputs (Low-Side Drivers)

The ECU uses low-side driver MOSFETs as electronic switches for relays, solenoids, and injectors.

### 4.1. Why use discrete MOSFETs?
This board uses discrete MOSFETs rather than smart-driver ICs: they are cheaper, handle more current, and switch faster. For these known relay and injector loads, per-channel monitoring adds little value. *(Full comparison: **§A.2**.)*

### 4.2. The "Translator" (Gate Drive)
The STM32 runs 3.3 V logic, but the MOSFETs switch harder and faster with 5 V on the gate. A **buffer chip (SN74ACT244PWR)** translates the 3.3 V signals into strong 5 V gate drive.

### 4.3. Safety & Protection

#### 4.3.1. Active Clamping (Injectors & Solenoids)
When an injector or solenoid turns off, its collapsing field generates a high-voltage inductive kickback. Injector channels use **active clamping**: a Zener feedback path from Drain to Gate.

*   **How it works:** Once the turn-off spike exceeds the Zener threshold, current feeds back into the Gate and turns the MOSFET slightly back on (into its linear region), dissipating the inductive energy safely in the silicon.

*   **Fast injector closing:** Clamping at a high voltage (settling to $\approx 40\ \text{V}$ on this board) forces the magnetic field to collapse quickly, giving fast, repeatable injector closing times.

*   **Energy handling:** The MOSFET die absorbs the energy spike instead of small discrete diodes.

#### 4.3.2. The IAC Diode (Freewheeling)
The Idle Air Control (`IAC`) channel uses continuous high-frequency PWM. Active clamping would continuously heat the MOSFET.

Instead, its dedicated **freewheeling diode** to $+12\ \text{V}$ recirculates turn-off current at a low voltage drop ($\approx 0.7\ \text{V}$), keeping the MOSFET cool during sustained PWM.

#### 4.3.3. Clamp & Switching Verification
Both the active clamp and the turn-on performance have been verified on the oscilloscope.

##### 4.3.3.1. Injector Turn-Off (Active Clamping Transition)

=== "Detailed Verification Capture"
    ![Active Clamp & Switching Scope Capture](measurements/active_clamp_scope.png)

    *High-detail single-channel capture of MOSFET Drain voltage ($V_{\mathrm{DS}}$, yellow).* During
    the Zener's $\approx 200\ \text{ns}$ turn-on delay, the Drain peaks at about $67\ \text{V}$; the
    $36\ \text{V}$ Zener feedback then settles the clamp at $\approx 40\ \text{V}$.

=== "Logic Signal Correlation"
    ![Injector Closing & Clamping Logic Signal](measurements/injector_closing_clamping_logic_signal.png)

    *Gate drive (CH1, yellow, 2.00 V/div) and Drain voltage ($V_{\mathrm{DS}}$, CH2, blue, 10.0 V/div)
    as the injector closes.* When the gate drive goes low, the Drain rises to the
    $\approx 40\ \text{V}$ clamp level until the field collapses, then returns to the $+12$–$14\ \text{V}$ rail.

##### 4.3.3.2. Injector Turn-On (Charging Transition)

![Injector Opening Drain & Logic Signal](measurements/injector_opening_drain_logic_signal.png)

*Opening transient: gate drive stepping 0 → 5 V (CH1, yellow, 2.00 V/div) and the Drain voltage ($V_{\mathrm{DS}}$, CH2, blue, 10.0 V/div) dropping from battery level to 0 V.*

The steep Drain-voltage fall shows the IRLR2905 turning on quickly. Its brief time in the linear region minimizes switching loss and injector dead time.

??? tip "Why a 67 V spike is safe for the MOSFET"
    The $67\ \text{V}$ peak exceeds the IRLR2905's rated $V_{\mathrm{DSS}} = 55\ \text{V}$, but the
    device simply enters its rated **avalanche breakdown** region for the sub-microsecond transient.
    The MOSFET is avalanche-rated, and the energy transferred in this $200\ \text{ns}$ window is
    orders of magnitude below its ratings
    ($E_{\mathrm{AS}} = 210\ \text{mJ}$, $E_{\mathrm{AR}} = 11\ \text{mJ}$,
    $I_{\mathrm{AR}} = 25\ \text{A}$).

    ??? example "Show avalanche energy calculation"
        The exact avalanche energy is $E = \int V_{\mathrm{DS}}(t) I_{\mathrm{D}}(t)\,\mathrm{d}t$
        and requires the Drain-current waveform. A realistic upper bound uses the peak
        injector-bank current from §A.1.1 — $4.67\ \text{A}$ (four injectors in parallel at
        $14\ \text{V}$) — held at the full $67\ \text{V}$ peak for the entire $200\ \text{ns}$:

        $$E_{\mathrm{avalanche}} \leq V \cdot I \cdot t = 67\ \text{V} \cdot 4.67\ \text{A} \cdot 200\ \text{ns} \approx 0.063\ \text{mJ} = 6.3 \times 10^{-5}\ \text{J}$$

        So at most **about $0.06\ \text{mJ}$** is deposited during the Zener turn-on delay — and the
        real figure is lower, since both voltage and current fall during the transient. Even this
        conservative bound is far below the $210\ \text{mJ}$ single-pulse avalanche rating.

??? note "Scope capture walkthrough"
    *   **Trace roles:** In the dual-channel captures, blue is the Drain voltage ($V_{\mathrm{DS}}$)
        and yellow is the gate drive. In the single-channel clamping zoom, the Drain is the yellow
        trace (sole active channel).
    *   **Zener turn-on delay ($200\ \text{ns}$):** The time it takes for the feedback
        $36\ \text{V}$ Zener (in series with a 1N4148 blocking diode) to start conducting. During
        this delay the Drain briefly spikes to **$\approx 67\ \text{V}$**.
    *   **Clamping plateau:** Once the Zener conducts into the Gate, the clamp settles to a stable
        **$\approx 40\ \text{V}$** — above the $36\ \text{V}$ Zener rating because of the low gate
        resistor value plus the 1N4148 drop. The high clamp voltage minimizes injector closing time
        while dissipating the magnetic energy in the silicon.

---

### 4.4. Output Summary Table

All low-side channels are rated for automotive voltage levels. PCB heat dissipation — not the silicon — sets the practical continuous current limits.

| Channel | Controls | MOSFET Used | Datasheet Max ($I_D$ @ 25°C) | Board Design Limit |
| :--- | :--- | :--- | :--- | :--- |
| `INJ1` & `INJ2` | Fuel Injectors | `IRLR2905` (D-PAK) | `42 A` | **Heatsink-Dependent** <br> Recommended **`< 5 A`** peak |
| `IAC` | Idle Air Control (PWM) | `NCE6005AS` (SOIC-8) | `5 A` | **Heatsink-Dependent** <br> **`< 2.0 A`** peak |
| `BOOST` | Boost Solenoid | `NCE6005AS` (SOIC-8) | `5 A` | **Heatsink-Dependent** <br> **`< 2.0 A`** peak |
| `FAN_RELAY` | Cooling Fan Relay | `NCE6005AS` (SOIC-8) | `5 A` | **Heatsink-Dependent** <br> **`< 2.0 A`** peak |
| `FP_RELAY` | Fuel Pump Relay | `NCE6005AS` (SOIC-8) | `5 A` | **Heatsink-Dependent** <br> **`< 2.0 A`** peak |

<small>\* *The IRLR2905's silicon capability is high, but PCB thermal performance restricts actual continuous current. See the Technical Appendix (§A.1–A.2) for multi-injector bank limits.*</small>

<small>\* *The `NCE6005AS` channels derate harder in proportion: the SOIC-8 package has far less footprint and thermal mass than the D-PAK. No worked calculation is published for this package yet — treat `< 2.0 A` as the practical continuous limit and stay well below the 5 A datasheet maximum on the PCB.*</small>

---

## 5. Ignition Outputs

The two ignition outputs `IGN1` and `IGN2` are **logic-level trigger outputs, not power drivers**.
They command an external igniter (power stage) or a smart coil with a built-in igniter — never an
ignition coil primary directly.

### 5.1. Circuit

Each channel is an `NSG4437` driver stage with a $330\ \Omega$ series resistor, which limits current
into the igniter input and damps ringing so the trigger edge stays clean over a real-world harness
run.

| Specification | Value |
| :--- | :--- |
| Output type | $+5\ \text{V}$ logic-level trigger (push/pull) |
| Driver | `NSG4437` |
| Series resistance | $330\ \Omega$ per channel |
| Intended load | External igniter input or smart-coil trigger input |
| Channels | 2 (`IGN1`, `IGN2`) |

### 5.2. Design Rationale

Driving coil primaries inside the ECU means intense localized heat and severe flyback transients in
the enclosure. Pushing the high-current switching out to a rugged, cheap igniter in the engine bay
keeps the ECU's thermal and EMI environment clean — and if a coil shorts, the external igniter fails
instead of the ECU.

With two channels, a 4-cylinder engine runs **wasted spark**: `IGN1` fires the coil pair 360° apart
(e.g. 1+4), `IGN2` the other pair (2+3). Fully sequential ignition would need four channels and is
not available on this board.

---

## 6. Trigger Input (VR Interface)

Engine position comes in through a dedicated differential VR sensor interface built around the
`MAX9924` IC (pins `VR_POS`/`VR_NEG` — see the
[IO Overview](24p_v1_overview.md#3-io-overview)).

A VR (variable reluctance) sensor's output amplitude grows with engine speed — from well under a
volt at cranking to tens of volts at redline. The `MAX9924` handles this with:

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
    The rated external load of the $+5\ \text{V}$ sensor rail has not been published yet. A typical
    passive-sensor set (TPS + T-MAP + CLT) draws only a few tens of mA and is well within any LDO's
    capability; for unusual loads (many active sensors, external modules), wait for the confirmed
    figure or measure your own draw.

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

<!-- heading-numbering: appendix -->

## Technical Appendix

Sections 1–8 cover the essentials. This appendix provides the calculations and component-level detail
needed to verify limits, compare driver architectures, or adapt the board for other loads.

### A.1. Thermal Analysis

A 4-injector single-driver setup is practical only when heat is coupled to the enclosure. Without
that path — bare-PCB junction-to-ambient resistance of
$R_{\theta JA} = 50\ \text{°C/W}$ per the IRLR2905 datasheet, no thermal pad — the junction
temperature rise would be:

$$\Delta T_{\mathrm{JA}} = 3.88\ \text{W} \cdot 50\ \text{°C/W} = 194\ \text{°C}$$

At a 50°C ambient, that's about **244°C** — far beyond survivable.

!!! success "Thermal coupling to enclosure"
    A thermal pad drops the effective thermal resistance from the bare-PCB $50\ \text{°C/W}$ above to
    roughly $8.36\ \text{°C/W}$ by providing a low-resistance path into the aluminum case.

??? info "Loss calculation ($3.88\ \text{W}$ total)"
    *   **Conduction losses ($P_{\mathrm{cond}}$):** Parallel resistance for four injectors is
        $3\ \Omega$; peak current at 14 V is $4.67\ \text{A}$.

        $$P_{\mathrm{cond}} = I_{\mathrm{peak}}^2 \cdot R_{\mathrm{DS(on)}} \cdot D = (4.67\ \text{A})^2 \cdot 0.035\ \Omega \cdot 0.80 \approx 0.61\ \text{W}$$

    *   **Inductive losses ($P_{\mathrm{clamp}}$):** At 6000 RPM (100 Hz switching), the energy
        dumped into the Zener clamp is:

        $$P_{\mathrm{clamp}} = E_{\mathrm{clamp}} \cdot f = 0.0327\ \text{J} \cdot 100\ \text{Hz} \approx 3.27\ \text{W}$$

    *   **Total thermal load:**

        $$P_{\mathrm{total}} = 0.61\ \text{W} + 3.27\ \text{W} = 3.88\ \text{W}$$

---

### A.2. Discrete MOSFET vs. Automotive Smart Driver

Replacing the low-$R_{\mathrm{DS(on)}}$ discrete MOSFET with an automotive smart low-side driver
changes the thermal profile and failure mode.

At $50\ \text{°C}$ ambient with the §A.1 thermal coupling, a typical smart driver is expected to
run about $5\ \text{°C}$ hotter than the discrete design ($87.5\ \text{°C}$ vs.
$82.4\ \text{°C}$).

??? info "Thermal comparison and interactive model"
        The injector coils' $3.27\ \text{W}$ inductive loss must be dissipated either way. A typical
        smart driver has a higher $R_{\mathrm{DS(on)}}$ (e.g. $70\ \text{m}\Omega$), which doubles the
        conduction loss:

        | Parameter | Discrete (IRLR2905) | Smart Driver (Typical) |
        | :--- | :--- | :--- |
        | $R_{\mathrm{DS(on)}}$ | $35\ \text{m}\Omega$ | $70\ \text{m}\Omega$ |
        | Conduction Loss | $0.61\ \text{W}$ | $1.22\ \text{W}$ |
        | Inductive Loss | $3.27\ \text{W}$ | $3.27\ \text{W}$ |
        | Total Thermal Load | $3.88\ \text{W}$ | $4.49\ \text{W}$ |

        The discrete IRLR2905 and NCE6005 continue operating under extreme thermal stress until
        destructive failure.

        <div style="margin: 0 0 0.25rem 0; padding: 0;">
            <iframe src="../interactive_heat.html" title="Interactive thermal comparison" style="width: 100%; height: 650px; min-height: 650px; border: 0; display: block; margin: 0;"></iframe>
        </div>

### A.3. Analog Input Topology

ESD Protection
:   `USBLC6-2SC6` bidirectional TVS diode placed at the connector to prevent traces from acting as antennas for EMI.

RC Network
:   $R_{\mathrm{series}}$ ($1.8\ \text{k}\Omega$), $R_{\mathrm{shunt}}$ ($3.3\ \text{k}\Omega$), and $C_{\mathrm{shunt}}$ ($100\ \text{nF}$).

Corner Frequency
:   $f_c \approx 1.37\ \text{kHz}$

!!! warning "Active-sensor output loading"
    These resistor values give a low source impedance at the MCU pin, but they also present a
    **5.1 kΩ DC load** to the sensor. Some active sensors — notably certain Bosch MAP sensors —
    require a minimum load resistance of **10 kΩ or more**. Driving them from this divider can
    cause voltage sag and inaccurate readings. See **§A.3.4** for the full analysis and mitigation
    options.

The TVS diode is sacrificial: if 12 V reaches an input, it is intended to fail first. The R/C values
above apply to fast, ratiometric sensors (`TPS`, `MAP`/`T-MAP`). `CLT`/`IAT` use a higher-impedance
network with a larger capacitor; see **§A.3.2 Thermistor Channels (CLT/IAT)**.

??? note "Why the divider sits close to the MCU"
    Component placement matters as much as value selection.

    **TVS at the connector:** The connector is the ESD/EMI entry point, so the TVS clamps transients
    before they spread onto the board. It is effectively out of the signal path when inactive.

    **Divider/filter near the MCU:** A long trace before a series resistor can pick up RF; the
    resistor, capacitance, and protection-diode nonlinearities can then rectify it into an ADC
    offset or noise. Placing $R_{\mathrm{series}}$, $R_{\mathrm{shunt}}$, and
    $C_{\mathrm{shunt}}$ at the MCU minimizes unfiltered trace after the network and shunts picked-up
    RF at the pin.

The divider feeds the MCU directly because its source impedance is already low enough for ADC
sampling. A unity-gain buffer (for example, an `MCP6002`) would add cost, board space, and failure
modes without solving a problem here.

??? info "A.3.1 Why no op-amp buffer is needed"
    **The divider's Thevenin impedance is already low.** What the ADC's sample-and-hold capacitor
    sees is the impedance looking back into the node between $R_{\mathrm{series}}$ and
    $R_{\mathrm{shunt}}$, with the source at AC ground:

    $$R_{\mathrm{source}} = R_{\mathrm{series}} \parallel R_{\mathrm{shunt}} = \frac{1.8\ \text{k}\Omega \cdot 3.3\ \text{k}\Omega}{1.8\ \text{k}\Omega + 3.3\ \text{k}\Omega} \approx 1.16\ \text{k}\Omega$$

    That is comfortably below what STM32-class ADCs need to charge their sampling capacitor within
    one acquisition phase; §A.3.3 gives the worked limit for this board's `STM32F405`.
    $C_{\mathrm{shunt}}$ also sits at the pin as a local charge reservoir.

    **The divider is doing double duty.** A unity-gain buffer isolates impedance but does not scale
    voltage. The 5 V-to-3.3 V scaling still needs a resistor network somewhere, so buffering adds an
    active stage rather than replacing the divider.

    | Aspect | Passive divider + RC (used here) | Buffered (e.g. `MCP6002` follower) |
    | :--- | :--- | :--- |
    | Output impedance at MCU pin | $\approx 1.16\ \text{k}\Omega$ (Thevenin) | $\approx 0\ \Omega$ (op-amp output) |
    | Extra supply rail needed | No | Yes — clean rail-to-rail supply per chip |
    | Parts per channel | 2 resistors + 1 cap | Same, plus one op-amp channel (2 channels/`MCP6002`) |
    | Tolerant of long/high-Z sensor wiring | Only if source impedance stays low | Yes — buffer absorbs it |
    | Immune to ADC-mux charge-injection kickback | Only as good as $C_{\mathrm{shunt}}$ + source impedance | Yes — low-Z output soaks up the transient instantly |
    | New failure modes | None beyond the existing TVS/passive network | Op-amp output can fail shorted to a rail; offset voltage error (a few mV); potential instability driving $C_{\mathrm{shunt}}$ directly without a series isolation resistor |
    | Bill of materials / board space | Minimal | Higher — extra IC, decoupling, routing per channel |

    Buffers help with fast multiplexing or high source impedance from long cable runs; neither
    applies to the main paths here. `TPS` is low-kΩ on the slow path, `MAP`/`T-MAP` use the fast
    path, and `CLT`/`IAT` use the slow path's longer sample time.

    !!! tip "When you *would* want a buffer"
        A unity-gain buffer ahead of the RC filter becomes worthwhile when:

        * the sensor has much higher source impedance (e.g. a thermistor with a large pull-up
          resistor),
        * the sensor has a **strict minimum load-resistance requirement** that the 5.1 kΩ divider
          violates (see §A.3.4),
        * the input uses a long unshielded harness run, or
        * the ADC channel is multiplexed at high speed across many inputs.

        Keep a small series resistor ($10$–$100\ \Omega$) between the op-amp output and
        $C_{\mathrm{shunt}}$ to prevent the capacitor becoming a direct load, which can cause
        peaking or oscillation.

#### A.3.2. Thermistor Channels (CLT/IAT): Higher-Z, Heavier Filtering

Coolant (`CLT`) and Intake Air Temperature (`IAT`) use two-wire NTC thermistors: variable
resistances to ground. The board supplies the other divider half and filters these channels more
heavily than TPS/MAP because temperature does not need millisecond-scale response.

**Bias resistor (sensor excitation).**
A $2.7\ \text{k}\Omega$ pull-up to $+5\ \text{V}$ forms a divider with the NTC. As temperature rises,
the thermistor resistance and node voltage fall; the value gives a useful voltage range.

**RC filter stage.**
From that raw node, the signal passes through a series/shunt network before reaching the MCU:

| Component | Role | Value |
| :--- | :--- | :--- |
| $R_{\mathrm{series}}$ | Series resistor into the filter node | $10\ \text{k}\Omega$ |
| $R_{\mathrm{shunt}}$ | Shunt resistor to GND | $18\ \text{k}\Omega$ |
| $C_{\mathrm{shunt}}$ | Shunt capacitor to GND | $1\ \mu\text{F}$ |

The resistors are $5$–$6\times$ larger than the TPS channel's and the capacitor $10\times$ larger.
Using the same Thevenin approach as §A.3.1:

$$R_{\mathrm{source}} = R_{\mathrm{series}} \parallel R_{\mathrm{shunt}} = \frac{10\ \text{k}\Omega \cdot 18\ \text{k}\Omega}{10\ \text{k}\Omega + 18\ \text{k}\Omega} \approx 6.43\ \text{k}\Omega$$

$$f_c = \frac{1}{2\pi \cdot R_{\mathrm{source}} \cdot C_{\mathrm{shunt}}} = \frac{1}{2\pi \cdot 6.43\ \text{k}\Omega \cdot 1\ \mu\text{F}} \approx 24.8\ \text{Hz}$$

That's roughly **55× lower** than the TPS channel's $1.37\ \text{kHz}$ corner frequency.

!!! success "Why heavier filtering makes sense here"
    Coolant and intake-air temperature change over seconds, so a low corner frequency rejects much
    more injector and ignition noise from long engine-bay harnesses without losing useful signal.

??? note "Why the higher source impedance is still acceptable"
    At $\approx 6.43\ \text{k}\Omega$, the Thevenin impedance is higher than TPS's
    $\approx 1.16\ \text{k}\Omega$, but `CLT`, `IAT`, and `TPS` use the slow ADC group and its long
    sample time. No buffer is needed; see **§A.3.3**.

#### A.3.3. ADC Settling Time Budget: Putting a Number on "Low Enough"

The "low enough" claims in §A.3.1 and §A.3.2 follow from the STM32's own ADC input model and the
sample time the firmware actually uses. This board's
[`STM32F405RGT6`](24p_v1_overview.md#3-io-overview) is an F4-family part, so ST's F4 ADC
characteristics apply.

**rusEFI's ADC conversion groups.**
rusEFI splits ADC channels into independent conversion groups, each with its own sample time and
oversampling. The two that matter for the inputs on this board are:

| Path | Typical inputs | Target rate | Sample cycles (F4/F7) | Oversampling / buffer | Effective raw samples per channel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Slow ADC** | `CLT`, `IAT`, `TPS`, battery voltage, etc. | **~500 Hz** | `ADC_SAMPLE_56` (56 cycles) | `SLOW_ADC_OVERSAMPLE 8` | 8 averaged |
| **Fast ADC** | `MAP`, `MAF`, `HIP`-style inputs | **~10 kHz** | `ADC_SAMPLE_28` (28 cycles) | `ADC_BUF_DEPTH_FAST 4` | 4 averaged |

On F4/F7 these groups are configured in `stm32_adc_v2.cpp`; on H7 they live in
`stm32_adc_v4.cpp`.

On STM32H7, the fast path uses 16.5 sample cycles plus 8.5 conversion cycles, 4× oversampling, and
a roughly 64 µs batch time, while the timer trigger remains 10 kHz. In every case, each raw sample
must settle to 12-bit accuracy within its own sampling window.

??? info "Historical comparison: MegaSquirt I"
    The original MegaSquirt I (Motorola HC08) sampled MAP on the same ADC as the other sensors using a
    **round-robin scheme**: a 10 kHz timer triggered one conversion at a time across eight channels,
    so each channel landed at **1.25 kHz**. With an 8 MHz bus clock and an ADC divide-by-8 setting,
    each conversion took about **11 µs**, leaving **~89 µs** of settling time before the next trigger
    — roughly two orders of magnitude more headroom than this board's microsecond-scale sampling
    windows below, which is why the source-impedance limits here need to be checked explicitly.

**The ADC input model.**
Internally, every STM32 ADC channel looks like a resistor $R_{\mathrm{ADC}}$ (the sampling switch) in
series with a capacitor $C_{\mathrm{ADC}}$ (the sample-and-hold cap). For STM32F4 parts, ST's
datasheet gives approximately:

$$R_{\mathrm{ADC}} \approx 6\ \text{k}\Omega, \qquad C_{\mathrm{ADC}} \approx 12\ \text{pF}$$

During sampling, the source ($R_{\mathrm{source}}$, the Thevenin impedance from §A.3.1/§A.3.2) must
charge $C_{\mathrm{ADC}}$ through both resistances in series:

$$\tau = (R_{\mathrm{source}} + R_{\mathrm{ADC}}) \cdot C_{\mathrm{ADC}}$$

**How long is available to settle.**

For the **slow path** at `ADC_SAMPLE_56` with the F4's ADC clock at $21\ \text{MHz}$:

$$t_{\mathrm{sample,slow}} = \frac{56}{21\ \text{MHz}} \approx 2.67\ \mu\text{s}$$

For the **fast path** at `ADC_SAMPLE_28`:

$$t_{\mathrm{sample,fast}} = \frac{28}{21\ \text{MHz}} \approx 1.33\ \mu\text{s}$$

Settling to within 1 LSB of a 12-bit conversion ($1/4096 \approx 0.0244\%$ full scale) takes about
$n = 7$ to $9$ time constants ($e^{-9} \approx 1/8100$). The resulting source-impedance limits are:

| Path | Sample time | $\tau_{\mathrm{max}}$ | $R_{\mathrm{source,max}}$ |
| :--- | :--- | :--- | :--- |
| **Slow ADC** | $2.67\ \mu\text{s}$ | $296$–$381\ \text{ns}$ | $\approx 18.7$–$25.7\ \text{k}\Omega$ |
| **Fast ADC** | $1.33\ \mu\text{s}$ | $148$–$190\ \text{ns}$ | $\approx 6.3$–$9.8\ \text{k}\Omega$ |

(Computed from $R_{\mathrm{source,max}} = \tau_{\mathrm{max}}/C_{\mathrm{ADC}} - R_{\mathrm{ADC}}$.)

**Applying it to this board's channel types:**

| Channel | ADC path | $R_{\mathrm{source}}$ (Thevenin) | vs. ceiling |
| :--- | :--- | :--- | :--- |
| `TPS` (§A.3.1) | Slow | $\approx 1.16\ \text{k}\Omega$ | ~16–22× margin |
| `CLT` / `IAT` (§A.3.2) | Slow | $\approx 6.43\ \text{k}\Omega$ | ~3–4× margin |
| `MAP` / `T-MAP` (§A.3.1) | Fast | $\approx 1.16\ \text{k}\Omega$ | ~5.5–8.5× margin |

!!! success "Every channel settles with margin to spare"
    `TPS`, `CLT`, and `IAT` use the slow path, where even the thermistor channels retain
    $3$–$4\times$ margin. `MAP` / `T-MAP` use the faster path, with ample margin from their
    low-kΩ divider.

??? note "Why the ADC capacitors are larger than the usual guideline"
    A common guideline for a bare capacitor placed directly at an ADC pin (no series resistor) is
    $100\ \text{pF}$ to $1\ \text{nF}$. $C_{28}$ ($100\ \text{nF}$) and $C_{32}$
    ($1\ \mu\text{F}$) are intentionally larger: they sit behind a defined series resistor as part
    of a purpose-built anti-alias filter with a calculated corner frequency ($1.37\ \text{kHz}$ for
    TPS/MAP, $24.8\ \text{Hz}$ for CLT/IAT). This differs from the generic small-cap rule and works
    because channels are read sequentially rather than multiplexed at high speed, where large
    capacitance and high source impedance could cause channel-to-channel crosstalk.

#### A.3.4. Active Sensor Output Loading (e.g., Bosch MAP)

The 1.8 kΩ / 3.3 kΩ divider gives the ADC low source impedance and clean 5 V → 3.24 V scaling, but
some sensor output stages cannot drive its load.

**DC load presented to the sensor.**
At DC, $C_{\mathrm{shunt}}$ acts as an open circuit, so the sensor sees the full divider chain to
ground:

$$R_{\mathrm{load}} = R_{\mathrm{series}} + R_{\mathrm{shunt}} = 1.8\ \text{k}\Omega + 3.3\ \text{k}\Omega = 5.1\ \text{k}\Omega$$

Some active sensors — notably certain Bosch MAP sensors — specify a minimum allowable pull-down
(or load) resistance of **10 kΩ or more**. Connecting such a sensor to a 5.1 kΩ load can cause:

* output voltage sag (the sensor's output buffer cannot maintain its rated voltage),
* inaccurate pressure readings, and
* overheating or reduced lifetime of the sensor's output stage.

**The scaling is right; the absolute resistor values are the issue.**
The divider ratio is:

$$\frac{R_{\mathrm{shunt}}}{R_{\mathrm{series}} + R_{\mathrm{shunt}}} = \frac{3.3\ \text{k}\Omega}{5.1\ \text{k}\Omega} \approx 0.647$$

This correctly scales 5 V to about 3.24 V. The absolute resistor values are simply too low for a
weak sensor output.

**What would fix it?**
A straightforward solution is to scale the divider resistors up while keeping the ratio roughly the
same. For example, swapping to standard E24 values:

* $R_{\mathrm{series}}$: 1.8 kΩ → **5.6 kΩ**
* $R_{\mathrm{shunt}}$: 3.3 kΩ → **10 kΩ**
* $C_{\mathrm{shunt}}$: keep **100 nF**

This gives:

| Parameter | Current (1.8 kΩ / 3.3 kΩ) | Recommended (5.6 kΩ / 10 kΩ) |
| :--- | :--- | :--- |
| Divider ratio | ~0.647 | **~0.641** |
| Output at 5 V sensor | ~3.24 V | **~3.21 V** |
| DC load on sensor | **5.1 kΩ** | **15.6 kΩ** |
| Thevenin source impedance ($R_{\mathrm{source}}$) | ~1.16 kΩ | **~3.59 kΩ** |
| Filter corner frequency | ~1.37 kHz | **~443 Hz** |
| Slow ADC margin (§A.3.3) | ~16–22× | ~5.2–7.2× |
| Fast ADC margin (§A.3.3) | ~5.5–8.5× | ~1.8–2.8× |

The 15.6 kΩ load exceeds most active-sensor minimums. Its ~3.59 kΩ Thevenin impedance still settles
on both ADC paths, and the ~443 Hz corner remains suitable for MAP/T-MAP smoothing.

**The simpler fix: put MAP on the slow ADC and use much larger resistors.**
For ordinary speed-density fueling and ignition compensation, a **~500 Hz MAP sample rate is more
than enough** — the original MegaSquirt I only sampled MAP at 1.25 kHz and that was already
sufficient for most engines. If you do not need cycle-synchronous trough sampling, the cleanest
fix for the active-sensor loading problem is to:

1. Move `MAP` / `T-MAP` from the fast ADC group to the **slow ADC group** in firmware.
2. Use a high-value divider such as **18 kΩ / 33 kΩ** (or a unity-gain buffer).

This gives a 51 kΩ DC load (easy for almost any active sensor) while the slow ADC's 56-cycle
sample time can still settle the ~11.6 kΩ Thevenin impedance. You lose the ~10 kHz bandwidth, but
for conventional fueling that bandwidth is unnecessary.

**If you need to track the minimum MAP per intake cycle.**
To capture cycle-by-cycle pressure troughs (for engine-position synchronous MAP sampling), the
hardware low-pass filter must not attenuate the pulsation waveform. A target cutoff in the
**1–2 kHz** range is more appropriate than the ~443 Hz produced by the 5.6 kΩ / 10 kΩ / 100 nF
combination.

With the recommended 5.6 kΩ / 10 kΩ resistors ($R_{\mathrm{source}} \approx 3.59\ \text{k}\Omega$),
the capacitor for a given cutoff is:

$$C_{\mathrm{shunt}} = \frac{1}{2\pi \cdot R_{\mathrm{source}} \cdot f_c}$$

| Target $f_c$ | Ideal $C_{\mathrm{shunt}}$ | Nearest standard value | Actual $f_c$ |
| :--- | :--- | :--- | :--- |
| 1 kHz | ~44 nF | **47 nF** | ~943 Hz |
| 1.5 kHz | ~30 nF | **27 nF** | ~1.64 kHz |
| 2 kHz | ~22 nF | **22 nF** | ~2.0 kHz |

A **22 nF** capacitor is a good starting point for high-RPM cycle-synchronous MAP work: it pushes
the hardware corner to about 2 kHz while keeping the same DC load and settling margins. If the MAP
signal is too noisy at that bandwidth, try 47 nF (~943 Hz) as a compromise.

**What does this mean in engine RPM?**
For a 4-cylinder, 4-stroke engine there are two intake strokes per crank revolution, so the MAP
pulsation frequency is:

$$f_{\mathrm{MAP}} = 2 \cdot \frac{\text{RPM}}{60}$$

| Engine speed | MAP pulsation frequency |
| :--- | :--- |
| 1000 RPM | ~33 Hz |
| 2000 RPM | ~67 Hz |
| 4000 RPM | ~133 Hz |
| 6000 RPM | ~200 Hz |
| 8000 RPM | ~267 Hz |

The fundamental pulsation is therefore well below any of the cutoffs above, even at 8000 RPM. The
reason for targeting 1–2 kHz is to preserve the **harmonics and sharp troughs** of the waveform
that synchronous sampling algorithms use to find the true minimum pressure. A 22 nF capacitor with
a ~2 kHz cutoff is comfortably above the 8000 RPM fundamental (~267 Hz) and its lower harmonics.

!!! note "EMI vs. signal fidelity trade-off"
    A higher cutoff preserves the pressure waveform but lets more electrical noise through. Make
    sure the sensor ground and +5 V return routing are clean before raising the cutoff, or pair the
    change with additional firmware-side averaging.

**If you need even lighter loading.**
The 5.6 kΩ / 10 kΩ swap above is usually enough, but if your sensor still cannot tolerate a 15.6 kΩ
load, you can scale further. The comparison below shows the progression from the current values to
the recommended swap and finally to a high-impedance divider:

| Parameter | Current (1.8 kΩ / 3.3 kΩ) | Recommended (5.6 kΩ / 10 kΩ) | High-Z (18 kΩ / 33 kΩ) |
| :--- | :--- | :--- | :--- |
| Divider ratio | ~0.647 | **~0.641** | ~0.647 |
| Output at 5 V sensor | ~3.24 V | **~3.21 V** | ~3.24 V |
| DC load on sensor | **5.1 kΩ** | **15.6 kΩ** | **51 kΩ** |
| Thevenin source impedance ($R_{\mathrm{source}}$) | ~1.16 kΩ | **~3.59 kΩ** | ~11.6 kΩ |
| Slow ADC margin (§A.3.3) | ~16–22× | **~5.2–7.2×** | ~1.6–2.2× |
| Fast ADC margin (§A.3.3) | ~5.5–8.5× | **~1.8–2.8×** | **below budget** |

The 18 kΩ / 33 kΩ divider's ~11.6 kΩ source impedance is acceptable on the slow ADC path but
exceeds the fast-path settling budget. For `MAP`, you must either:

* move `MAP` to the slow ADC group and accept the ~500 Hz update rate, or
* add a unity-gain buffer between the divider and the MCU pin so the ADC sees a low impedance while
  the sensor sees a high one.

**Practical guidance.**
Check each active sensor's datasheet for its minimum load resistance. If it exceeds ~5 kΩ, do not
use the direct 1.8 kΩ / 3.3 kΩ divider. The **5.6 kΩ / 10 kΩ** swap is the recommended first fix:
it suits most sensors while staying within both ADC settling budgets. Passive potentiometric TPS
and NTC thermistors are unaffected because they are not current-limited output buffers.

---

### A.4. Output Characteristics

All channels are driven by the `SN74ACT244PWR` buffer (rail-to-rail `5 V`, `24 mA` source/sink).

| Specification | NCE6005AS (Relays/Solenoids) | IRLR2905 (Injectors) |
| :--- | :--- | :--- |
| **Gate Resistor** | `1 kΩ` | `220 Ω` *(chosen to maximize switching speed)* |
| **Rise Time (10–90%)** | `~2.15 µs` | `~756 ns` |
| **EMI Corner Frequency ($f_c$)** <br><small>Transition to $-40\text{ dB/dec}$ roll-off</small> | `~148 kHz` <br><small>$f_c = \frac{1}{\pi \cdot t_r}$</small> | `~421 kHz` <br><small>$f_c = \frac{1}{\pi \cdot t_r}$</small> |
| **Design Goal** | Conservative current draw; speed is not critical for slower inductive loads. | Optimized to **minimize switching losses** (reducing time spent in the linear region) and minimize injector dead-time. |
