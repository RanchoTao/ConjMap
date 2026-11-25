"""Sync the 120 existing ConjMap records with a newer google-deepmind/formal-conjectures checkout.

Maintenance only: this never adds, removes or reselects problems and never changes a
mathematical status. For each archived source file it either

* updates the file and every record that cites it (statement text, Lean signature,
  line span, hash, revision, URLs), or
* holds the file at its old revision and explains why in the report, when the change
  needs a human: the theorem is gone or no longer tagged `research open`, its title,
  field or AMS tags changed, a reviewed statement changed, or a claim's Lean text changed.

Usage:
    git clone --depth 1 https://github.com/google-deepmind/formal-conjectures /tmp/fc
    python scripts/sync-formal-conjectures.py --source /tmp/fc --report sync-report.md
    npx tsx scripts/build-dedup-report.ts   # statements may have changed
    npm run check

Exit code 0 means the data directory was processed (with or without changes).
The report starts with `CHANGED=yes` or `CHANGED=no` on its first line for CI.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "adapters"))
from formal_conjectures import REPO, extract  # noqa: E402

DATA = ROOT / "data"
ARCHIVE = DATA / "upstream" / "formal-conjectures"
V02 = DATA / "v02"
# Fields an upstream edit may change without a human looking at it.
DRIFT_FIELDS = {"source_mappings", "statement", "latex", "formal_statement", "source_urls", "references", "status_evidence", "provenance"}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def dump(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_lf(path: Path) -> str:
    # Same normalisation as the adapter: universal newlines, UTF-8.
    return path.read_text(encoding="utf-8")


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def span_url(revision: str, path: str, start: int, end: int) -> str:
    return f"{REPO}/blob/{revision}/{path}#L{start}-L{end}"


def locate_claim(text: str, theorem: str) -> tuple[str, int, int] | None:
    for marker in (f"theorem {theorem} ", f"theorem {theorem}\n"):
        i = text.find(marker)
        if i >= 0:
            j = text.find(":=", i)
            if j < 0:
                return None
            return text[i:j].strip(), text.count("\n", 0, i) + 1, text.count("\n", 0, j) + 1
    return None


def category(text: str, theorem: str) -> str:
    """Best-effort upstream category label for a theorem, for the report only."""
    i = text.find(f"theorem {theorem}")
    if i < 0:
        return "theorem not found"
    attrs = text.rfind("@[", 0, i)
    if attrs < 0:
        return "no attributes"
    block = text[attrs:text.find("]", attrs) + 1]
    for part in block.strip("@[]").split(","):
        if part.strip().startswith("category"):
            return part.strip()
    return "no category"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", type=Path, required=True, help="checkout of google-deepmind/formal-conjectures")
    parser.add_argument("--report", type=Path, required=True, help="Markdown report to write (used as PR body)")
    parser.add_argument("--date", default=dt.date.today().isoformat())
    args = parser.parse_args()

    source: Path = args.source
    revision = subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip()
    if "Apache License" not in read_lf(source / "LICENSE"):
        raise SystemExit("Upstream LICENSE is no longer Apache; refusing to sync.")

    problems = load(DATA / "problems.json")
    edges = load(DATA / "relationships.json")
    manifest = load(DATA / "manifest.json")
    registry = load(V02 / "id-registry.json")
    claims = load(V02 / "claims.json")
    relations = load(V02 / "relations.json")
    reviews = load(V02 / "review-events.json")
    dossiers = load(V02 / "dossiers.json")
    reviewed = {r["problem_id"] for r in reviews}

    old_manifest_rev = manifest["revision"]
    url_map: dict[str, str] = {}
    updated, unchanged, held = [], [], []
    new_rows: dict[str, dict] = {}
    new_claims: dict[str, dict] = {}
    new_files: dict[str, str] = {}

    for row in problems:
        path = row["provenance"]["path"]
        old_rev = row["provenance"]["revision"]
        theorem = row["aliases"][1]
        upstream = source / path
        if not upstream.exists():
            held.append((path, row["id"], "file removed upstream"))
            continue
        text = read_lf(upstream)
        file_changed = sha(text) != row["provenance"]["sha256"]
        new = extract(text, path, revision, args.date)
        if new is None or new["aliases"][1] != theorem:
            found = new["aliases"][1] if new else None
            reason = f"`{theorem}` no longer extracts as research open ({category(text, theorem)})"
            if found:
                reason += f"; first open theorem in file is now `{found}`"
            held.append((path, row["id"], reason))
            continue
        changed_keys = sorted(k for k in row if row[k] != new.get(k) and k not in DRIFT_FIELDS)
        if changed_keys:
            held.append((path, row["id"], "changed fields need review: " + ", ".join(changed_keys)))
            continue
        canonical = registry[row["id"]]
        if new["statement"] != row["statement"] and canonical in reviewed:
            held.append((path, row["id"], f"statement changed but {canonical} has a dossier review bound to the old text"))
            continue
        # Claims (substantive relation endpoints) living in the same file.
        claim_updates, claim_problem = {}, None
        for claim in (c for c in claims if c["source_path"] == path):
            located = locate_claim(text, claim["title"])
            if located is None or located[0] != claim["formal_statement"]:
                claim_problem = f"claim `{claim['title']}` Lean text changed or disappeared"
                break
            _, start, end = located
            new_url = span_url(revision, path, start, end)
            url_map[claim["url"]] = new_url
            claim_updates[claim["id"]] = {**claim, "source_sha256": sha(text), "start_line": start,
                                          "end_line": end, "url": new_url}
        if claim_problem:
            held.append((path, row["id"], claim_problem))
            continue
        old_url = row["status_evidence"][0]["url"]
        url_map[old_url] = new["status_evidence"][0]["url"]
        new_rows[row["id"]] = new
        new_claims.update(claim_updates)
        new_files[path] = text
        (updated if file_changed else unchanged).append((path, row["id"], old_rev,
            "statement text changed" if new["statement"] != row["statement"] else
            ("Lean signature changed" if new["formal_statement"] != row["formal_statement"] else
             ("line span moved" if new["provenance"]["start_line"] != row["provenance"]["start_line"] else "other text in file changed"))))

    def remap(value):
        if isinstance(value, str):
            return url_map.get(value, value)
        if isinstance(value, list):
            return [remap(v) for v in value]
        if isinstance(value, dict):
            return {k: remap(v) for k, v in value.items()}
        return value

    # Write archived sources and records.
    for path, text in new_files.items():
        (ARCHIVE / path).parent.mkdir(parents=True, exist_ok=True)
        (ARCHIVE / path).write_bytes(text.encode("utf-8"))
    for name in ["LICENSE", "AUTHORS"]:
        if (source / name).exists() and new_files:
            (ARCHIVE / name).write_bytes((source / name).read_bytes())
    problems = [new_rows.get(row["id"], row) for row in problems]
    claims = [new_claims.get(c["id"], c) for c in claims]
    edges = remap(edges)
    reviews = remap(reviews)
    dossiers = remap(dossiers)
    for rel in relations:
        rel["evidence_url"] = remap(rel["evidence_url"])
        if f"/blob/{revision}/" in rel["evidence_url"]:
            rel["source_revision"] = revision
    for dossier in dossiers:
        row = next((r for r in problems if registry[r["id"]] == dossier["problem_id"]), None)
        if row and row["provenance"]["path"] == dossier["source_path"]:
            dossier["source_sha256"] = row["provenance"]["sha256"]

    synced_any = bool(new_files) and revision != old_manifest_rev
    manifest["files"] = [{"path": r["provenance"]["path"], "sha256": r["provenance"]["sha256"],
                          "revision": r["provenance"]["revision"]} for r in problems]
    if synced_any:
        manifest["revision"] = revision
        manifest["retrieved_at"] = args.date
    if held:
        manifest["policy"] = ("All imports and discovery edges unverified; mathematical status unknown; no Lean execution "
                              "performed. Files listed with an older revision were held back by the upstream sync for review.")

    dump(DATA / "problems.json", problems)
    dump(DATA / "relationships.json", edges)
    dump(DATA / "manifest.json", manifest)
    dump(V02 / "claims.json", claims)
    dump(V02 / "relations.json", relations)
    dump(V02 / "review-events.json", reviews)
    dump(V02 / "dossiers.json", dossiers)

    changed = subprocess.run(["git", "-C", str(ROOT), "diff", "--quiet", "--", "data"]).returncode != 0
    lines = [f"CHANGED={'yes' if changed else 'no'}", "",
             f"Automated sync of the 120 ConjMap records against "
             f"[google-deepmind/formal-conjectures@{revision[:12]}]({REPO}/tree/{revision}) on {args.date}.", "",
             "This PR was opened automatically and is **not merged automatically**. It only re-reads the "
             "same 120 upstream theorems: no problems are added or removed and every ConjMap status stays "
             "`unknown`. Nothing here has been independently verified.", "",
             f"- Records updated from changed upstream files: **{len(updated)}**",
             f"- Records whose files were unchanged (revision/URL bump only): **{len(unchanged)}**",
             f"- Records held at their previous revision for human review: **{len(held)}**", ""]
    if updated:
        lines += ["## Updated", "", "| Record | File | What changed |", "| --- | --- | --- |"]
        lines += [f"| `{registry[i]}` | `{p}` | {why} |" for p, i, _, why in updated] + [""]
    if held:
        lines += ["## Held for review", "",
                  "These records keep their old revision and archived file. Decide by hand whether to update, "
                  "re-review or retire them.", "", "| Record | File | Reason |", "| --- | --- | --- |"]
        lines += [f"| `{registry[i]}` | `{p}` | {why} |" for p, i, why in held] + [""]
    args.report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines[:9]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
