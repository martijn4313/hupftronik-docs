# Plan Your Build

An ECU can only manage what you have planned for. Before you flash firmware, terminate a single wire, or open a tuning dashboard, you need to know what your engine system looks like in full—the injectors the ECU drives, the sensors it reads, and the actuators it commands all trace back to decisions you make here.

Every project differs. Each category below has more than one valid solution, and your engine, goals, and budget determine which is right. Work through them in order and **document your choices**. That document becomes the reference you wire and tune against throughout commissioning.

!!! note "Watch your I/O budget"
    The Motorsteuergerät 24P V1 has a finite number of inputs and outputs. Tally your sensors and actuators against the [pinout documentation](#) as you plan. If a build exceeds the onboard I/O—a full sensor suite with an electronic throttle body, for example—a CAN expander node such as the Schildknappe can offload the overflow.

---

## Fuel Delivery

Fuel delivery is the path from tank to cylinder. Every component in this chain interacts with how the ECU controls fuelling, so the choices here propagate forward into calibration.

**Tank.** No ECU interaction, but the design of your tank—baffling, pickup location, return port—determines how reliably fuel reaches the pump under cornering and acceleration loads.

**Fuel pump.** Sized to your target power level with margin. An undersized pump causes lean conditions under load that software cannot fix.

**Fuel filter.** A maintenance item the ECU does not manage, but one that affects long-term injector health and flow consistency.

**Fuel pressure regulator.** A return-style system uses a regulator to hold a fixed differential above manifold pressure, which simplifies injector dead-time calibration. A returnless system runs fixed rail pressure and requires compensation in the fuel map for pressure variation. Decide which topology you are running before you characterise your injectors.

**Injectors.** Two parameters matter most here: flow rate (cc/min at a known pressure) and impedance (high or low). Flow rate determines your injector scaling constant. Impedance determines whether you need a ballast resistor on your injector circuit—the Motorsteuergerät 24P V1 drives injectors as low-side switches and assumes the appropriate impedance for your chosen firmware configuration. Your injector dead-time—the opening delay that the ECU must compensate for—is injector-specific and will need to be calibrated or sourced from the manufacturer's data.

---

## Intake

The intake system covers everything between the air and the intake ports. Plan this before wiring sensors, since sensor placement depends on the intake topology.

**Air filter and ducting.** The ECU does not manage these directly, but a restrictive filter or poorly routed intake affects the accuracy of your air mass calculation.

**Turbocharger (intake side).** If you run forced induction, the turbo sits in the intake path upstream of the throttle. Plan its location, charge pipe routing, and the intercooler connection before finalising sensor placement.

**Intercooler.** If fitted, the charge air temperature sensor should be placed post-intercooler to give the ECU an accurate reading of what actually enters the manifold.

**Throttle.** This is a significant decision point. A mechanical cable throttle is simpler: the ECU reads position via a TPS and does not command the throttle body directly. An electronic throttle body (ETB) adds a second TPS (pedal-side), a motor driver, and a closed-loop control loop in the firmware. The Motorsteuergerät 24P V1 supports ETB control, but the output count is limited—review your I/O budget before committing to this path. If the onboard outputs are already committed to other actuators, consider offloading ETB control to a Schildknappe node.

---

## Exhaust

The exhaust side is primarily a boost control problem for forced-induction builds. On naturally aspirated engines there is little here the ECU manages beyond optional exhaust gas temperature monitoring.

**Boost control.** The ECU controls a boost solenoid to modulate wastegate pressure and hit a target boost level. Decide your boost strategy—open loop or closed loop—before calibration. Closed-loop boost control requires a MAP sensor rated to your maximum expected boost pressure plus margin.

---

## Sensors

The ECU is only as capable as what it can measure. The sensors below divide into baseline (required for any functioning installation) and optional (required only if your strategy calls for them).

**Baseline sensors.** Every installation needs an intake air temperature (IAT) sensor, a coolant temperature (CLT) sensor, a throttle position sensor (TPS), and a manifold air pressure (MAP) sensor. These four feed the core fuelling and ignition calculations. Running without any of them is possible in a degraded mode but is not a recommended starting point.

**Oxygen sensor.** Decide between wideband and narrowband early—this is not a detail. A narrowband sensor tells the ECU whether combustion is rich or lean of stoichiometric. A wideband sensor measures the actual lambda value across a wide range, which enables closed-loop fuelling across the full operating range and makes base map calibration substantially faster. For any serious tuning work, wideband is the correct choice.

**Exhaust gas temperature (EGT).** Not required for baseline operation but valuable for monitoring thermal load on the exhaust and turbocharger under high-load conditions.

**Flex fuel.** If your engine runs on varying ethanol blends, a flex-fuel sensor feeds the ECU real-time ethanol content, which the firmware uses to adjust fuelling and ignition timing accordingly. Plan this from the start if your fuel supply is not fixed.

**Air mass meter (MAF).** Most speed-density setups—which are the default for the firmwares this board supports—use the MAP sensor as the primary load signal and do not require a MAF sensor. If your strategy is MAF-based, plan accordingly.

---

## Auxiliary

Auxiliary outputs are loads the ECU switches that sit outside the core engine control loop.

**Cooling fan.** The most common auxiliary output. The ECU drives the fan relay via a low-side driver, turning the fan on and off against coolant temperature thresholds you configure in the firmware.

---

## Before You Continue

When you have worked through each category, you should be able to answer the following:

- What injectors, at what flow rate and impedance?
- Mechanical or electronic throttle?
- Wideband or narrowband oxygen sensing?
- Return or returnless fuel system?
- What boost strategy if forced induction?
- What sensors beyond the baseline?
- Do any auxiliary loads push you over the onboard I/O limit?

Once those are settled, return to the Setup and Commissioning guide of the ECU and continue from the firmware selection step.
