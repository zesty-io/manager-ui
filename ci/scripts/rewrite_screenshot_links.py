#!/usr/bin/env python3
"""Rewrite SCREENSHOT: evidence tokens in the negative-QA report to real image URLs.

The QA agent has no idea where its screenshots will end up, so it writes evidence as

    ![caption](SCREENSHOT:some-file.png)

and this script substitutes each token once upload_qa_screenshots.sh has given the file an
address. A token with no matching URL is downgraded to plain text pointing at the run
artifact rather than left as a broken image — a comment full of broken image icons reads as
"the tool is broken" even when the findings are good.

Usage: rewrite_screenshot_links.py <report.md> <url-map>
where <url-map> is lines of "<filename> <url>", or /dev/null when nothing was uploaded.
"""

import re
import sys

TOKEN = re.compile(r"!\[([^\]]*)\]\(SCREENSHOT:([^)]+)\)")


def main() -> int:
    report_path, url_map_path = sys.argv[1], sys.argv[2]

    urls = {}
    try:
        with open(url_map_path, encoding="utf-8") as fh:
            for line in fh:
                parts = line.strip().split(" ", 1)
                if len(parts) == 2:
                    urls[parts[0]] = parts[1]
    except OSError:
        pass

    with open(report_path, encoding="utf-8") as fh:
        body = fh.read()

    missing = []

    def replace(match: "re.Match[str]") -> str:
        caption, name = match.group(1), match.group(2).strip()
        url = urls.get(name)
        if url:
            return f"![{caption}]({url})"
        missing.append(name)
        return f"_evidence: `{name}` — see the `negative-qa-artifacts` run artifact_"

    rewritten = TOKEN.sub(replace, body)

    with open(report_path, "w", encoding="utf-8") as fh:
        fh.write(rewritten)

    resolved = len(urls)
    print(f"Rewrote {resolved} screenshot link(s); {len(missing)} unresolved.")
    if missing:
        print("Unresolved: " + ", ".join(sorted(set(missing))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
