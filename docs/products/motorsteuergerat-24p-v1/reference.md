# Hardware Reference

This guide provides a walkthrough of the schematics and PCB designs for the Hüpftronik Engine Control Unit (ECU). 

**Design Files:** All files are available on GitHub: **[Link]**

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
    [Insert specific AliExpress product/search link here]

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

*(For the math behind these requirements, see the **Thermal Analysis** section in the Technical Appendix)*

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

*(For a detailed circuit breakdown, see **Analog Input Topology** in the Technical Appendix)*

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

*  **Fast Injector Closing:** By clamping the inductive spike at a relatively high voltage ($36\text{V}$ in the case of Motorsteurgerat 24P V1), the magnetic field is forced to collapse rapidly. This results in fast and repeatable injector closing times, minimizing injector lag.

*  **Thermal Distribution:** The robust MOSFET silicon absorbs the bulk of the thermal energy spike, preventing small, discrete diodes on the board from overheating.

#### 4.3.2. The IAC Diode (Freewheeling)
Unlike the injectors, the Idle Air Control (`IAC`) channel operates under continuous high-frequency Pulse-Width Modulation (PWM).

*  **The Continuous Duty Challenge:** Because the `IAC` switch cycle repeats thousands of times per minute, using active clamping would dump continuous thermal energy into the MOSFET, leading to rapid overheating.

*  **The Solution:** The `IAC` channel features a dedicated **Freewheeling Diode** routed to $+12\ \text{V}$. When the channel switches off, the inductive current recirculates through this diode at a low voltage drop ($\approx 0.7\ \text{V}$). This shifts the thermal dissipation away from the MOSFET, keeping the driver cool during sustained PWM operation.

---

### 4.4. Output Summary Table

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

### 4.5. Thermal Analysis

In a 4-injector single-driver setup, the thermal load rises, but the design remains practical when heat is moved into the enclosure efficiently. The IRLR2905 MOSFET stays well within reach of a robust thermal solution when the PCB is coupled to the aluminum case with a thermal pad.

Without that path, the junction temperature rise would be:

$$\Delta T_{\mathrm{JA}} = 3.88\ \text{W} \cdot 50\ \text{°C/W} = 194\ \text{°C}$$

With a 50°C ambient temperature it would reach about **244°C**.

!!! success "Thermal coupling to enclosure"
    A thermal pad helps moving heat out of the MOSFET and into the case.

#### 4.5.1. Loss Calculations

*   **Conduction Losses ($P_{\mathrm{cond}}$)**
    Parallel resistance for 4 injectors is $3\ \Omega$; Peak current at 14V is $4.67\ \text{A}$.
    
    $$P_{\mathrm{cond}} = I_{\mathrm{peak}}^2 \cdot R_{\mathrm{DS(on)}} \cdot D = (4.67\ \text{A})^2 \cdot 0.035\ \Omega \cdot 0.80 \approx 0.61\ \text{W}$$

*   **Inductive Losses ($P_{\mathrm{clamp}}$)**
    At 6000 RPM (100 Hz switching), the energy dumped into the Zener clamp is:
    
    $$P_{\mathrm{clamp}} = E_{\mathrm{clamp}} \cdot f = 0.0327\ \text{J} \cdot 100\ \text{Hz} \approx 3.27\ \text{W}$$

*   **Total Thermal Load**
    
    $$P_{\mathrm{total}} = 0.61\ \text{W} + 3.27\ \text{W} = 3.88\ \text{W}$$

---

### 4.6. Discrete MOSFET vs. Automotive Smart Driver

Using an automotive smart low-side driver instead of a low-$R_{\mathrm{DS(on)}}$ discrete MOSFET shifts the thermal profile and alters the system's failure mode.

#### 4.6.1. Thermal Comparison

The physics of the inductive load remain identical — the energy from the injector coils must be dissipated. Because smart drivers use an internal active clamp, the $3.27\ \text{W}$ inductive loss remains fixed. However, smart drivers typically have a higher $R_{\mathrm{DS(on)}}$ (for example $70\ \text{m}\Omega$), which increases conduction losses.

| Parameter | Discrete (IRLR2905) | Smart Driver (Typical) |
| :--- | :--- | :--- |
| $R_{\mathrm{DS(on)}}$ | $35\ \text{m}\Omega$ | $70\ \text{m}\Omega$ |
| Conduction Loss | $0.61\ \text{W}$ | $1.22\ \text{W}$ |
| Inductive Loss | $3.27\ \text{W}$ | $3.27\ \text{W}$ |
| Total Thermal Load | $3.88\ \text{W}$ | $4.49\ \text{W}$ |

Using the same enclosure coupling ($8.36\ \text{°C/W}$) at a $50\ \text{°C}$ ambient temperature, the smart driver runs hotter ($87.5\ \text{°C}$ vs $82.4\ \text{°C}$).

#### 4.6.2. Architecture & Failure Modes

The discrete IRLR2905 and NCE6005 will continue operating under extreme thermal stress until destructive failure. 

Check operating conditions and heatsinking with this widget.

<iframe src="../interactive_heat.html" title="Interactive thermal comparison" style="width: 100%; min-height: 760px; border: 0;"></iframe>

---

### 4.7. Analog Input Topology

ESD Protection
:   `USBLC6-2SC6` bidirectional TVS diode placed at the connector to prevent traces from acting as antennas for EMI.

RC Network
:   $R_{\mathrm{series}}$ ($1.8\ \text{k}\Omega$), $R_{\mathrm{shunt}}$ ($3.3\ \text{k}\Omega$), and $C_{\mathrm{shunt}}$ ($100\ \text{nF}$).

Corner Frequency
:   $f_c \approx 1.37\ \text{kHz}$

!!! info "Fault Tolerance"
    The TVS diode is designed to sacrifice itself if 12 V is accidentally applied to an input, maintaining signal purity for normal 0–5V operation.

---

### 4.8. Output Characteristics

All channels are driven by the `SN74ACT244PWR` buffer (rail-to-rail `5 V`, `24 mA` source/sink).

| Specification | NCE8005AS (Relays/Solenoids) | IRLR2905 (Injectors) |
| :--- | :--- | :--- |
| **Gate Resistor** | `1 kΩ` | `220 Ω` *(chosen to maximize switching speed)* |
| **Rise Time (10–90%)** | `~2.15 µs` | `~756 ns` |
| **EMI Corner Frequency ($f_c$)** <br><small>Transition to $-40\text{ dB/dec}$ roll-off</small> | `~148 kHz` <br><small>$f_c = \frac{1}{\pi \cdot t_r}$</small> | `~421 kHz` <br><small>$f_c = \frac{1}{\pi \cdot t_r}$</small> |
| **Design Goal** | Conservative current draw; speed is not critical for slower inductive loads. | Optimized to **minimize switching losses** (reducing time spent in the linear region) and minimize injector dead-time. |