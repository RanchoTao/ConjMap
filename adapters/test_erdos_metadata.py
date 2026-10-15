import json
from pathlib import Path
import unittest
from erdos_metadata import parse_metadata

class MetadataTests(unittest.TestCase):
    def test_reproducible_and_not_double_counted(self):
        rows=json.loads(Path('data/problems.json').read_text(encoding='utf8'))
        result=parse_metadata(Path('data/upstream/erdos-community/problems.yaml').read_text(encoding='utf8'),Path('data/upstream/erdos-community/LICENSE').read_text(encoding='utf8'),rows)
        self.assertEqual(result,json.loads(Path('data/v02/source-records.json').read_text(encoding='utf8')))
        self.assertEqual(len(result),32)
        self.assertTrue(all(r['rights']['statement_text']=='not_imported' for r in result))
    def test_ambiguous_rights_and_duplicate_ids_are_rejected(self):
        with self.assertRaises(ValueError):parse_metadata('[]','public website',[])
        with self.assertRaises(ValueError):parse_metadata('- number: "1"\n- number: "1"','Apache License Version 2.0',[])
    def test_yaml_is_not_executable(self):
        with self.assertRaises(Exception):parse_metadata('!!python/object/apply:os.system ["echo invalid"]','Apache License Version 2.0',[])

if __name__=='__main__':unittest.main()
