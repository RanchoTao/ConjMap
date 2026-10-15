import json
import unittest
from pathlib import Path

from erdos_open_index import build, SOURCE_SHA256


ROOT = Path(__file__).resolve().parent.parent


class ErdOsOpenIndexTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = (ROOT / "data/upstream/erdos-community/problems.yaml").read_text(encoding="utf8")
        cls.license_text = (ROOT / "data/upstream/erdos-community/LICENSE").read_text(encoding="utf8")
        cls.registry = json.loads((ROOT / "data/v02/id-registry.json").read_text(encoding="utf8"))

    def test_pinned_roundtrip(self):
        expected = json.loads((ROOT / "data/v03/erdos-open-index.json").read_text(encoding="utf8"))
        self.assertEqual(build(self.text, self.registry, self.license_text), expected)
        self.assertEqual(len(expected), 589)
        self.assertEqual(sum(row["matched_problem_id"] is not None for row in expected), 25)

    def test_prevents_unverified_status_promotion(self):
        rows = build(self.text, self.registry, self.license_text)
        self.assertTrue(all(r["source_reported_status"] == "open" for r in rows))
        self.assertTrue(all(r["mathematical_status"] == "unknown" for r in rows))
        self.assertTrue(all(r["record_type"] == "metadata_only" for r in rows))

    def test_tampering_and_license_fail_closed(self):
        with self.assertRaises(ValueError):
            build(self.text.replace('number: "3"', 'number: "999999"', 1), self.registry, self.license_text)
        with self.assertRaises(ValueError):
            build(self.text, self.registry, "No permission")

    def test_ids_are_unique_and_existing_links_are_valid(self):
        rows = build(self.text, self.registry, self.license_text)
        self.assertEqual(len(set(row["id"] for row in rows)), len(rows))
        self.assertTrue(all(
            r["matched_problem_id"] in self.registry.values()
            for r in rows if r["matched_problem_id"] is not None
        ))


if __name__ == "__main__":
    unittest.main()
