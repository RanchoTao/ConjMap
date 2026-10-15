import json
from pathlib import Path
import unittest
from formal_conjectures import extract


class AdapterTests(unittest.TestCase):
    def test_all_shipped_statements_roundtrip(self):
        rows = json.loads(Path("data/problems.json").read_text(encoding="utf-8"))
        for row in rows:
            with self.subTest(id=row["id"]):
                relative = row["provenance"]["path"]
                text = (Path("data/upstream/formal-conjectures") / relative).read_text(encoding="utf-8")
                self.assertEqual(extract(text, relative), row)

    def test_unlicensed_or_undocumented_input_is_not_imported(self):
        self.assertIsNone(extract("@[category research open, AMS 11] theorem foo : True := by sorry", "foo.lean"))

    def test_nonresearch_categories_are_not_open_problems(self):
        text = "The Formal Conjectures Authors. Apache License\n/-- " + "A precise documented statement. " * 5 + " -/\n@[category textbook, AMS 11]\ntheorem foo : True := by sorry"
        self.assertIsNone(extract(text, "foo.lean"))


if __name__ == "__main__":
    unittest.main()
