# Programming the board

## What is flashing?

Before the board can do anything, we need to copy the program that makes it work. This is called flashing.
Flashing means copying this program into the MCU (microcontroller) memory on the board. 

This either installs the first program on the MCU or replaces the existing one with a new version.

This page shows the basic steps to update the STM32F405 used on the Motorsteuergerät 24P v1.

There are two flashing options:
- USB DFU bootloader: hold the boot switch while powering the board to enter DFU mode.
- ST-Link via SWD.

## USB DFU bootloader

1. Hold the boot switch and power the board to enter DFU mode.
2. Connect the board to USB.
3. Use STM32CubeProgrammer or dfu-util to upload the firmware file to address `0x08000000`.
4. Release the boot switch and reset the board after programming completes.

Notes

- Make sure the board is powered before attempting to flash.
- If the device is locked or not responding, perform a full chip erase first.
- Verify the correct firmware for the STM32F405 before flashing.


## Flashing with STM32CubeProgrammer

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

## Command-line flashing

Example using STM32CubeProgrammer CLI:

```bash
STM32_Programmer_CLI -c port=SWD -d firmware.bin 0x08000000 -v
```

