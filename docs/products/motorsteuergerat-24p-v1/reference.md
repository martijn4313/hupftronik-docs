# Hardware Reference

This guide provides a walkthrough of the schematics and PCB designs for the Hüpftronik Engine Control Unit (ECU). 

**Design Files:** All files are available on GitHub: **[Link]**

This document covers how the ECU is built, how it stays cool, and how the electrical circuits handle signals and power.

---

## Enclosure Options

Choosing the right case is important for protecting the electronics and keeping the unit from overheating.

### Quick Selection Guide
| Case Choice | Cooling Performance | Effort to Build | Best For... |
| :--- | :--- | :--- | :--- |
| **AliExpress 24-Pin Aluminum** | **Excellent** | **Low** (Plug-and-play) | Standard builds, high-performance engines, and harsh environments. |
| **Custom / 3D-Printed** | **Poor** | **High** (Requires custom design) | Test benches or very tight spaces. |

### Recommended: AliExpress 24-Pin Aluminum Enclosure
The PCB is designed specifically to fit the standard 24-pin cast aluminum waterproof enclosure. The connector on the board matches the one provided with these cases perfectly.

Using this aluminum case provides two major benefits:
* **Heat Sinking:** The metal case pulls heat away from the components, preventing them from burning out.
* **Electrical Shielding:** The metal shell acts as a shield, stopping electrical noise from the engine from interfering with the ECU's "brain."

![PCB in Case](./hupftronik_motorsteurgerat_24p_v1_in_case.jpg)

!!! tip "Sourcing"
    [Insert specific AliExpress product/search link here]

### Custom / DIY Solutions
If you prefer your own housing, you can do so, but you must handle two things carefully:

1. **The Connector:** You will need to source the 24-pin automotive header separately, as it is not a standard part.

2. **The Heat:** Plastic (3D printed) cases trap heat. If you use plastic, you **must** design a flat aluminum base plate and use a thermal pad to connect the PCB to that metal plate.

---

## Keeping it Cool (Thermal Management)

The "injector drivers" (the parts that fire your fuel injectors) generate heat. If they get too hot, they will fail.

If you use the aluminum enclosure, you can significantly improve cooling by placing a **Thermal Interface Material (TIM) pad** (a squishy, non-conductive heat pad) between the bottom of the PCB and the inside floor of the case.

| Setup | Heat Level | Cooling Requirement |
| :--- | :--- | :--- |
| **2 Cylinders per Driver** (Standard) | Low | Standard PCB cooling is usually enough. A thermal pad is a good "extra" safety measure. |
| **4 Cylinders per Driver** (High Stress) | High | **Mandatory:** You must use a thermal pad to bridge the heat directly to the aluminum case. |

*(For the math behind these requirements, see the **Thermal Analysis** section in the Technical Appendix)*

---

## Sensor Inputs (Analog Inputs)

Analog inputs are used to read sensors (like temperature or pressure). Because engine bays are "electrically noisy," the signals are cleaned up before they reach the processor.

### Quick Specs
* **Input Voltage:** Accepts 0–5 V (scales it down to 0–3.24 V for the processor).
* **Filtering:** Removes high-frequency electrical noise.
* **Protection:** Includes a "TVS diode" to protect against static electricity (ESD).

### How it Works
1. **Protection:** As soon as the signal enters the board, a diode blocks static shocks from hitting the processor.
2. **Cleaning:** A small network of resistors and a capacitor (an RC filter) smooths out the signal.
3. **Scaling:** The processor can only handle up to 3.3 V. The circuit scales the standard 5 V sensor signal down so it fits safely.

*(For a detailed circuit breakdown, see **Analog Input Topology** in the Technical Appendix)*

---

## Outputs (Low-Side Drivers)

The ECU uses "Low-Side Drivers" to act as electronic switches for relays, solenoids, and injectors.

### Why use discrete MOSFETs?
You might see "Smart Drivers" in other ECUs. We use discrete MOSFETs because they are cheaper, can handle more current, and switch faster. Since we know exactly what we are powering (relays and injectors), we don't need a "smart" chip to monitor them; we just need a strong, fast switch.

### The "Translator" (Gate Drive)
The processor's brain (STM32) speaks in 3.3 V, but the power switches (MOSFETs) work better with 5 V. We use a **Buffer chip (SN74ACT244PWR)** to translate the 3.3 V signal into a strong 5 V signal to ensure the switches open and close as fast as possible.

### 🛡️ Safety & Protection

#### Active Clamping (Injectors & Solenoids)
To protect the switching MOSFETs from the high-voltage inductive "kickback" generated when a solenoid or injector coil turns off, this board utilizes **active clamping** (a feedback path between the Drain and Gate).

*   ⚡ **How it Works:** When the driver turns off, the magnetic field in the injector coil collapses, generating a high-voltage spike. Once this voltage exceeds the Zener diode threshold, current flows back into the MOSFET's Gate. This turns the MOSFET slightly back on (into its linear region) to dissipate the inductive energy safely across its silicon channel.
*   🕒 **Fast Injector Closing:** By clamping the inductive spike at a relatively high voltage (typically $50\text{--}60\ \text{V}$), the magnetic field is forced to collapse rapidly. This results in fast and repeatable injector closing times, minimizing injector lag.
*   🌡️ **Thermal Distribution:** The robust MOSFET silicon absorbs the bulk of the thermal energy spike, preventing small, discrete diodes on the board from overheating.

#### The IAC Diode (Freewheeling)
Unlike the injectors, the Idle Air Control (`IAC`) channel operates under continuous high-frequency Pulse-Width Modulation (PWM).

*   🔄 **The Continuous Duty Challenge:** Because the `IAC` switch cycle repeats thousands of times per minute, using active clamping would dump continuous thermal energy into the MOSFET, leading to rapid overheating.
*   🟢 **The Solution:** The `IAC` channel features a dedicated **Freewheeling Diode** routed to $+12\ \text{V}$. When the channel switches off, the inductive current recirculates through this diode at a low voltage drop ($\approx 0.7\ \text{V}$). This shifts the thermal dissipation away from the MOSFET, keeping the driver cool during sustained PWM operation.

---

### 📊 Output Summary Table

All low-side channels are rated for automotive voltage levels. Due to heat dissipation constraints on the PCB, the practical on-board continuous current limits are lower than the standalone silicon ratings.

| Channel | Controls | MOSFET Used | Datasheet Max ($I_D$ @ 25°C) | Board Design Limit |
| :--- | :--- | :--- | :--- | :--- |
| `INJ1` & `INJ2` | Fuel Injectors | `IRLR2905` (D-PAK) | `42 A` | **Thermally Limited** <br> Recommended **`< 5 A`** peak |
| `IAC` | Idle Air Control (PWM) | `NCE6005AS` (SOIC-8) | `5 A` | **`< 2.0 A`** peak |
| `BOOST` | Boost Solenoid | `NCE6005AS` (SOIC-8) | `5 A` | **`< 2.0 A`** peak |
| `FAN_RELAY` | Cooling Fan Relay | `NCE6005AS` (SOIC-8) | `5 A` | **`< 2.0 A`** peak |
| `FP_RELAY` | Fuel Pump Relay | `NCE6005AS` (SOIC-8) | `5 A` | **`< 2.0 A`** peak |

<small>\* *Note: The IRLR2905's silicon capability is high, but thermal performance on the PCB restricts actual continuous current. Refer to the thermal calculations in Section 1 for multi-injector bank limit details.*</small>

---
# 🛠️ Technical Appendix

This section contains the mathematical proofs and detailed component specifications for engineers and advanced users.

### 1. Thermal Analysis

!!! warning "The 4-Injector Single-Driver Constraint"
    If a 4-cylinder engine reuses an original wiring loom (or you have an 8- or 6-cylinder with 2 injector banks) that connects all injectors of a bank to one channel, the heat increases drastically. 

    Without heatsinking, the IRLR2905 MOSFET (with an ambient air resistance of $R_{\theta\mathrm{JA}} = 50\ \text{°C/W}$) would experience a junction temperature rise of:

    $$\Delta T_{\mathrm{JA}} = 3.88\ \text{W} \cdot 50\ \text{°C/W} = 194\ \text{°C}$$

    Adding a 50°C engine bay ambient temperature results in **244°C**, far exceeding the 175°C silicon limit.

#### Loss Calculations

*   **Conduction Losses ($P_{\mathrm{cond}}$)**
    Parallel resistance for 4 injectors is $3\ \Omega$; Peak current at 14V is $4.67\ \text{A}$.
    
    $$P_{\mathrm{cond}} = I_{\mathrm{peak}}^2 \cdot R_{\mathrm{DS(on)}} \cdot D = (4.67\ \text{A})^2 \cdot 0.035\ \Omega \cdot 0.80 \approx 0.61\ \text{W}$$

*   **Inductive Losses ($P_{\mathrm{clamp}}$)**
    At 6000 RPM (100 Hz switching), the energy dumped into the Zener clamp is:
    
    $$P_{\mathrm{clamp}} = E_{\mathrm{clamp}} \cdot f = 0.0327\ \text{J} \cdot 100\ \text{Hz} \approx 3.27\ \text{W}$$

*   **Total Thermal Load**
    
    $$P_{\mathrm{total}} = 0.61\ \text{W} + 3.27\ \text{W} = 3.88\ \text{W}$$

---

### 2. Analog Input Topology

ESD Protection
:   `USBLC6-2SC6` bidirectional TVS diode placed at the connector to prevent traces from acting as antennas for EMI.

RC Network
:   $R_{\mathrm{series}}$ ($1.8\ \text{k}\Omega$), $R_{\mathrm{shunt}}$ ($3.3\ \text{k}\Omega$), and $C_{\mathrm{shunt}}$ ($100\ \text{nF}$).

Corner Frequency
:   $f_c \approx 1.37\ \text{kHz}$

!!! info "Fault Tolerance"
    The TVS diode is designed to sacrifice itself if 12 V is accidentally applied to an input, maintaining signal purity for normal 0–5V operation.

---

### 3. Output Characteristics

All channels are driven by the `SN74ACT244PWR` buffer (rail-to-rail `5 V`, `24 mA` source/sink).

| Specification | NCE8005AS (Relays/Solenoids) | IRLR2905 (Injectors) |
| :--- | :--- | :--- |
| **Gate Resistor** | `1 kΩ` | `220 Ω` *(chosen to maximize switching speed)* |
| **Rise Time (10–90%)** | `~2.15 µs` | `~756 ns` |
| **EMI Corner Frequency ($f_c$)** <br><small>Transition to $-40\text{ dB/dec}$ roll-off</small> | `~148 kHz` <br><small>$f_c = \frac{1}{\pi \cdot t_r}$</small> | `~421 kHz` <br><small>$f_c = \frac{1}{\pi \cdot t_r}$</small> |
| **Design Goal** | Conservative current draw; speed is not critical for slower inductive loads. | Optimized to **minimize switching losses** (reducing time spent in the linear region) and minimize injector dead-time. |

!!! note "Wiring, Noise, & Troubleshooting Guide"
    The injector drivers are optimized for rapid switching to keep thermal losses and injector lag as low as possible. In a typical vehicle installation, this high-speed switching behaves as follows:

    *   🔌 **Natural Harness Filtering**  
        The physical length and parasitic inductance of the engine wiring harness tend to act as a natural low-pass filter, which typically attenuates high-frequency EMI emissions before they can radiate significantly.

    *   🌀 **Wire Twisting (Highly Recommended)**  
        When constructing or modifying the wiring loom, twist each injector's switched ground (low-side) wire together with its corresponding `+12V` supply wire. This minimizes the physical loop area of the circuit, leveraging field cancellation to reduce radiated electromagnetic interference (EMI) at the source.

    *   🛠️ **Interference Troubleshooting**  
        If electrical noise couples into highly sensitive sensor signals (such as variable reluctance crank or cam sensors) through the wiring loom, the `220 Ω` gate resistor on the injector channel can be replaced with a higher value (e.g., `470 Ω` or `1 kΩ`) as a last resort. This slows down the switching transition and reduces high-frequency emissions, though it will slightly increase the driver's thermal output.


        Here is a new section that perfectly maps out how to achieve a 4-channel sequential injection setup while respecting the board's hardware and thermal constraints.

***

### 🚀 4-Channel Sequential Injection Routing

To run a 4-cylinder engine in fully sequential mode, you need four independent injector drivers. The board natively provides two dedicated high-current channels (`INJ1` and `INJ2`). To get the remaining two channels, you must repurpose outputs from the two `NCE6005AS` dual-MOSFET chips (`Q3` and `Q4`).

#### The Hardware Constraints
When mapping the final two injector channels, three strict rules apply:

1.  **The Thermal Rule:** As established, you can only drive **one injector per `NCE6005AS` package**. 
2.  **The `Q3` (IAC) Restriction:** Package `Q3` houses the `FAN_RELAY` and `IAC` channels. Because the `IAC` channel has a dedicated freewheeling diode (which prevents the high-voltage inductive spike needed for fast injector closing), **the `IAC` channel can NEVER be used for an injector**. Doing so will result in a severely "lazy" closing time and unpredictable fueling.
3.  **The IAC Downgrade:** While `IAC` cannot drive an injector, it *can* safely be repurposed to drive a standard low-current relay (such as a fan or fuel pump).

#### Valid Sequential Combinations

Because the `IAC` channel is disqualified, the `FAN_RELAY` channel on chip `Q3` **must** become your 3rd injector. You then have the freedom to choose either `BOOST` or `FP_RELAY` from chip `Q4` as your 4th injector, leaving the remaining channels for relays.

Here is the most safe valid configurations for 4-channel sequential injection:

**Using BOOST as an Injector**

| Sequential Channel | Board Output | Chip Used | Function / Load Status |
| :--- | :--- | :--- | :--- |
| **Injector 1** | `INJ1` | `IRLR2905` | Dedicated Injector Driver |
| **Injector 2** | `INJ2` | `IRLR2905` | Dedicated Injector Driver |
| **Injector 3** | `FAN_RELAY` | `Q3` | **Repurposed:** Drives Injector 3 |
| **Injector 4** | `BOOST` | `Q4` | **Repurposed:** Drives Injector 4 |
| *Fan Relay* | `IAC` | `Q3` | **Downgraded:** Drives a Relay (e.g., Cooling Fan) |
| *Fuel Pump Relay* | `FP_RELAY` | `Q4` | Remains standard Fuel Pump Relay |

!!! success "Configuration Summary"
    By following this routing you spread the thermal load across all available driver packages (one injector per SOIC-8 chip) while safely avoiding the freewheeling diode on the `IAC` channel. All leftover channels safely serve as low-current relay triggers.


### 🔄 4-Channel Sequential WITH Active IAC

Since you must use the `IAC` channel for the IAC valve (due to its necessary freewheeling diode and PWM capabilities), your routing options are strictly locked into a specific configuration to satisfy the "one injector per package" rule.

#### The Configuration

To keep the IAC, `Q3` must share its package between the IAC valve and an injector. `Q4` will handle the 4th injector and a standard relay.

| Sequential Channel | Board Output | Chip Used | Function / Load Status |
| :--- | :--- | :--- | :--- |
| **Injector 1** | `INJ1` | `IRLR2905` | Dedicated Injector Driver |
| **Injector 2** | `INJ2` | `IRLR2905` | Dedicated Injector Driver |
| **Injector 3** | `FAN_RELAY` | `Q3` | **Repurposed:** Drives Injector 3 |
| **Injector 4** | `BOOST` | `Q4` | **Repurposed:** Drives Injector 4 |
| *Idle Control* | `IAC` | `Q3` | **Standard:** Drives the IAC Valve |
| *Relay A* | `FP_RELAY` | `Q4` | Remains standard Relay trigger |

By running both an **Injector** (`FAN_RELAY`) and the **IAC Valve** (`IAC`) on chip `Q3`, you are pairing a low-duty-cycle load (the injector) with a continuous high-frequency PWM load (the IAC). 
   
While the freewheeling diode on the `IAC` channel significantly reduces the heat generated by the IAC's inductive spikes, the continuous PWM current will still raise the baseline temperature of the `Q3` package. 

!!! warning "To run this safely:"
    *   Add a small adhesive **heatsink** to Q3 or risk damaging the device.

    *   **High-Impedance Only:** You absolutely must use high-impedance (high-Z) fuel injectors ($>10\ \Omega$) to keep the injector current draw as low as possible (typically $\approx 1\ \text{A}$ peak).

    *   **Healthy IAC Valve:** Ensure your IAC valve is in good condition and not shorting or pulling excessive current.
