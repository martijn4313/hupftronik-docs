# MegaSquirt to Motorsteuergerät 24P V1 Migration Guide
--8<-- "status-ai-draft.md"

MegaSquirt is a different hardware platform running different firmware from the Motorsteuergerät
24P V1 — this is a full hardware swap with a rewiring step, not a firmware update. This guide covers
what carries over from an existing MegaSquirt install and what you need to redo, so you don't
assume more compatibility than actually exists.

---

## 1. What does and doesn't carry over

**Carries over directly:** your engine's physical specifications — cylinder count, firing order,
injector flow rate and dead time, trigger wheel pattern, sensor calibration curves (if using the same
physical sensors). These are properties of your engine and sensors, not of the ECU, so they transfer
as *values* you re-enter, not as a file you import.

**Does not carry over:** the tune file itself. MegaSquirt (MS1/MS2/MS3) and rusEFI/Speeduino are
different firmware families with incompatible table formats and pin assignments — there is no direct
import path. Your existing VE and ignition tables are still the single most valuable reference you
have (see [§3](#3-map-and-tuning-parameter-conversion)), but you'll re-enter them as a starting point
in the new firmware, not load the file directly.

**Needs rewiring:** every connector. MegaSquirt's connector and pin assignments do not match the 24P
V1's 24-pin connector — see [§2](#2-wiring-differences) before assuming any existing harness wire
lands on the correct pin.

---

## 2. Wiring differences

The 24P V1 uses a single sealed 24-pin FCI connector (see the
[IO Overview](../../products/motorsteuergerat-24p-v1/24p_v1_overview.md#3-io-overview)); most
MegaSquirt variants use a different connector family and pin layout entirely, and some MS variants
(depending on the specific board revision) use high-side or PWM'd outputs where the 24P V1 uses
fixed low-side drivers. Do not reuse an existing MegaSquirt harness pin-for-pin — instead:

1. Identify what each existing wire in your harness actually connects to at the engine end (injector,
   sensor, relay) rather than trusting its position in the old MegaSquirt connector.
2. Re-terminate each wire against the 24P V1's pinout, following
   [Wiring and hardware guide](../../products/motorsteuergerat-24p-v1/wiring.md) for connector and
   crimp practice.
3. Recheck driver polarity for every output before applying power — a MegaSquirt high-side output
   wired into a 24P V1 low-side input (or vice versa) will not work correctly and can damage the
   driver.

!!! danger "Verify driver type before reusing any output wiring"
    Confirm whether your existing MegaSquirt setup drove each output high-side or low-side before
    connecting it to the 24P V1's low-side drivers. Wiring a high-side-expecting load (or a load
    already fused to switched power) directly into a low-side input can short the driver.

## 3. Map and tuning parameter conversion

Export or note down your existing MegaSquirt VE table, ignition table, injector dead-time curve, and
any closed-loop targets before disconnecting the old ECU — you'll re-enter these as your starting
point in the new firmware rather than starting from a blank table. See
[Tuning Basics §3](../tuning/basics.md#3-building-a-base-map) for how a prior tune fits into a safe
base map, and treat the transferred values as a *starting point requiring reverification*, not a
finished tune — different injector drivers and trigger decoding between platforms mean small
discrepancies (dead time, trigger offset) are expected even with correct table values carried over.

## 4. Testing and validation

Because both the hardware and firmware changed, treat first start after the swap like a first
commissioning, not a firmware update:

1. Work through [Setup and Commissioning §6](../../products/motorsteuergerat-24p-v1/setup/index.md#6-verification-and-testing)
   in full — heartbeat, communication, diagnostics, I/O validation — even though the engine has run
   on standalone EFI before.
2. Confirm trigger sync independently rather than assuming your old trigger offset value is correct —
   trigger decoding differs between MegaSquirt and rusEFI/Speeduino.
3. Re-verify wide-open-throttle fueling before trusting it, per
   [Tuning Basics §4](../tuning/basics.md#4-fueling-cell-by-cell-refinement), even if the transferred
   table values look reasonable.

---

## 5. Common issues

| Symptom | Likely cause |
|---|---|
| Injector or relay driver fails immediately at first power-up | Old MegaSquirt output wiring assumed high-side switching; reused directly into a low-side input |
| Trigger sync fails despite a known-good trigger wheel | Trigger offset or type carried over from MegaSquirt config rather than reconfigured for this firmware |
| Engine runs noticeably differently than on MegaSquirt despite "identical" tables | Injector dead-time or trigger decoding differences between platforms — re-tune rather than assume a 1:1 transfer |

---

## Next steps

If you haven't already, work through
[Wiring and hardware guide](../../products/motorsteuergerat-24p-v1/wiring.md) and
[Setup and Commissioning](../../products/motorsteuergerat-24p-v1/setup/index.md) as if this were a
new install. If something doesn't behave as it did on MegaSquirt, see
[Troubleshooting](../setup/troubleshooting.md).
