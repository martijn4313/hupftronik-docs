# Setup and Commissioning
--8<-- "status-reviewed.md"

This sub-sections in this guide detail the process for bringing the Motorsteuergerät 24P V1 online.

This page provides a brief outline of the steps involved and links to more detailed information.

---

## 1. Overview

The Motorsteuergerät 24P V1 serves as a hardware platform designed to host open-source ECU firmware. It ships entirely blank. You intentionally choose the software ecosystem that matches your specific engineering goals and engine requirements. Currently, the board fully supports **rusEFI** and **Speeduino**.

---

## 2. Plan Your Build

Before you flash firmware or terminate a single wire, you need to know what you are building. Fuel delivery, intake, exhaust, sensors, and auxiliary loads all require explicit decisions before any of the later steps make sense—and your choices here directly constrain your wiring and calibration later.

Work through the [Plan Your Build](../../../guides/setup/planning.md) guide before continuing.

---

## 3. Firmware Architecture: Choosing Your Path

!!! info "Choose Deliberately"
    Choosing your firmware is your first act of intentionality. We do not provide a "default" binary because the board ships blank on purpose: you decide which ecosystem matches your goals. Both run well on the STM32F405RGT6—they just use its silicon in very different ways. Optimize for your intended use case.

Two firmwares, two philosophies. For most users, this is enough to decide:

*   **Choose rusEFI** if you want maximum tuning depth, complex trigger decoding, and sophisticated diagnostics, and you don't mind a steeper learning curve.
*   **Choose Speeduino** if you want simplicity, transparent execution logic, and the easiest entry point into editing the source.

??? info "Why the architectures differ: RTOS vs. Superloop"
    The two firmwares take fundamentally different approaches to running on the MCU.

    **rusEFI: the RTOS approach.** rusEFI runs on a **ChibiOS** core—an embedded Real-Time Operating System (RTOS) where the OS schedules and handles hardware events. This pushes the STM32F405RGT6 to its limits to deliver advanced tuning strategies and complex engine management. It demands more processing overhead but provides a highly structured, multi-threaded environment.

    **Speeduino: the superloop approach.** Speeduino relies on the **Arduino Core**. It operates on a "superloop" structure: a continuous main loop with hardware timers and interrupts directly driving the outputs. The STM32F405RGT6 is massively overpowered for this framework, so the result is extremely low overhead, near-instantaneous execution for basic tasks, and a significantly lower barrier to entry if you want to modify the source.

---

## 4. Compilation and Flashing

The project intentionally omits prebuilt binaries from the main upstream repositories. You compile the image from source. This ensures you run the exact version that matches your hardware revision and prevents "black box" deployments where you do not understand what runs on your hardware.

**Quick Scan: Flashing Requirements**

*   **Target MCU:** STM32F405RGT6
*   **Interface:** USB DFU or SWD ($3.3\text{V}$ logic) — see [Flashing the PCB](flashing.md)
*   **Toolchain:** ARM GCC (rusEFI) or Arduino IDE / PlatformIO (Speeduino)

**The Workflow**

1.  Clone the repository for your chosen firmware.
2.  Configure the build target specifically for the Motorsteuergerät 24P V1 hardware profile. Check
    the firmware repository's board list for the current profile name — it's tracked there, not
    duplicated here, so this page doesn't go stale when the profile is renamed upstream.
3.  Compile the binary image.
4.  Connect your SWD or USB adapter to the board's flashing header.
5.  Execute the flash command and verify the sequence completes without errors.

See [Flashing the PCB](flashing.md) for the concrete DFU and SWD flashing steps once you have a
compiled `.bin` or `.hex` file.

---

## 5. Wiring and Integration

!!! standpunkt "The Standpunkt: Optimize for Intended Use, Not Potential Abuse"
    We optimize the board for signal integrity, not user-proofing. Systemic threats—such as EMI, thermal loads, and ground loops—are mitigated by the hardware design. However, incorrect wiring is a user error and remains an **acceptable failure mode**. If you reverse polarity or dead-short a high-side driver, the component will fail. Wiring requires absolute intentionality.

**Quick Scan**

*   **System Power:** $12\text{V}$ to $14.4\text{V}$ DC nominal
*   **Logic Power:** $5\text{V}$ DC and $3.3\text{V}$ DC (Internal LDOs)
*   **Grounding:** Strict Star Ground topology (Sensor ground is isolated from power ground)

**Technical Detail**

The wiring sequence directly dictates system safety. Follow this progression:
1.  **Power & Ground:** Terminate the main battery connection and primary grounds first. Verify that the supply voltage rests securely within the required limits.
2.  **Sensors & Actuators:** Wire inputs and outputs strictly according to the pinout documentation. Keep sensor grounds physically separated from high-current switching grounds on your harness.
3.  **Communications:** Connect the CAN bus ($120\Omega$ terminated) or serial lines only after verifying power stability.

**Design Rationale**

Why do we enforce strict ground separation and offer no reverse-polarity hand-holding on every I/O pin? Every series protection diode or PTC fuse introduces a voltage drop, changes the filter time constant, or increases the thermal load on the board. We prioritize a clean, fast signal path—where $R_{series}$ and $C_{shunt}$ are optimized purely for actual sensor bandwidth—over protecting the board from a miswired harness. A multimeter and careful pin-out verification prevent avoidable failures without compromising engine performance.

---

## 6. Verification and Testing

Once powered, perform a staged verification. Do not rush this process.

1.  **Heartbeat:** Observe the status LEDs to confirm the MCU successfully executes code.
2.  **Communication:** Connect to your tuning dashboard (e.g., TunerStudio) to verify active serial/USB communication.
3.  **Diagnostics:** Check for fault LEDs or software-reported configuration errors in the dashboard.
4.  **I/O Validation:** Verify that sensor inputs read within expected physical ranges (e.g., Coolant and Intake Air temperatures match ambient) and trigger outputs correctly in test mode.

Do not proceed to live engine testing until the board communicates reliably and you verify every physical connection.

---

## 7. Next Steps

With the hardware online and communicating, you move into the calibration phase.

*   **Firmware Configuration:** Define cylinder counts, trigger wheel decoder settings, and base sensor calibrations — see the [rusEFI](rusefi.md) or [Speeduino](speeduino.md) setup guide for your chosen firmware.
*   **Actuator Calibration:** Set precise dead-times for injectors and base duty cycles for idle control valves — see [Calibration and Dynamic Testing](calibration.md).
*   **Dynamic Testing:** Proceed to functional tests on the target vehicle, from first start through loaded testing — also covered in [Calibration and Dynamic Testing](calibration.md#6-first-start-and-dynamic-testing).
