"""Bounded metadata probes only. No crawling, import or content redistribution."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import urllib.request

URLS = [
    "https://www.erdosproblems.com/", "https://api.github.com/repos/teorth/erdosproblems",
    "https://aimath.org/problemlists/", "https://api.github.com/repos/google-deepmind/formal-conjectures",
    "https://raw.githubusercontent.com/google-deepmind/formal-conjectures/2c24ebe7eb2a79b47f9ffcab618cd611c2bc1ea6/LICENSE",
    "https://huggingface.co/datasets/ulamai/UnsolvedMath/raw/main/README.md",
    "https://huggingface.co/datasets/OpenConjecture/openconjecture/raw/main/README.md",
    "https://www.openproblemgarden.org/", "https://openproblem.ai/mathematical-discovery-ledger/legal",
    "https://cairn-commons.com/", "https://cairncommons.dev/about",
]


def probe(url):
    result = {"url": url, "checked_at_utc": datetime.now(timezone.utc).isoformat()}
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ConjMap/0.1 source-audit (bounded metadata review)"})
        with urllib.request.urlopen(req, timeout=25) as response:
            data = response.read(262145)
            result.update(status=response.status, final_url=response.url,
                content_type=response.headers.get("Content-Type"), truncated=len(data) > 262144,
                bytes_read=len(data), sha256=hashlib.sha256(data).hexdigest())
            if "api.github.com/repos/" in url:
                repo = json.loads(data)
                result["repository_metadata"] = {k: repo.get(k) for k in ["full_name", "pushed_at", "archived", "default_branch", "license"]}
    except Exception as error:
        result.update(status=getattr(error, "code", None), error=str(error))
    return result


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(probe, URLS))
    destination = Path("docs/source-access.json")
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps({"policy":"Single bounded GET per explicit audit URL; no crawling; response bodies not redistributed.","probes":results},indent=2)+"\n",encoding="utf-8")
    print(json.dumps([{"url":r["url"], "status":r["status"]} for r in results],indent=2))
