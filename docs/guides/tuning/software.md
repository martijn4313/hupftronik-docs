# Software Tools (TunerStudio)
--8<-- "status-ai-draft.md"

---

TunerStudio is the tuning dashboard both rusEFI and Speeduino use — it's how you view live sensor
data, edit fuel and ignition tables, and log a drive for later analysis. You'll use it from first
power-up through final tuning, so it's worth understanding its layout before you're relying on it
mid-drive. This page covers connecting it to the board and the panels you'll use most.

---

## 1. Getting TunerStudio

Download TunerStudio from its publisher's site (search "TunerStudio EFI" — the free tier covers
everything needed for this board). Install it on the laptop you'll use for tuning; a wired USB
connection to the car is required, so plan for a laptop-friendly seating position during on-road
tuning sessions.

---

## 2. Connecting to the board

1. Connect the board to your computer via USB (see
   [Setup and Commissioning §6](../../products/motorsteuergerat-24p-v1/setup/index.md#6-verification-and-testing)
   for the first-power-up sequence — do this before opening TunerStudio).
2. Open TunerStudio and create a new project.
3. Select the INI/settings file matching your firmware (rusEFI or Speeduino) and firmware version —
   this file defines every table, gauge, and setting TunerStudio displays, and must match the
   compiled firmware exactly or values will display incorrectly.
4. Select the correct serial port and connect. A successful connection shows live gauge data
   immediately — if gauges stay blank or show garbage values, see
   [Troubleshooting](../setup/troubleshooting.md).

---

## 3. Panels you'll use most

**Gauge cluster** — live sensor readings (RPM, coolant/intake temperature, MAP, TPS, air-fuel
ratio). Check this first after any wiring change to confirm sensors read plausible values before
trusting anything else.

**VE table / fuel table editor** — the 2D fuel table described in
[Tuning Basics §1](basics.md#1-what-youre-actually-adjusting). Supports direct cell editing and
auto-interpolation between tuned cells.

**Ignition table editor** — same layout as the fuel table, for spark advance.

**Datalogging** — records a time-series of every gauge channel to a file for later review. Start a
log before any drive you intend to tune from; reviewing gauges live is not a substitute for a log
you can scroll back through afterward.

**Triggerscope / trigger log** (rusEFI) or equivalent trigger monitor (Speeduino) — shows the raw
crank/cam signal the ECU is decoding. Use this to confirm trigger sync before trusting any other
reading; a bad trigger signal makes every other gauge unreliable.

---

## 4. Basic workflow

1. Connect and confirm sensor gauges read correctly at rest (ignition on, engine off).
2. Confirm trigger sync before cranking — see the triggerscope/trigger monitor above.
3. Start the engine and load a base map appropriate for your setup (see
   [Tuning Basics §3](basics.md#3-building-a-base-map)).
4. Datalog a drive, then refine tables per [Tuning Basics §4](basics.md#4-fueling-cell-by-cell-refinement).

---

## 5. Next steps

Once you're comfortable with the interface, work through [Tuning Basics](basics.md) for the tuning
process itself. If TunerStudio won't connect or shows no data, see
[Troubleshooting](../setup/troubleshooting.md).
