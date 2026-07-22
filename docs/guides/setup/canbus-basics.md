# CAN Bus Basics
--8<-- "status-ai-draft.md"

---

CAN (Controller Area Network) is a two-wire serial bus that lets multiple electronic modules share
data over a single pair of wires instead of a dedicated wire per signal. The Motorsteuergerät 24P V1
has one CAN channel, used today mainly for broadcasting engine data to a dash or logger, and planned
as the link to future Hüpftronik expansion nodes. This page covers enough CAN theory to wire and
configure it correctly — it's not a full protocol reference.

---

## 1. Why CAN instead of more wires

A single CAN pair (`CAN_H` and `CAN_L`, pins A5/B5 on the main connector — see the
[IO Overview](../../products/motorsteuergerat-24p-v1/24p_v1_overview.md#3-io-overview)) can carry
dozens of independent data channels, all time-multiplexed onto the same two wires. This is why CAN
is the standard choice for connecting a dash display, a logger, or an expansion module without
running a dedicated wire for every signal.

---

## 2. Bus topology and termination

CAN is wired as a single linear bus, not a star — every device connects to the same two wires along
its length, not through a central hub. The two physical ends of that line each need a $120\,\Omega$
termination resistor across `CAN_H`/`CAN_L`; without both, reflections on the bus corrupt data,
especially at higher bus speeds or longer wire runs. If the 24P V1 sits at one end of the bus, verify
termination is present at that end — see
[Hardware Reference §8.1](../../products/motorsteuergerat-24p-v1/reference.md#81-can-bus) for the
board's own termination status and how to verify a bus with a multimeter. For third-party devices,
check their documentation, since not every CAN node includes a built-in terminator.

!!! warning "Missing or duplicate termination causes intermittent, hard-to-diagnose faults"
    A bus with zero or only one terminator may still work over a short bench connection and then fail
    once installed in a vehicle with longer wiring. A bus with terminators at more than the two true
    physical ends causes the same kind of intermittent corruption. Verify termination with a
    multimeter (approximately $60\,\Omega$ measured across `CAN_H`/`CAN_L` with everything powered
    off, for two $120\,\Omega$ terminators in parallel) rather than assuming it's correct.

---

## 3. Baud rate and node IDs

Every device on the same CAN bus must agree on the same baud rate (bus speed) — a mismatched device
won't communicate and can degrade the whole bus. Each message on the bus carries an identifier that
receiving devices filter on; when connecting a third-party dash or logger, you'll typically need to
match its expected CAN ID map to what the firmware transmits (rusEFI and Speeduino both document
their default broadcast format).

---

## 4. Wiring practice

- Keep the `CAN_H`/`CAN_L` pair twisted together where possible — this is standard practice for
  noise immunity on any CAN bus and matters more as wire runs get longer.
- Route CAN wiring away from ignition and injector driver wiring, the same as any other sensitive
  signal pair — see [Wiring and hardware guide §1](../../products/motorsteuergerat-24p-v1/wiring.md#1-wiring-harness).
- Keep stub lengths (the wire from the main bus line to each device) as short as practical; long
  stubs cause the same kind of reflection problems as missing termination.

---

## 5. Next steps

For the full connector pinout, see the [product overview](../../products/motorsteuergerat-24p-v1/24p_v1_overview.md#3-io-overview).
If CAN devices aren't communicating, see [Troubleshooting](troubleshooting.md).
