# Programming the board
<div class="content-status status-reviewed" title="Checked for internal consistency and technical accuracy; not tested on physical hardware. See About > Open-Source & Community for what this means.">Reviewed</div>

---

## 1. What is flashing?

Before the board can do anything, we need to copy the program that makes it work. This is called flashing.
Flashing means copying this program into the MCU (microcontroller) memory on the board. 

This either installs the first program on the MCU or replaces the existing one with a new version.

This page shows the basic steps to update the STM32F405 used on the Motorsteuergerät 24P v1. It
assumes you already have a firmware `.bin` or `.hex` file — see [Setup and
Commissioning](index.md#4-compilation-and-flashing) for compiling one from source for your chosen
firmware (rusEFI or Speeduino).

There are two flashing options:
- USB DFU bootloader: hold the boot switch while powering the board to enter DFU mode.
- ST-Link via SWD.

---

## 2. USB DFU bootloader

1. Hold the boot switch and power the board to enter DFU mode.
2. Connect the board to USB.
3. Upload the firmware file to address `0x08000000` using either STM32CubeProgrammer or `dfu-util`:

   ```bash
   dfu-util -a 0 -s 0x08000000:leave -D firmware.bin
   ```

4. Release the boot switch and reset the board after programming completes.

Notes

- Make sure the board is powered before attempting to flash.
- Verify the firmware file matches the STM32F405 and your intended firmware (rusEFI or Speeduino)
  before flashing — flashing the wrong image can leave the board unresponsive until re-flashed.

!!! warning "Full chip erase is destructive"
    If the device is locked or not responding to a normal flash, a full chip erase clears the entire
    flash — including the existing firmware and any bootloader configuration — before you write the
    new image. Only use it as a last resort, and confirm you have a working firmware file ready to
    flash immediately afterward.

---

## 3. Flashing with STM32CubeProgrammer

Requirements:

- STM32F405 target board
- ST-Link V2/V3 or equivalent SWD programmer
- USB cable for the programmer
- STM32CubeProgrammer installed
- Firmware file (`.bin` or `.hex`)

1. Connect the ST-Link to the board using SWD:
   - SWCLK
   - SWDIO
   - GND
   - 3.3V (if not powered separately)
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

---

## 5. Next steps

With firmware on the board, continue with [wiring and integration](../wiring.md), then return to
[Setup and Commissioning §6](index.md#6-verification-and-testing) to bring the board up for the
first time. If the board doesn't respond after flashing, see
[Troubleshooting](../../../guides/setup/troubleshooting.md).

