# Wiring and hardware guide

---

## 1. Wiring harness

Most installations are easiest when the harness stays simple and the original loom can be reused where it is still healthy. If the factory loom is intact, keep it as the base and add only the new power, trigger, and sensor wiring needed by the board. If you build a new harness, keep the injector and sensor wiring short, use automotive-grade stranded cable, and avoid routing it next to high-current ignition, starter, or alternator leads.

A few practical rules help a lot:

- Reuse the original injector harness where possible and only add the ECU connector and the new power feeds.
- Use wire with insulation rated for the engine bay and choose a conductor size that keeps voltage drop low under cranking.
- Keep the injector return path and sensor ground consistent, because a poor ground often causes intermittent faults.
- Label the loom clearly and leave enough service slack near the engine and fuse box for future repairs.

---

## 2. Connectors

The board uses automotive-style crimp terminals and connectors. The FCI 24-pin connector pins can be crimped with an SN-48B crimper, which is a good match for the standard open-barrel terminals used on the board. For other connector families such as MX23A, use the matching crimper specified for that terminal series.

A few habits make the harness more reliable:

- Crimp each terminal, then pull-test it before inserting it into the housing.
- Do not rely on the insulation to hold the wire; the crimp must carry the current.
- Use the correct terminal size for the wire gauge and avoid overfilling the connector.
- Add heat-shrink or sealing where moisture, vibration, or splash exposure is expected.

---

## 3. Injector and driver choices

The board supports several injector strategies, and the best choice depends on the engine, the available outputs, and the firmware mode. Batch fire is the simplest and most forgiving option, while sequential injection gives the most control at the cost of needing more driver channels and more careful wiring.

Common choices include:

- 4-cylinder batch fire: a simple starting point that keeps the wiring straightforward and reduces the number of driver channels needed.
- 6- or 8-cylinder bank fire: the same idea can be used with grouped injection events, but the power distribution and trigger wiring still need to be clean and symmetrical.
- Sequential injection: the best choice when you want cylinder-by-cylinder fueling and the board has enough suitable outputs available.

---

## 4. Configurations

### 4.1. 4-cylinder batch fire / 6- or 8-cylinder bank fire

Batch and bank fire setups are usually the easiest place to start. In these modes the injectors are driven as groups rather than one-by-one. Wiring is simpler and tuning easier. 

Recommended wiring practice:

- Feed the injector supply from a fused +12 V line that remains stable during cranking.
- Keep each injector's low-side driver return path short and consistent.
- Provide a solid ground point near the engine or the ECU mounting area.
- If the engine uses a shared injector rail, verify injector polarity and trigger logic before applying power.

For a typical 4-cylinder batch-fire setup, split the injectors across the two dedicated drivers `INJ1` and `INJ2`, two cylinders per driver. Pair cylinders by firing order — the two cylinders 360° apart in the 720° cycle — not by physical position on the block; this is the same grouping used for wasted-spark ignition, and it spaces each driver's pulses evenly across the cycle. See the [Volvo B2xx guide](../../guides/setup/specific/volvo-b2xx.md#7-fueling) for a worked example. For V6 and V8 bank-fire systems, keep the wiring symmetrical so each bank has a similar resistance and routing path.

### 4.2. TBI setup

Throttle-body injection is a good fit when the engine uses a single injector or a simple central injection arrangement. The wiring is usually less complex than multi-port injection, but the supply and ground still need to be robust because the injector current is concentrated in a single load.

Practical notes:

- Use a fused supply that can support the injector's peak current without causing a noticeable voltage drop.
- Keep the injector wiring short and secure, especially near the throttle body.
- If the engine originally used a mechanical or OEM-style relay arrangement, preserve the same power-up behavior so the fuel pump and injector rail behave predictably.
- Verify that the chosen output can handle the injector type and that the firmware mode matches the engine's trigger configuration.

### 4.3. 4-channel sequential injection routing

Although not really needed for most older 4-cylinder engines, sequential injection can provide better idle quality and economy in some situations, but needs more careful tuning. This subsection goes deeper than 4.1/4.2 because getting a 4th sequential channel means repurposing outputs that are dedicated to other jobs elsewhere on this page — worth the detail, since getting it wrong costs you a relay output you didn't expect to lose.

To run a 4-cylinder engine in fully sequential mode, you need four independent injector drivers. The board natively provides two dedicated high-current channels `INJ1` and `INJ2`. To get the remaining two channels, you must repurpose outputs from the two `NCE6005AS` dual-MOSFET chips (`Q3` and `Q4`).

#### 4.3.1. The Hardware Constraints

When mapping the final two injector channels, three strict rules apply:

1. The Thermal Rule: you can only drive one injector per `NCE6005AS` package.
2. The `Q3` (IAC) Restriction: package `Q3` houses the `FAN_RELAY` and `IAC` channels. Because the `IAC` channel has a dedicated freewheeling diode, it cannot be used for an injector without causing slow closing and unstable fueling.
3. The IAC Downgrade: while `IAC` cannot drive an injector, it can be repurposed to drive a standard low-current relay such as a fan or fuel pump.

#### 4.3.2. Valid Sequential Combinations

Because the `IAC` channel is disqualified, the `FAN_RELAY` channel on chip `Q3` must become your 3rd injector. You then have the freedom to choose either `BOOST` or `FP_RELAY` from chip `Q4` as your 4th injector, leaving the remaining channels for relays.

A safe and practical routing is:

| Sequential Channel | Board Output | Chip Used | Function / Load Status |
| :--- | :--- | :--- | :--- |
| Injector 1 | `INJ1` | `IRLR2905` | Dedicated injector driver |
| Injector 2 | `INJ2` | `IRLR2905` | Dedicated injector driver |
| Injector 3 | `FAN_RELAY` | `Q3` | Repurposed to drive injector 3 |
| Injector 4 | `BOOST` | `Q4` | Repurposed to drive injector 4 |
| Fan relay | `IAC` | `Q3` | Drives a relay such as a cooling fan |
| Fuel pump relay | `FP_RELAY` | `Q4` | Remains a standard fuel pump relay |

!!! success "Configuration Summary"
    This routing spreads the thermal load across all available driver packages while avoiding the `IAC` freewheeling diode path for injector operation.

!!! warning "This routing gives up onboard boost control"
    Using `BOOST` as injector 4 means the board has no output left to drive a boost solenoid — full
    4-cylinder sequential injection and onboard closed-loop boost control are mutually exclusive on
    this board. If your build is turbocharged and needs boost control, use `FP_RELAY` as injector 4
    instead and keep `BOOST` free; you'll then need to drive the fuel pump relay from a source other
    than the ECU (for example, an oil-pressure or ECU-power-triggered relay wired independently).

#### 4.3.3. 4-Channel Sequential WITH Active IAC

If the `IAC` output is needed for an idle control valve, the routing options are more constrained. In this case, `Q3` must share its package between the IAC valve and an injector, while `Q4` handles the 4th injector and a relay.

| Sequential Channel | Board Output | Chip Used | Function / Load Status |
| :--- | :--- | :--- | :--- |
| Injector 1 | `INJ1` | `IRLR2905` | Dedicated injector driver |
| Injector 2 | `INJ2` | `IRLR2905` | Dedicated injector driver |
| Injector 3 | `FAN_RELAY` | `Q3` | Repurposed to drive injector 3 |
| Injector 4 | `BOOST` | `Q4` | Repurposed to drive injector 4 |
| Idle control | `IAC` | `Q3` | Drives the IAC valve |
| Relay | `FP_RELAY` | `Q4` | Drives a relay |

This configuration is workable, but it places a continuous PWM load on `Q3` alongside an injector. That raises package temperature, so the output should be treated carefully and only used with healthy, appropriate loads.

!!! warning "To run this safely:"
    - Add a small adhesive heatsink to `Q3` if the IAC is used continuously.
    - Use high-impedance injectors only, typically above $10\,\Omega$, to keep current draw modest.
    - Make sure the IAC valve is healthy and not shorting or drawing excessive current.