"""Rebuild the metadata-only source-open index from the pinned, licensed Erdős YAML.

A source status is a historical observation, not a mathematical verification.
This importer intentionally does not copy web-page problem statements or guess them.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path

import yaml

REVISION = "86c3dc3e47dbdfb933c57df46705f3fe78e65cc3"
SOURCE_SHA256 = "f19b2f712cc7a64ebdbdd01ec8e2af32dc5b7ab67bf02c30002af9bb8067b15c"
FIELD_TAGS = [
    ("Number theory", ["number theory", "primes", "divisors", "unit fractions", "additive basis", "arithmetic progressions"]),
    ("Geometry & topology", ["geometry", "distances", "euclidean geometry", "convex geometry", "topology"]),
    ("Analysis", ["analysis", "functional analysis", "harmonic analysis", "probability"]),
    ("Algebra", ["algebra", "polynomials", "group theory"]),
    ("Logic & foundations", ["set theory", "logic", "computability"]),
    ("Combinatorics", ["graph theory", "ramsey theory", "combinatorics", "additive combinatorics", "chromatic number", "hypergraphs", "turan number"]),
]


def build(text: str, registry: dict[str, str], license_text: str) -> list[dict]:
    if hashlib.sha256(text.encode("utf8")).hexdigest() != SOURCE_SHA256:
        raise ValueError("Unpinned or modified Erdős source snapshot")
    if "Apache License" not in license_text or "Version 2.0" not in license_text:
        raise ValueError("Missing Apache-2.0 source license")
    source = yaml.safe_load(text)
    if not isinstance(source, list):
        raise ValueError("Expected YAML list of records")
    seen: set[str] = set()
    output: list[dict] = []
    for entry in source:
        number = str(entry["number"])
        if number in seen or not number.isdecimal():
            raise ValueError("Duplicate or nonnumeric Erdős problem identifier")
        seen.add(number)
        status = entry.get("status") or {}
        if status.get("state") != "open":
            continue  # Do not import solved, disproved or ambiguous statuses into the open index.
        tags = entry.get("tags") or []
        if not isinstance(tags, list) or any(not isinstance(t, str) for t in tags):
            raise ValueError("Invalid source tags")
        field = next(
            (name for name, keywords in FIELD_TAGS if any(k in tags for k in keywords)),
            "Other",
        )
        output.append({
            "id": f"erdos-{number}",
            "title": f"Erdős Problem {number}",
            "source_id": "erdos-community",
            "external_id": number,
            "field": field,
            "tags": tags,
            "source_reported_status": "open",
            "source_status_updated": status.get("last_update"),
            "review_status": "unverified",
            "mathematical_status": "unknown",
            "record_type": "metadata_only",
            "source_url": f"https://www.erdosproblems.com/{number}",
            "source_metadata_url": f"https://github.com/teorth/erdosproblems/blob/{REVISION}/data/problems.yaml",
            "source_revision": REVISION,
            "matched_problem_id": registry.get(f"fc-erdosproblems-{number}"),
        })
    return sorted(output, key=lambda row: int(row["external_id"]))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path("data/upstream/erdos-community/problems.yaml"))
    parser.add_argument("--license", type=Path, default=Path("data/upstream/erdos-community/LICENSE"))
    parser.add_argument("--registry", type=Path, default=Path("data/v02/id-registry.json"))
    parser.add_argument("--output", type=Path, default=Path("data/v03/erdos-open-index.json"))
    parser.add_argument("--write", action="store_true", help="Regenerate the checked-in file")
    args = parser.parse_args()
    rows = build(
        args.source.read_text(encoding="utf8"),
        json.loads(args.registry.read_text(encoding="utf8")),
        args.license.read_text(encoding="utf8"),
    )
    serialized = json.dumps(rows, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(serialized, encoding="utf8", newline="\n")
    elif args.output.read_text(encoding="utf8") != serialized:
        raise ValueError("Index snapshot drift; regenerate only with an intentional reviewed update")
    print(json.dumps({
        "source_reported_open": len(rows),
        "matched_existing_identity": sum(r["matched_problem_id"] is not None for r in rows),
        "unmatched_candidates": sum(r["matched_problem_id"] is None for r in rows),
        "independently_verified": 0,
    }))


if __name__ == "__main__":
    main()
