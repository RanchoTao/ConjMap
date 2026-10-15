"""Offline, bounded, deterministic adapter for a licensed, pinned Lean checkout.

Not a Lean parser or a mathematical verifier. Only imports an immediately documented
research-open theorem; preserves its exact source file and line span for review.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import subprocess

REVISION = "2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6"
DATE = "2026-10-15"
REPO = "https://github.com/google-deepmind/formal-conjectures"
FIELDS = {
    "Number theory": {11},
    "Combinatorics": {5},
    "Algebra": {12, 13, 15, 16, 17, 18, 19, 20},
    "Geometry & topology": {14, 22, 51, 52, 53, 54, 55, 57, 58},
    "Analysis": {26, 28, 30, 31, 32, 33, 34, 35, 37, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49},
    "Logic & foundations": {3, 6, 8, 68},
    "Probability": {60, 62},
}


def extract(text: str, relative: str) -> dict | None:
    # Refuse unclear licensing, oversized comment fragments, or detached documentation.
    if "The Formal Conjectures Authors" not in text[:800] or "Apache License" not in text[:800]:
        return None
    docs = list(re.finditer(r"/--(.*?)-/\s*(@\[[\s\S]*?\])\s*(?:noncomputable\s+)?theorem\s+([^\s:(]+)", text, re.S))
    for match in docs:
        comment, attrs, theorem = match.groups()
        # Nested comments are deliberately rejected, never reconstructed.
        if "/-" in comment or "category research open" not in attrs:
            continue
        comment = comment.strip()
        if not 90 <= len(comment) <= 4500:
            continue
        ams = re.search(r"AMS\s+([\d\s]+)", attrs)
        codes = [int(x) for x in ams.group(1).split()] if ams else []
        field = next((name for name, values in FIELDS.items() if codes and codes[0] in values), None)
        if not field:
            continue
        end = text.find(":= by", match.end())
        if end < 0 or end - match.end() > 6000:
            continue
        formal = text[match.start(3):end].strip()
        heading = re.search(r"^#\s+(.+)$", text, re.M)
        title = re.sub(r"[*`$]", "", heading.group(1)).strip() if heading else Path(relative).stem
        titles = {
            "abc.variants.lt_constant_mul": "abc conjecture (constant-bound formulation)",
            "artin_primitive_roots.parts.ii": "Artin primitive roots: the selected density statement",
            "pillais_conjecture": "Pillai's conjecture on differences of perfect powers",
            "Tunnell_odd_converse": "Congruent numbers: the odd converse to Tunnell's criterion",
            "second_hardy_littlewood_conjecture": "Second Hardy–Littlewood conjecture",
            "inscribed_rectangle_problem": "Inscribed rectangle problem",
            "poincare_conjecture.variants.smooth_dimension_four": "Smooth four-dimensional Poincaré conjecture",
            "tournament_anti_sidorenko_trees_conjecture": "Tournament anti-Sidorenko trees conjecture",
            "four_exponentials_conjecture": "Four exponentials conjecture",
            "eulers_sum_of_powers_conjecture": "Euler sum of powers: selected open variant",
            "blochConstant_exact_value": "Exact value of Bloch's constant",
            "ramsey_number_five_five": "The Ramsey number R(5,5)",
            "riemannHypothesis": "Riemann hypothesis",
            "conjecture_1_3_to_2_3": "The 1/3–2/3 conjecture",
            "symbol_length_problem": "Symbol length in Milnor K-theory over complex function fields",
            "weak_birch_swinnerton_dyer_conjecture_rat": "Weak Birch and Swinnerton-Dyer conjecture over Q",
        }
        source_title = title
        if theorem in titles:
            title = titles[theorem]
        elif ".variants." in theorem or ".parts." in theorem:
            qualifier = theorem.split(".variants.")[-1].split(".parts.")[-1].replace("_", " ")
            title = f"{title} ({qualifier})"
        start_line = text.count("\n", 0, match.start()) + 1
        end_line = text.count("\n", 0, end) + 1
        url = f"{REPO}/blob/{REVISION}/{relative}#L{start_line}-L{end_line}"
        # References are preserved as documentary links, not claimed as read papers.
        links = list(dict.fromkeys(re.findall(r"\]\((https?://[^\s)]+)\)", text)))
        slug = re.sub(r"[^a-z0-9]+", "-", str(Path(relative).with_suffix("")).lower()).strip("-")
        problem_id = "fc-" + slug.removeprefix("formalconjectures-")
        formulas = re.findall(r"\$\$(.*?)\$\$|(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)", comment, re.S)
        latex = next((a.strip() for a, _ in formulas if a.strip()), None)
        if latex is None:
            latex = next((b.strip() for _, b in formulas if b.strip()), None)
        return {
            "id": problem_id, "title": title, "source_title": source_title, "statement": comment, "latex": latex,
            "formal_statement": formal, "field": field,
            "MSC": [f"{code:02d}" for code in codes],
            "status": "unknown",
            "status_evidence": [{"url": url, "accessed_at": DATE,
                "claim": "Upstream tags this selected theorem research open. ConjMap has not independently checked its current mathematical status.",
                "review_status": "unverified"}],
            "source_urls": [url, *links],
            "references": [{"title": "Formal Conjectures: source and surrounding definitions", "url": url},
                           *[{"title": "Reference linked by upstream (not independently reviewed)", "url": link} for link in links]],
            "proposed_by": None, "proposed_year": None, "last_verified": None,
            "difficulty_estimate": None, "review_status": "unverified",
            "aliases": [Path(relative).stem, theorem],
            "source_mappings": [{"source_id": "formal-conjectures", "external_id": f"{relative}::{theorem}", "url": url}],
            "provenance": {"source_id": "formal-conjectures", "revision": REVISION,
                "path": relative, "sha256": hashlib.sha256(text.encode()).hexdigest(),
                "retrieved_at": DATE, "license": "Apache-2.0", "extraction": "documented-research-open-theorem-v1",
                "source_reported_status": "open", "start_line": start_line, "end_line": end_line},
        }
    return None


def build(source: Path, output: Path, limit: int = 120) -> dict:
    revision = subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip()
    if revision != REVISION:
        raise ValueError(f"Expected pinned revision {REVISION}; found {revision}")
    if "Apache License" not in (source / "LICENSE").read_text(encoding="utf-8"):
        raise ValueError("Missing Apache license")
    buckets: dict[str, list] = defaultdict(list)
    # Prefer named problems. Never visit or copy the linked third-party websites.
    for folder in ["Millennium", "Wikipedia", "Other", "GreensOpenProblems", "ErdosProblems"]:
        for path in sorted((source / "FormalConjectures" / folder).glob("*.lean")):
            row = extract(path.read_text(encoding="utf-8"), path.relative_to(source).as_posix())
            if row:
                buckets[row["field"]].append(row)
    selected, seen = [], set()
    while len(selected) < limit and any(buckets.values()):
        for field in sorted(buckets):
            if not buckets[field] or len(selected) >= limit:
                continue
            row = buckets[field].pop(0)
            fingerprint = re.sub(r"\s+", " ", row["statement"]).strip().casefold()
            if fingerprint in seen:
                continue
            seen.add(fingerprint)
            selected.append(row)
    if len(selected) < limit:
        raise ValueError(f"Only {len(selected)} safe documented records, requested {limit}")
    selected.sort(key=lambda row: row["source_title"].casefold())
    output.mkdir(parents=True, exist_ok=True)
    archive = output / "upstream" / "formal-conjectures"
    for row in selected:
        path = row["provenance"]["path"]
        target = archive / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((source / path).read_text(encoding="utf-8").encode("utf-8"))
    for name in ["LICENSE", "AUTHORS"]:
        if (source / name).exists():
            (archive / name).write_bytes((source / name).read_bytes())
    # Discovery edges have a documented mechanical basis; never mathematical implications.
    edges = []
    for field in sorted({row["field"] for row in selected}):
        group = [row for row in selected if row["field"] == field]
        for first, second in zip(group, group[1:]):
            if set(first["MSC"]) & set(second["MSC"]):
                edges.append({"source_id": first["id"], "target_id": second["id"],
                    "type": "related_to", "evidence_url": first["source_urls"][0],
                    "evidence_urls": [first["source_urls"][0], second["source_urls"][0]],
                    "review_status": "unverified", "review_date": None,
                    "basis": "Shared upstream AMS subject tag; a navigation association only, not a logical or mathematical dependency."})
    manifest = {"schema_version": "0.1.0", "revision": REVISION, "retrieved_at": DATE,
        "license": "Apache-2.0", "problem_count": len(selected),
        "relationship_count": len(edges), "independently_verified_count": 0,
        "fields": dict(sorted(Counter(row["field"] for row in selected).items())),
        "policy": "All imports and discovery edges unverified; mathematical status unknown; no Lean execution performed.",
        "files": [{"path": row["provenance"]["path"], "sha256": row["provenance"]["sha256"]} for row in selected]}
    for name, value in [("problems.json", selected), ("relationships.json", edges), ("manifest.json", manifest)]:
        (output / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("data"))
    parser.add_argument("--limit", type=int, default=120)
    args = parser.parse_args()
    print(json.dumps(build(args.source, args.output, args.limit), ensure_ascii=True, indent=2))
