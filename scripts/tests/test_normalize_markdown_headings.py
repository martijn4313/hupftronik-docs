"""Regression tests for the Markdown heading normalizer."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).parents[1] / "normalize_markdown_headings.py"
SPEC = importlib.util.spec_from_file_location("normalize_markdown_headings", SCRIPT_PATH)
assert SPEC and SPEC.loader
NORMALIZER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(NORMALIZER)


class NormalizeHeadingsTests(unittest.TestCase):
    def normalize(self, content: str) -> str:
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "reference.md"
            path.write_text(content, encoding="utf-8")
            NORMALIZER.normalize_headings_in_file(path)
            return path.read_text(encoding="utf-8")

    def test_numbers_regular_headings_and_normalizes_separator(self) -> None:
        result = self.normalize("# Page\n\n## First\n\n***\n\n### Detail\n")

        self.assertEqual(result, "# Page\n\n---\n\n## 1. First\n\n---\n\n### 1.1. Detail\n")

    def test_preserves_terminal_appendix_hierarchy(self) -> None:
        result = self.normalize(
            "# Page\n\n## Main\n\n<!-- heading-numbering: appendix -->\n\n"
            "## Technical Appendix\n\n### A.1. Thermal Analysis\n\n"
            "#### A.1.1. Loss Calculations\n"
        )

        self.assertIn("## 1. Main", result)
        self.assertIn("## Technical Appendix", result)
        self.assertIn("### A.1. Thermal Analysis", result)
        self.assertIn("#### A.1.1. Loss Calculations", result)
        self.assertNotIn("2. A.1", result)

    def test_ignores_marker_inside_code_fence(self) -> None:
        result = self.normalize(
            "# Page\n\n```markdown\n<!-- heading-numbering: appendix -->\n```\n\n"
            "## Normal Heading\n"
        )

        self.assertIn("## 1. Normal Heading", result)


if __name__ == "__main__":
    unittest.main()