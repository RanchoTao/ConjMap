"""Licensed metadata adapter. Never interprets upstream status as independent verification."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import yaml

REVISION = "86c3dc3e47dbdfb933c57df46705f3fe78e65cc3"


def parse_metadata(text, license_text, legacy_problems):
    if "Apache License" not in license_text or "Version 2.0" not in license_text:
        raise ValueError("Explicit Apache-2.0 metadata grant required")
    rows = yaml.safe_load(text)
    if not isinstance(rows, list):
        raise ValueError("Expected a list")
    numbers = [str(row.get("number")) for row in rows]
    if len(numbers) != len(set(numbers)):
        raise ValueError("Duplicate external identifiers")
    by_number = {str(row["number"]): row for row in rows}
    records = []
    for problem in legacy_problems:
        match = re.fullmatch(r"fc-erdosproblems-(\d+)", problem["id"])
        if not match or match[1] not in by_number:
            continue
        row = by_number[match[1]]
        # Identity match is documentary (explicit Erdős number), not inferred theorem equivalence.
        record = {"id": f"erdos-metadata-{match[1]}", "legacy_problem_id": problem["id"],
            "external_id": match[1], "source_id": "erdos-community", "revision": REVISION,
            "url": f"https://github.com/teorth/erdosproblems/blob/{REVISION}/data/problems.yaml",
            "original_url": f"https://www.erdosproblems.com/{match[1]}",
            "retrieved_at": "2026-10-15", "source_sha256": hashlib.sha256(text.encode()).hexdigest(),
            "record_sha256": hashlib.sha256(json.dumps(row,sort_keys=True,ensure_ascii=False).encode()).hexdigest(),
            "rights": {"metadata":"Apache-2.0", "statement_text":"not_imported", "linked_material":"original_terms"},
            "attribution":"teorth/erdosproblems community contributors", "raw_metadata":row,
            "review_status":"unverified", "status_scope":"Numbered original problem; may not match selected variant."}
        records.append(record)
    return records


if __name__ == "__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source",type=Path,required=True)
    parser.add_argument("--license",type=Path,required=True)
    parser.add_argument("--problems",type=Path,default=Path("data/problems.json"))
    parser.add_argument("--output",type=Path,default=Path("data/v02/source-records.json"))
    args=parser.parse_args()
    result=parse_metadata(args.source.read_text(encoding="utf8"),args.license.read_text(encoding="utf8"),json.loads(args.problems.read_text(encoding="utf8")))
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8",newline="\n")
    print(json.dumps({"source_records":len(result),"new_problem_count":0,"revision":REVISION}))
