# Hardware Reference

This guide provides a detailed walkthrough of the schematics and PCB designs. All design files are available on GitHub: **[Link]**

## Analog Inputs

### Quick scan
!!! info "Quick Scan: Analog Inputs"
    | Parameter | Specification |
    | :--- | :--- |
    | **Input Voltage Range** | $0\text{--}5\ \mathrm{V}$ $\rightarrow$ $0\text{--}3.24\ \mathrm{V}$ |
    | **Filtering** | RC Low-pass filter ($\approx 1.37\ \mathrm{kHz}$) |
    | **Protection** | Point-of-entry TVS for ESD/EMI mitigation |
    | **Philosophy** | Prioritizes signal purity over abuse-protection ($12\ \mathrm{V}$ faults are an acceptable failure mode) |

### Circuit Topology
Each channel passes through two stages before reaching the MCU:

1. **At the Connector (ESD Protection):** A `USBLC6-2SC6` bidirectional TVS diode clamps ESD and transient events immediately at the point of entry.
2. **At the MCU (Scaling & Filtering):** A passive RC network handles signal conditioning:
    * **$R_{series}$ (1.8 k$\Omega$):** Sets the scaling and filter corner.
    * **$R_{shunt}$ (3.3 k$\Omega$):** Pulls the downstream node to ground.
    * **$C_{shunt}$ (100 nF):** Sits in parallel with $R_{shunt}$ to filter high-frequency noise.

#### Technical Specifications

| Parameter | Description |
| :--- | :--- |
| **Scaling** | $R_{series}$ and $R_{shunt}$ form a resistive divider that scales the $0\text{--}5\ \mathrm{V}$ input down to $0\text{--}3.24\ \mathrm{V}$, fitting within the STM32F405's $3.3\ \mathrm{V}$ ADC reference. |
| **Filtering** | The combination of the series resistance and $C_{shunt}$ creates a low-pass filter with a corner frequency of approximately $1.37\ \mathrm{kHz}$. |

### Design Rationale

**Protection Placement & EMI Mitigation:** The TVS diode is placed immediately at the connector rather than the MCU for two reasons. First, clamping at the entry point ensures the protection is where the threat arrives; a TVS placed further down the trace protects the pin, but leaves the trace itself vulnerable. Second, by shunting transients to ground at the point of entry, we prevent the analog traces from acting as antennas that could radiate electromagnetic interference (EMI) into other sensitive areas of the PCB.

**Impedance Management:** The RC filter is positioned at the MCU to keep the analog trace low-impedance from end to end. Placing a high-value resistor at the connector would reduce noise but effectively turn the entire trace into an antenna. The chosen values balance ADC input requirements against sensor loading to maximize noise immunity.

**Fault Tolerance:** If 12 V is accidentally applied to an analog input, the `USBLC6-2SC6` will conduct heavily and may be destroyed. This is an acceptable failure mode. We distinguish between **invisible threats** (ESD) and **active errors** (incorrect wiring). Designing for the latter with the same weight as the former would compromise signal quality for 99.9% of normal operation to guard against a scenario already outside the operating specification.

## Low-side driver outputs

The board provides six low-side switched outputs across two MOSFET topologies. All channels are driven from a SN74ACT244PWR buffer with 5 V supply and protected by a common active clamp scheme; the IAC channel adds a freewheeling diode for reasons described below.

### Why discrete MOSFETs and not smart high-side drivers

The obvious alternative to this design is a smart power IC — an Infineon BTS, ST VND, or similar integrated high-side switch with built-in current limiting, thermal shutdown, and fault reporting.

!!! standpunkt "Standpunkt"
    Smart high-side drivers are genuinely useful parts. They are not useful here. The loads on this board are relays, solenoids, and injectors — well-understood, current-limited loads that do not need a chip to babysit them. What they need is low Rds(on) and a gate drive circuit that can actually switch them hard. Discrete MOSFETs deliver both for a fraction of the cost. The protection that matters — transient suppression — is handled externally with passive components that are cheaper, faster, and more transparent than an integrated protection FSM. The tradeoff is that we own the gate drive design. That turns out to be a one-resistor and one-buffer job.

### Gate drive: SN74ACT244PWR buffer

The STM32F405 GPIOs operate at 3.3 V with limited drive current. Driving MOSFETs directly from a 3.3 V GPIO has two problems: first, 3.3 V Vgs is above threshold but below the Vgs values at which both parts reach their datasheet Rds(on) spec (typically characterised at 4.5 V or 10 V). Second, 3.3 V logic leaves meaningful margin on the table in terms of switching speed — a lower drive voltage means slower charging of Ciss.

A SN74ACT244PWR octal buffer solves both. The ACT family accepts TTL-level inputs (VIH = 2.0 V), so the 3.3 V STM32 outputs drive it cleanly. The buffer switches its outputs rail-to-rail to 5 V, and can source or sink up to 24 mA per channel. All six output channels run through this buffer before reaching their gate resistors.

### Protection topology

**Active clamp** — All channels use a BZT52C36S 36 V zener in series with a 1N4148WS signal diode from drain to ground. When the driver switches off an inductive load, the resulting voltage spike is clamped at approximately 36 V, and the inductive energy is dissipated in the zener. The signal diode blocks reverse conduction during normal operation.

**Freewheeling diode** — The IAC channel adds an SS210 Schottky diode from drain to VIN_KL30. During the off-phase of each PWM cycle, this provides a low-impedance recirculation path for the solenoid current, bypassing the active clamp entirely.

!!! standpunkt "Standpunkt"
    The SS210 on IAC is the only freewheeling diode on the board, and it earns its place. IAC is the only output running continuous PWM at meaningful frequencies — every other channel is effectively on/off. Without the freewheeling path, every switching edge dumps the solenoid's inductive energy into the zener. That is acceptable occasionally; it becomes a sustained thermal load at PWM frequencies. The other channels do not have this problem, so they do not get the diode.

### NCE8005AS — relay and solenoid drivers

Four channels use the NCE8005AS, a dual logic-level N-channel MOSFET in SOP-8. Two ICs cover the four outputs. Gate drive is through a 1 kΩ series resistor.

| Channel | Function | Protection |
|---|---|---|
| IAC | PWM idle air control solenoid | Active clamp + SS210 freewheeling to VIN_KL30 |
| FAN_RELAY | Cooling fan relay | Active clamp |
| BOOST | Boost control solenoid | Active clamp |
| FP_RELAY | Fuel pump relay | Active clamp |

**Switching characteristics** — Using Ciss ≈ 979 pF (verify against your NCE8005AS datasheet; NCE6005AS reference value used here):

| Parameter | Value |
|---|---|
| Gate resistor | 1 kΩ |
| Peak gate current (t=0) | 5.0 mA |
| RC time constant τ | 979 ns |
| Gate reaches Vth (~2.5 V) | ~679 ns |
| Rise time 10–90% | ~2.15 µs |

These are on/off channels (IAC excepted), so the ~2 µs rise time is inconsequential. The 1 kΩ gate resistor is a conservative choice that keeps gate current well within the buffer's drive capability.

### IRLR2905 — injector drivers

Both injector channels use a discrete IRLR2905 (55 V, 42 A, logic-level gate). Gate drive is through a 220 Ω series resistor — significantly lower than the solenoid channels — to prioritise fast switching. Injector closing time is directly determined by how quickly Vgs collapses after the drive signal goes low; slower switching means later-than-commanded closure and a real fuel delivery error. No freewheeling diode is fitted; the active clamp handles the inductive spike and the faster collapse is intentional.

| Channel | Function | Protection |
|---|---|---|
| INJ1 | Injector 1 | Active clamp |
| INJ2 | Injector 2 | Active clamp |

**Switching characteristics** — Ciss = 1562 pF (datasheet typ, Vds = 25 V):

| Parameter | Value |
|---|---|
| Gate resistor | 220 Ω |
| Peak gate current (t=0) | 22.7 mA |
| RC time constant τ | 344 ns |
| Gate reaches Vth (~2.0 V) | ~176 ns |
| Rise time 10–90% | ~756 ns |

The 220 Ω gate resistor is close to the lower limit given the ACT244's 24 mA output rating — peak gate current at turn-on is 22.7 mA. Going lower would risk exceeding the buffer's continuous output current limit. Going higher is the right move if EMI becomes a concern on a future board revision.
