# Flashing the Board
--8<-- "status-reviewed.md"

---

## 1. What is flashing?

Flashing means copying the engine-control firmware into the memory of the MCU (microcontroller) on
the board — either installing firmware for the first time or replacing it with a new version. The
board cannot do anything until it has firmware on it.

This page shows the basic steps to update the STM32F405 used on the Motorsteuergerät 24P v1. It
assumes you already have a firmware `.bin` or `.hex` file — see [Setup and
Commissioning](index.md#4-compilation-and-flashing) for compiling one from source for your chosen
firmware (rusEFI or Speeduino).

There are two flashing options:
- USB DFU bootloader: hold the boot switch while powering the board to enter DFU mode.
- ST-Link via SWD.

---

## 2. USB DFU bootloader

!!! note "Before you flash"
    - Power the board from its normal supply (`VIN_KL30` and `VIN_KL15`). Whether USB alone can
      power the board is *to be confirmed* — do not rely on it.
    - Verify the firmware file matches the STM32F405 and your intended firmware (rusEFI or
      Speeduino) — flashing the wrong image can leave the board unresponsive until re-flashed.
    - The position of the boot switch on the PCB is *to be confirmed*; a photo will be added here.

1. Hold the boot switch, then switch on the board's power. The MCU checks the switch only at
   power-up, so you can release it once the board is powered.
2. Connect the board to your computer over USB. It should appear as an STM32 DFU device.
3. Upload the firmware file to address `0x08000000` using either STM32CubeProgrammer or `dfu-util`:

   ```bash
   dfu-util -a 0 -s 0x08000000:leave -D firmware.bin
   ```

4. After programming completes, power-cycle the board with the boot switch released so it starts
   the new firmware.

---

## 3. Flashing with STM32CubeProgrammer

Requirements:

- STM32F405 target board
- ST-Link V2/V3 or equivalent SWD programmer
- USB cable for the programmer
- STM32CubeProgrammer installed
- Firmware file (`.bin` or `.hex`)

1. Connect the ST-Link to SWD header **H2** (see the
   [expansion header pinout](../24p_v1_overview.md#4-expansion-headers)):
   - H2 pin 3 `SWCLK` → ST-Link SWCLK
   - H2 pin 2 `SWDIO` → ST-Link SWDIO
   - H2 pin 4 `GND` → ST-Link GND
   - H2 pin 1 `+3V3` → ST-Link target-voltage sense (VTref / VAPP)

   Power the board from its normal supply while flashing.
2. Open STM32CubeProgrammer.
3. Select **ST-LINK** as the connection type.
4. Click **Connect**.
5. In the programming section, choose the firmware file.
6. Set the start address to `0x08000000`.
7. Click **Start Programming** (or **Download**).
8. After programming completes, reset the board and verify operation.

---

## 4. Command-line flashing

Example using STM32CubeProgrammer CLI:

```bash
STM32_Programmer_CLI -c port=SWD -d firmware.bin 0x08000000 -v
```

### 4.1. Full chip erase (last resort)

!!! warning "Full chip erase is destructive"
    A full chip erase clears the entire flash, including the existing firmware. Use it only if the
    device is locked or will not accept a normal flash, and have a working firmware file ready to
    flash immediately afterward.

Over SWD, erase the chip, then flash as above:

```bash
STM32_Programmer_CLI -c port=SWD -e all
```

In the STM32CubeProgrammer GUI, the same action is the **Full chip erase** button.

---

## 5. Next steps

With firmware on the board, continue with step 4, the
[Wiring and Hardware Guide](../wiring.md). If the board doesn't respond after flashing, see
[Troubleshooting](../../../guides/setup/troubleshooting.md).

