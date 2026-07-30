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
An optional third argument is the artifacts directory, used to tell two very different
situations apart: a screenshot that exists but could not be given a URL, versus a screenshot
the agent referenced but never actually captured. Reporting the second as "see the artifact"
sends reviewers hunting for a file that was never taken, so it is called out as missing and
raised as a warning on the run.
"""

import os
import re
import sys

TOKEN = re.compile(r"!\[([^\]]*)\]\(SCREENSHOT:([^)]+)\)")


def main() -> int:
    report_path, url_map_path = sys.argv[1], sys.argv[2]
    artifacts_dir = sys.argv[3] if len(sys.argv) > 3 else None

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

    on_disk, never_captured = [], []

    def replace(match: "re.Match[str]") -> str:
        caption, name = match.group(1), match.group(2).strip()
        url = urls.get(name)
        if url:
            return f"![{caption}]({url})"
        exists = bool(
            artifacts_dir and os.path.isfile(os.path.join(artifacts_dir, name))
        )
        if exists:
            on_disk.append(name)
            return f"_evidence: `{name}` — see the `negative-qa-artifacts` run artifact_"
        never_captured.append(name)
        return f"_⚠️ no screenshot was captured for this finding (`{name}`)_"

    rewritten = TOKEN.sub(replace, body)

    with open(report_path, "w", encoding="utf-8") as fh:
        fh.write(rewritten)

    print(
        f"Screenshot links: {len(urls)} linked, "
        f"{len(on_disk)} artifact-only, {len(never_captured)} never captured."
    )
    if on_disk:
        print("Artifact-only: " + ", ".join(sorted(set(on_disk))))
    if never_captured:
        # A finding whose evidence was never taken is a prompt-compliance failure, not a
        # cosmetic one — surface it on the run rather than letting the report imply proof.
        print(
            "::warning::Report cites screenshots that were never captured: "
            + ", ".join(sorted(set(never_captured)))
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
