# Tools
--8<-- "status-reviewed.md"

---

This section collects interactive tools that live alongside the documentation site. Each tool runs
entirely in the browser — no account or server is required.

---

## 1. B230 Compression Ratio Calculator

**[Open B230 Compression Ratio Calculator →](b230_compression_calc.html)**

A browser-based calculator for estimating the static compression ratio of Volvo B230 engines. Enter
bore, stroke, head gasket thickness, piston deck height, combustion chamber volume, and piston
dish/dome volume to see how the final ratio changes with different build combinations. It is useful
when planning a naturally aspirated or turbo redblock build and comparing options before buying
parts.

---

## 2. Harness Bench — wiring diagram designer

**[Open Harness Bench →](diagram-editor/index.html)**

Harness Bench is a browser-based wiring diagram designer built for automotive projects. It lets you
lay out a complete engine harness on a canvas: place components (ECU, battery, fuses, relays, sensors,
connectors, splices, and more), run colour-coded wires between their pins, and annotate the diagram
with notes.

Use it to plan a new harness before cutting a single wire, to document an existing installation, or
to produce a diagram to share with a builder or tuner working on the same car.

---

## 3. Saving and loading diagrams

Harness Bench stores its diagrams as JSON. Use **Save JSON** to download a `.json` file to your
computer and **Load JSON** to reopen it later. The JSON file is the source of truth for your diagram
— keep it somewhere safe alongside any other project files.

---

## 4. Exporting diagrams

Harness Bench provides two export routes: Mermaid for diagrams that live in Markdown, and SVG for
a fixed image. (Contributors adding a diagram to this site: see the repository README.)

### 4.1. Mermaid export (recommended)

Click **Export Mermaid** to generate a Mermaid flowchart. It renders in any Markdown viewer with
Mermaid support — GitHub, MkDocs, Obsidian, and many wikis — so it suits build notes and forum
posts. The workflow is:

1. Design your diagram in Harness Bench.
2. Click **Export Mermaid** and copy the output.
3. Paste it into a `mermaid` fenced code block in your notes:

    ````markdown
    ```mermaid
    %%{init: {"theme":"base", ...}}%%
    flowchart LR
      BAT1[("🔋 BAT1 12V")] ---|0.5mm² 200mm red| F1{{"F1 15A"}}
      ...
    ```
    ````

The exported code is ready to paste — no editing needed. The result renders as a vector diagram at
any screen size and is fully copy-able text, which keeps diagrams diffable and maintainable in Git.

!!! tip "Prefer Mermaid for diagrams you will keep editing"
    Prefer Mermaid exports over SVG for any diagram that may need to be updated. Mermaid
    source lives in the Markdown file, so changes stay readable in version control. Exported SVG is text, but it is machine-generated and does not diff in a readable way.

### 4.2. SVG export

Click **Export SVG** to download a standalone `.svg` file that preserves the exact canvas
appearance, including colours, fonts, and layout — useful for printing or for sharing with someone
who does not use Mermaid. Keep the matching `.json` save file next to it so the diagram can be
reopened and edited later.

---

## 5. Next steps

- [Plan your build](../guides/setup/planning.md) — the planning guide where diagrams are most useful
- [Wiring and hardware guide](../products/motorsteuergerat-24p-v1/wiring.md) — connector and harness reference
