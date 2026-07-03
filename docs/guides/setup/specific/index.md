# Vehicle-Specific Setup Guides

These guides collect the engine-specific decisions — trigger hardware, sensors, injectors, ignition
architecture, and known-good starting values — for engines the community commonly runs on the
Motorsteuergerät 24P V1. Each guide plugs into the generic workflow: work through
[Planning your build](../planning.md) with your engine's guide open, then wire and commission per
the [product documentation](../../../products/motorsteuergerat-24p-v1/setup/index.md).

| Engine | Character of the swap |
|---|---|
| [Volvo B2xx Redblock](volvo-b2xx.md) | The most detailed guide on this site — factory 60-2 trigger on later variants, well-supported wasted-spark conversion |
| [Volkswagen 1.8T](vw-1.8t.md) | Factory 60-2 trigger and coil-on-plug hardware; straightforward turbo swap |
| [Renault F4R](renault-f4r.md) | Factory 60-2 trigger plus Hall cam sensor; popular hot-hatch engine |
| [Peugeot TU Series](peugeot-tu.md) | Wide variation across the production run — identifying your exact variant is most of the work |
| [Mini A-Series](mini-a-series.md) | Full EFI retrofit on a carbureted engine — the largest fabrication scope in this list |

!!! note "Check each page's content-status badge"
    Guides differ in how much scrutiny they've had — see
    [content status labels](../../../about/community.md#5-content-status-labels) for what the badges
    mean. If you run one of these engines and can verify (or correct) a guide against real hardware,
    that feedback is one of the most valuable contributions you can make.

**Your engine isn't listed?** The guides above double as worked examples: pick the one whose trigger
and ignition architecture most resembles your engine (60-2 VR trigger? distributor? carbureted
retrofit?) and adapt it, using [Planning your build](../planning.md) as the checklist. Consider
writing up what you learn — see
[Open-Source & Community](../../../about/community.md#3-reporting-a-documentation-problem).
