# Tuning Basics
--8<-- "status-ai-draft.md"

---

Tuning is the process of teaching the ECU how much fuel to inject and when to fire the spark for
every combination of engine speed and load. A stock base map gets an engine running; only tuning
makes it run correctly — safely, efficiently, and without damaging the engine under load. This page
covers the concepts you need before you open a tuning table, regardless of whether you're running
rusEFI or Speeduino.

---

## 1. What you're actually adjusting

**The fuel table** (also called the VE table — Volumetric Efficiency table) tells the ECU what
percentage of its theoretical maximum airflow the engine actually ingests at a given RPM and load
point. The ECU uses this, together with air density and your injector's flow rate, to calculate how
long to open the injector (the pulse width) for the correct air-fuel ratio.

**The ignition table** tells the ECU how many degrees before top dead center (BTDC) to fire the
spark at each RPM/load point. Too little advance loses power; too much causes knock (uncontrolled,
damaging combustion) — see [Ignition](#5-ignition-timing) below.

Both tables are indexed by **load** (on a speed-density setup, this is manifold pressure — see
[Planning your build §2](../setup/planning.md#2-intake)) and **RPM**. Together they form a 2D grid:
you're filling in a value for every RPM/load cell the engine actually visits.

---

## 2. Open-loop vs. closed-loop

**Open-loop** fueling runs entirely from the table — the ECU commands the pulse width the table
says, regardless of what the exhaust gas actually looks like. This is what the engine runs on at
wide-open throttle and during startup/warmup, where you want predictable, repeatable behavior.

**Closed-loop** fueling uses an oxygen sensor to trim the table's output toward a target air-fuel
ratio in real time — typically active at idle and steady partial-throttle cruise, where precision
matters more than absolute predictability. Closed-loop correction is only as good as the oxygen
sensor: a wideband sensor gives an accurate lambda reading across the full range and enables
closed-loop correction everywhere it's enabled; a narrowband sensor only reliably reports "rich" or
"lean" of the stoichiometric point, which is too coarse for anything but idle trim. See
[Planning your build §4](../setup/planning.md#4-sensors) if you haven't chosen a sensor yet.

---

## 3. Building a base map

Never start tuning from a blank table. Begin from one of:

- A base map shipped with your firmware for a similar engine (displacement, injector size,
  aspiration).
- A base map from another builder running the same engine on the same firmware — the
  [vehicle-specific guides](../setup/specific/index.md) list known-good starting points where available.
- Manually calculated first-fill values from your injector flow rate and estimated volumetric
  efficiency, only if no closer starting point exists.

A base map only needs to be safe, not accurate — rich and slightly retarded is a safe starting bias.
Refinement happens in the next step.

---

## 4. Fueling: cell-by-cell refinement

1. **Idle and low load first.** Get the engine idling smoothly and cruising cleanly before touching
   high-load cells — you'll drive through these cells constantly while gathering data for the rest.
2. **Log while driving representative conditions**, then compare logged air-fuel ratio against your
   target at each visited cell, and adjust the corresponding table cell.
3. **Interpolate, don't guess, between visited cells.** Most tuning software can auto-interpolate
   unvisited cells from their neighbors — use it rather than filling in unverified values.
4. **High load last, and only with a wideband sensor and load on the engine** (a dyno, or a long
   uphill pull) — this is where a lean mixture does the fastest damage, so work here should be
   deliberate, not exploratory.

!!! danger "Never tune wide-open throttle from datalogs alone"
    A momentary lean spike at high load and high RPM can damage a piston or valve in seconds. Confirm
    high-load cells are safe (rich of stoichiometric, no knock) before trusting them, ideally with a
    knock sensor or on a dyno where you can react immediately to abnormal readings.

---

## 5. Ignition timing

Start conservative — a few degrees less advance than you expect the engine to want — and add timing
in small steps while monitoring for knock. Forced-induction engines are far more knock-sensitive
under boost than naturally aspirated ones; if you're running a turbo, reduce timing further at high
load and increase boost or timing independently, never both at once.

---

## 6. Before you call it tuned

- Verify closed-loop trims are small and stable at idle and cruise (large, unstable trims mean the
  base table is wrong, not the sensor).
- Confirm coolant and intake air temperature compensation tables are populated — a map tuned only at
  operating temperature will run wrong on a cold start.
- Re-check wide-open-throttle cells after any injector, boost, or exhaust change — they don't stay
  valid across hardware changes.

---

## 7. Next steps

For the specific tuning software interface (TunerStudio) and how to connect it to the board, see
[Software Tools](software.md). If the engine won't idle, hesitates, or won't rev cleanly, start with
[Troubleshooting](../setup/troubleshooting.md).
