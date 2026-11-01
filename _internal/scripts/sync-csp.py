#!/usr/bin/env python3
"""Recompute the inline-script hashes in every page's Content-Security-Policy.

The pages carry a `<meta http-equiv="Content-Security-Policy">` because the
GitHub Pages origin has no way to set headers. That policy used to allow
`script-src 'self' 'unsafe-inline'`, which permits any injected inline script.
Now it lists a SHA-256 hash per inline script instead, so the theme script and
the 404 path rewriter can run and nothing else can.

Edit an inline script and the hash has to change with it — otherwise the
browser blocks it and the theme silently stops applying. Run this after any
edit inside a `<script>` block without `src`:

    python3 _internal/scripts/sync-csp.py

It rewrites the `script-src` directive of every page, and the union of all
hashes in `_headers` (Cloudflare sends one policy for the whole site, so that
copy has to list every hash used anywhere).
"""

from __future__ import annotations

import base64
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LD_JSON = re.compile(r"<script[^>]*application/ld\+json", re.I)
INLINE = re.compile(r"<script(?![^>]*\bsrc=)(?!([^>]*)application/ld\+json)([^>]*)>(.*?)</script>", re.S)
SCRIPT_SRC = re.compile(r"script-src [^;]+;")


def hashes_for(html: str) -> list[str]:
    out = []
    for m in INLINE.finditer(html):
        digest = hashlib.sha256(m.group(3).encode("utf-8")).digest()
        out.append("'sha256-" + base64.b64encode(digest).decode("ascii") + "'")
    return out


def main() -> int:
    pages = sorted(p for p in ROOT.rglob("*.html") if "brand-lab" not in p.parts)
    union: list[str] = []
    changed = 0

    for page in pages:
        html = page.read_text()
        hashes = hashes_for(html)
        if not hashes:
            continue
        directive = "script-src 'self' " + " ".join(hashes) + ";"
        new_html, n = SCRIPT_SRC.subn(directive, html, count=1)
        if n == 0:
            print(f"  no script-src in {page.relative_to(ROOT)} — skipped")
        elif new_html != html:
            page.write_text(new_html)
            changed += 1
        for h in hashes:
            if h not in union:
                union.append(h)

    headers = ROOT / "_headers"
    if headers.exists() and union:
        text = headers.read_text()
        directive = "script-src 'self' " + " ".join(union) + ";"
        new_text = SCRIPT_SRC.sub(directive, text, count=1)
        if new_text != text:
            headers.write_text(new_text)
            changed += 1

    print(f"hashes in use: {len(union)}")
    for h in union:
        print("  " + h)
    print(f"{changed} file(s) updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
