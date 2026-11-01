#!/usr/bin/env python3
"""Stamp content hashes onto the CSS and JS references in every page.

The stylesheet and the script are served with `Cache-Control: immutable`
(see `_headers`), so the URL has to change whenever the file changes.
This script rewrites `assets/css/styles.css` to
`assets/css/styles.css?v=<sha256 of the file, first 8 hex>`, and strips and
re-adds the query on every run, so it is safe to run repeatedly and
produces no diff when nothing changed.

Run it after any edit to `assets/css/` or `assets/js/`, then commit both the
assets and the pages in the same commit.

    python3 scripts/stamp-assets.py
"""

from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ["assets/css/styles.css", "assets/css/fonts.css", "assets/js/main.js"]


def digest(rel_path: str) -> str:
    data = (ROOT / rel_path).read_bytes()
    return hashlib.sha256(data).hexdigest()[:8]


def stamp(html: str, assets: dict[str, str]) -> str:
    for rel_path, version in assets.items():
        # match an existing ?v=... query or none at all, in href/src and in
        # the path-rewriting patterns 404.html uses
        pattern = re.compile(r"((?:\.\./)*|/|)(?:" + re.escape(rel_path) + r")(\?v=[0-9a-f]{8})?")
        html = pattern.sub(lambda m: f"{m.group(1)}{rel_path}?v={version}", html)
    return html


def main() -> int:
    assets = {p: digest(p) for p in ASSETS if (ROOT / p).exists()}
    for rel_path, version in assets.items():
        print(f"{rel_path} -> ?v={version}")

    pages = sorted(p for p in ROOT.rglob("*.html") if "brand-lab" not in p.parts)
    changed = 0
    for page in pages:
        before = page.read_text()
        after = stamp(before, assets)
        if after != before:
            page.write_text(after)
            changed += 1
            print(f"  stamped {page.relative_to(ROOT)}")
    print(f"{changed} page(s) updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
