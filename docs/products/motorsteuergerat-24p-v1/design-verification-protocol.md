# Community Design Validation
--8<-- "status-ai-draft.md"

Motorsteuergerät 24P V1 is an open-source project, not a production validation programme. Design
confidence grows as builders test real boards, report results, and improve the design. There is no
required board count, build batch, formal sign-off, or fixed evidence archive.

Use the [Practical Hardware Checks](hardware-test-protocol.md) as a starting point. Contributors can
test one area, one board, or one installation; partial results are still valuable.

## What matters most

Prioritise evidence that helps builders use the board safely:

1. A newly assembled board powers up without a short or unexpected heating.
2. The 5 V and 3.3 V rails remain stable.
3. Firmware can be flashed and communicates reliably.
4. Required sensor inputs and trigger signals behave as expected.
5. Required outputs switch their intended loads safely.
6. The board remains stable in its enclosure during a representative real-world run.

Not every contributor needs to test every item. Start with the functions you use and expand testing
when equipment and time allow.

## Recording useful evidence

When reporting a result, include enough context for someone else to compare it:

- Board revision and any relevant rework
- Firmware version or commit
- Supply voltage and current limit
- Test load or vehicle configuration
- What was checked and what happened
- Relevant measurements, logs, photos, or scope captures

Equipment serial numbers, formal test IDs, and prescribed folder layouts are unnecessary.

## Building confidence

Documentation should distinguish between:

- **Not yet checked** — expected from the design, but no result has been shared.
- **Observed** — demonstrated on at least one identified board or installation.
- **Repeated** — independently observed on multiple boards or installations.

These are descriptions of available evidence, not release gates. A single clear result may resolve
a documentation question; repeated results provide more confidence where component tolerance,
temperature, or assembly variation matters.

## Handling problems

If something fails:

1. Make the setup safe and record the observed behaviour.
2. Recheck wiring, current limits, firmware configuration, and the test load.
3. Repeat only when it is safe to do so.
4. Open an issue with the available context.

A design change only needs focused retesting of the affected function and a basic check that the
board still powers up and communicates. Broader regression testing is welcome, not mandatory.

## Deciding readiness

There is no formal DVT exit criterion. Maintainers and builders should make a practical judgment
from the evidence available, known limitations, and the risk of the intended use. Unverified values
should remain marked *to be confirmed*, and known problems should be visible in the documentation.
Share results and corrections through [Open-Source & Community](../../about/community.md). Useful
field experience is just as welcome as structured bench testing.
