#!/usr/bin/env python3
"""Normalize heading numbering and horizontal separators in Markdown files.

The script walks through Markdown files and applies a simple hierarchical
numbering scheme to headings level 2 and deeper. Level 1 headings are left
unchanged so page titles remain as-is. It also normalizes horizontal rules
such as --- to a single standard separator with consistent spacing.

Use ``<!-- heading-numbering: appendix -->`` immediately before a terminal appendix to preserve
its authored heading labels instead of adding global decimal numbering.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import List

HEADING_PATTERN = re.compile(r"^(#{1,6})\s+(.*)$")
NUMBER_PREFIX_PATTERN = re.compile(r"^\d+(?:\.\d+)*\s*\.?\s+")
FENCE_PATTERN = re.compile(r"^(```|~~~)")
SEPARATOR_PATTERN = re.compile(r"^(?:-{3,}|\*{3,})$")
APPENDIX_MARKER = "<!-- heading-numbering: appendix -->"


def normalize_headings_in_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    new_lines: List[str] = []
    in_fence = False
    in_appendix = False
    counters = [0] * 7

    def add_separator() -> None:
        while new_lines and new_lines[-1].strip() == "":
            new_lines.pop()
        if new_lines and new_lines[-1].strip() == "---":
            new_lines.append("")
            return
        if new_lines:
            new_lines.append("")
        new_lines.append("---")
        new_lines.append("")

    for line in lines:
        if FENCE_PATTERN.match(line.lstrip()):
            in_fence = not in_fence
            new_lines.append(line)
            continue

        if in_fence:
            new_lines.append(line)
            continue

        stripped = line.strip()

        if stripped == "":
            # Avoid adding multiple empty lines after a separator
            if len(new_lines) >= 2 and new_lines[-1].strip() == "" and new_lines[-2].strip() == "---":
                continue
            new_lines.append(line)
            continue

        if stripped == APPENDIX_MARKER:
            in_appendix = True
            new_lines.append(line)
            continue

        if SEPARATOR_PATTERN.match(stripped):
            add_separator()
            continue

        match = HEADING_PATTERN.match(line)
        if not match:
            new_lines.append(line)
            continue

        hashes, heading = match.groups()
        level = len(hashes)
        if level == 1:
            new_lines.append(line)
            continue

        if in_appendix:
            new_lines.append(line)
            continue

        if level == 2:
            last_non_empty = None
            for candidate in reversed(new_lines):
                if candidate.strip() != "":
                    last_non_empty = candidate
                    break
            if last_non_empty is None or last_non_empty != "---":
                add_separator()

        heading_text = NUMBER_PREFIX_PATTERN.sub("", heading.strip())

        for lvl in range(level + 1, 6):
            counters[lvl] = 0

        counters[level] += 1

        if level == 2:
            number = str(counters[2])
        elif level == 3:
            number = f"{counters[2]}.{counters[3]}"
        elif level == 4:
            number = f"{counters[2]}.{counters[3]}.{counters[4]}"
        elif level == 5:
            number = f"{counters[2]}.{counters[3]}.{counters[4]}.{counters[5]}"
        else:
            number = f"{counters[2]}.{counters[3]}.{counters[4]}.{counters[5]}.{counters[6]}"

        new_lines.append(f"{'#' * level} {number}. {heading_text}")

    new_text = "\n".join(new_lines)
    if not text.endswith("\n"):
        new_text = new_text.rstrip("\n")

    if new_text != text:
        path.write_text(new_text + ("\n" if text.endswith("\n") else ""), encoding="utf-8")
        return True

    return False


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "root",
        nargs="?",
        default="docs",
        help="Directory containing Markdown files to process (default: docs)",
    )
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        raise SystemExit(f"Path does not exist: {root}")

    changed_files = []
    for path in sorted(root.rglob("*.md")):
        if normalize_headings_in_file(path):
            changed_files.append(str(path))

    if changed_files:
        print("Updated files:")
        for path in changed_files:
            print(path)
    else:
        print("No Markdown heading changes were needed.")


if __name__ == "__main__":
    main()
