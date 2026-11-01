#!/usr/bin/env python3
"""Keep sitemap lastmod dates and the feed build date honest.

`<lastmod>` is only useful to a crawler if it is true. Hand-edited dates rot
on the first commit that forgets them, so this derives them from git: each
`<loc>` is mapped back to its file and stamped with that file's last commit
date (or today, when the working tree has uncommitted changes to it). The
feed's `<lastBuildDate>` becomes the newest of the note dates.

Run before committing anything that touches a page:

    python3 scripts/sync-dates.py
"""

from __future__ import annotations

import datetime as dt
import re
import subprocess
import sys
from email.utils import format_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://www.jphsystems.io/"


def last_commit_date(path: Path) -> str | None:
    rel = str(path.relative_to(ROOT))
    if not path.exists():
        return None
    committed = subprocess.run(
        ["git", "log", "-1", "--format=%ad", "--date=short", "--", rel],
        cwd=ROOT, capture_output=True, text=True,
    ).stdout.strip()
    dirty = subprocess.run(
        ["git", "status", "--porcelain", "--", rel],
        cwd=ROOT, capture_output=True, text=True,
    ).stdout.strip()
    if dirty:
        return dt.date.today().isoformat()
    return committed or None


def file_for_url(url: str) -> Path:
    path = url[len(BASE):] if url.startswith(BASE) else url
    if path.endswith("/") or path == "":
        path += "index.html"
    elif not path.endswith(".html"):
        path += ".html"
    return ROOT / path


def main() -> int:
    sitemap = ROOT / "sitemap.xml"
    text = sitemap.read_text()
    newest = dt.date.min.isoformat()

    def fix(match: re.Match[str]) -> str:
        block = match.group(0)
        loc = re.search(r"<loc>([^<]+)</loc>", block)
        if not loc:
            return block
        stamp = last_commit_date(file_for_url(loc.group(1).strip()))
        if not stamp:
            return block
        nonlocal newest
        newest = max(newest, stamp)
        if "<lastmod>" in block:
            return re.sub(r"<lastmod>[^<]*</lastmod>", f"<lastmod>{stamp}</lastmod>", block)
        return block.replace("</loc>", f"</loc>\n    <lastmod>{stamp}</lastmod>", 1)

    updated = re.sub(r"  <url>.*?</url>", fix, text, flags=re.S)
    if updated != text:
        sitemap.write_text(updated)

    # feed: newest note date as lastBuildDate
    feed = ROOT / "notes" / "feed.xml"
    if feed.exists():
        feed_text = feed.read_text()
        newest_note = dt.date.min
        for match in re.finditer(r"<link>(" + re.escape(BASE) + r"notes/[^<]+)</link>", feed_text):
            stamp = last_commit_date(file_for_url(match.group(1).strip()))
            if stamp:
                newest_note = max(newest_note, dt.date.fromisoformat(stamp))
        if newest_note > dt.date.min:
            built = format_datetime(dt.datetime.combine(newest_note, dt.time(9, 0), tzinfo=dt.timezone.utc))
            new_feed = re.sub(r"<lastBuildDate>[^<]*</lastBuildDate>", f"<lastBuildDate>{built}</lastBuildDate>", feed_text)
            if new_feed != feed_text:
                feed.write_text(new_feed)

    for match in re.finditer(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", sitemap.read_text()):
        print(f"  {match.group(2)}  {match.group(1)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
