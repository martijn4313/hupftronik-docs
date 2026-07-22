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

## 4. Exporting diagrams for use in these docs

Harness Bench provides three export routes, each suited to a different context in the documentation.

### 4.1. Mermaid export (recommended for embedded diagrams)

Click **Export Mermaid** to generate a Mermaid flowchart that renders directly inside any
documentation page. The site already has Mermaid rendering enabled, so the workflow is:

1. Design your diagram in Harness Bench.
2. Click **Export Mermaid** and copy the output.
3. Paste it into a fenced code block on the target page:

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

!!! tip "Mermaid is preferred for documentation diagrams"
    Prefer Mermaid exports over SVG embeds for any diagram that may need to be updated. Mermaid
    source lives in the Markdown file, so changes are tracked by Git and visible in pull-request
    diffs. SVG files are binary blobs from Git's perspective.

### 4.2. SVG export (for complex diagrams or print-quality output)

Click **Export SVG** to download a standalone `.svg` file that preserves the exact canvas
appearance including colours, fonts, and layout.

To embed an SVG in a documentation page:

1. Save the exported file into `docs/assets/diagrams/` (create the folder if it does not exist).
2. Reference it in Markdown using a standard image tag:

    ```markdown
    ![Harness overview — Volvo B21 base build](../../assets/diagrams/volvo-b21-harness.svg)
    ```

3. Optionally store the matching `.json` save file alongside the SVG so the diagram can be
   re-opened and edited in Harness Bench later:

    ```
    docs/
      assets/
        diagrams/
          volvo-b21-harness.json   ← Harness Bench save file (source)
          volvo-b21-harness.svg    ← exported for the docs page
    ```

!!! note
    SVG files exported from Harness Bench are self-contained and load without any external
    dependencies, so they render reliably on every browser and in the generated static site.

### 4.3. JSON embed (interactive viewer — future option)

The Harness Bench JSON save format is a complete description of the diagram including all component
positions, wire routes, colours, and labels. A future option is to embed a read-only viewer on a
documentation page that loads a JSON file and displays the diagram interactively — allowing readers
to pan, zoom, and inspect wire properties without leaving the docs.

This approach is not yet implemented but the infrastructure (the JSON format and the renderer) is in
place. If this is useful for your project, open an issue or a pull request.

---

## 5. Next steps

- [Plan your build](../guides/setup/planning.md) — the planning guide where diagrams are most useful
- [Wiring and hardware guide](../products/motorsteuergerat-24p-v1/wiring.md) — connector and harness reference
