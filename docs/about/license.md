# License & Disclaimer
--8<-- "status-ai-draft.md"

This page covers the legal terms around using Hüpftronik hardware, firmware, and documentation, and
the safety disclaimer that applies to every build described on this site. Read this before you rely
on anything here for a vehicle you drive.

---

## 1. Licensing

!!! note "Hardware and documentation license: to be confirmed"
    Hüpftronik firmware images are built on [rusEFI](https://github.com/rusefi/rusefi) or
    [Speeduino](https://github.com/noisymime/speeduino), both open-source and GPLv3-licensed — your
    compiled firmware inherits GPLv3 from whichever project you build against. The specific
    open-hardware license covering the Motorsteuergerät 24P V1 PCB design files, and the license
    covering the text and images on this documentation site, have not yet been finalized. This
    section will be updated with the exact license (and a link to the design files) once that's
    settled — see [Design files](../products/motorsteuergerat-24p-v1/reference.md) for current
    status.

    **Until a license is published, the interim position is:** the documentation text and images on
    this site are © Hüpftronik, all rights reserved — you may read and link to them freely, but not
    republish or redistribute them. The PCB design files are unpublished. The intent is to release
    both under recognized open licenses (an open-hardware license for the design files, an open
    documentation license for this site); "all rights reserved" is the interim default, not the
    destination.

## 2. No warranty

Hüpftronik hardware is provided **as-is**, without warranty of any kind, express or implied,
including but not limited to fitness for a particular purpose. Alpha-status products (see each
product's status badge) may have unresolved hardware or firmware issues.

## 3. Safety and liability disclaimer

!!! danger "You are responsible for your build"
    Building and installing a standalone ECU affects how your engine runs, including fueling,
    ignition timing, and safety-relevant outputs like cooling fans and boost control. A miswired
    harness, an incorrect tune, or a skipped verification step can damage your engine, start a fire,
    or cause a crash. Hüpftronik is not responsible for damage, injury, or loss resulting from the
    use, misuse, or installation of this hardware or the firmware it runs.

- Follow the safety warnings on each page — they're placed immediately above the step they apply to.
- Verify wiring against the pinout documentation with a multimeter before applying power, every time.
- Do not use this hardware in a safety-critical application without independent engineering review.
- If your jurisdiction requires emissions or safety certification for road use, confirm compliance
  before driving the vehicle on public roads — that certification is your responsibility, not
  Hüpftronik's.

## 4. Third-party trademarks

Product and company names mentioned in this documentation (Bosch, Volvo, TunerStudio, AliExpress,
and others) are trademarks of their respective owners, referenced here only to identify compatible
parts and tools. Hüpftronik is not affiliated with or endorsed by these companies.

---

## Next steps

See [Our Philosophy](philosophy.md) for the engineering reasoning behind these trade-offs, or head
back to the [product overview](../products/motorsteuergerat-24p-v1/24p_v1_overview.md) to continue
your build.
