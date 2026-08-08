#!/usr/bin/env python3
"""Publish the negative-QA agent's screenshots and turn its evidence tokens into real URLs.

CI only. Companion to upload_debug_screenshots_to_gcp.sh.

The agent writes evidence as ![caption](SCREENSHOT:<filename>.png). A PR comment can only show
an image it can fetch over HTTP, and GitHub has no API for attaching one, so each file needs an
address before the token can be rewritten.

Two things here are non-obvious and were each paid for in failed runs:

1. Playwright MCP's --output-dir governs console logs and page snapshots but NOT screenshots.
   browser_take_screenshot runs page.screenshot({path: './<name>'}), which resolves against the
   process cwd — so evidence lands at the workspace root while everything else lands in the
   output dir. Sweeping those in is what makes screenshots appear at all; without it the run
   reports "no screenshots captured", which looks exactly like the agent skipping evidence.

2. Uploads go under a negative-qa/pr-<N>/<run>/ prefix. ci.yaml's setup job runs
   `gsutil rm gs://cypress_screenshots/*` at the start of every PR run, and gsutil's `*` does
   not match across a `/`, so anything nested under a prefix survives another PR's run. That
   guarantee is subtle, which is why the workflow also keeps a GitHub artifact.

Usage: publish_qa_screenshots.py <artifacts-dir> <report.md>
Environment: PR_NUMBER, GITHUB_RUN_ID, optionally GOOGLE_APPLICATION_CREDENTIALS.
"""

import os
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

BUCKET = "gs://cypress_screenshots"
PUBLIC_BASE = "https://storage.googleapis.com/cypress_screenshots"
TOKEN = re.compile(r"!\[([^\]]*)\]\(SCREENSHOT:([^)]+)\)")


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def sweep_workspace_root(artifacts: Path) -> None:
    """Move screenshots Playwright wrote to cwd into the artifacts dir. maxdepth 1 only —
    the repo's own PNGs all live in subdirectories."""
    for png in Path(".").glob("*.png"):
        print(f"recovering screenshot from workspace root: {png.name}")
        shutil.move(str(png), str(artifacts / png.name))


def resolve_urls(names: list[str], prefix: str) -> dict[str, str]:
    """Map filename -> fetchable URL, preferring public objects over signed ones."""
    if not names:
        return {}

    # On a bucket with uniform bucket-level access this is rejected, which is fine.
    run(["gsutil", "-m", "acl", "ch", "-u", "AllUsers:R", f"{BUCKET}/{prefix}/*.png"])

    probe = f"{PUBLIC_BASE}/{prefix}/{names[0]}"
    try:
        urllib.request.urlopen(probe, timeout=10).close()
        print("bucket objects are publicly readable — using direct URLs")
        return {n: f"{PUBLIC_BASE}/{prefix}/{n}" for n in names}
    except Exception:
        pass

    creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds:
        print("::warning::Screenshots uploaded but not addressable; the comment will "
              "reference the run artifact.")
        return {}

    # 7d is gsutil's maximum. GitHub's camo image proxy fetches and caches on first render,
    # so the image keeps working in the comment long after the URL itself expires.
    print("bucket is not public — signing URLs")
    urls = {}
    for name in names:
        out = run(["gsutil", "signurl", "-d", "7d", creds, f"{BUCKET}/{prefix}/{name}"])
        if out.returncode == 0 and out.stdout:
            lines = [l for l in out.stdout.splitlines() if l.strip()]
            if len(lines) > 1:
                urls[name] = lines[-1].split()[-1]
    return urls


def rewrite_report(report: Path, urls: dict[str, str], artifacts: Path) -> None:
    """Swap each SCREENSHOT: token for a URL.

    Three outcomes are deliberately distinguished. Reporting a never-captured screenshot as
    "see the artifact" sends a reviewer hunting for a file nobody took, and makes an
    unevidenced report look evidenced — so that case is called out and warned about.
    """
    linked, on_disk, missing = [], [], []

    def replace(match: "re.Match[str]") -> str:
        caption, name = match.group(1), match.group(2).strip()
        if name in urls:
            linked.append(name)
            return f"![{caption}]({urls[name]})"
        if (artifacts / name).is_file():
            on_disk.append(name)
            return f"_evidence: `{name}` — see the `negative-qa-artifacts` run artifact_"
        missing.append(name)
        return f"_⚠️ no screenshot was captured for this finding (`{name}`)_"

    report.write_text(TOKEN.sub(replace, report.read_text(encoding="utf-8")), encoding="utf-8")

    print(f"Screenshot links: {len(linked)} linked, {len(on_disk)} artifact-only, "
          f"{len(missing)} never captured.")
    if missing:
        print("::warning::Report cites screenshots that were never captured: "
              + ", ".join(sorted(set(missing))))


def main() -> int:
    artifacts = Path(sys.argv[1] if len(sys.argv) > 1 else "qa-artifacts")
    report = Path(sys.argv[2] if len(sys.argv) > 2 else "negative-qa-comment.md")

    if not report.is_file():
        print(f"No report at {report} — nothing to rewrite.")
        return 0

    artifacts.mkdir(parents=True, exist_ok=True)
    sweep_workspace_root(artifacts)

    shots = sorted(p.name for p in artifacts.glob("*.png"))
    if not shots:
        print(f"No screenshots in {artifacts}.")
        rewrite_report(report, {}, artifacts)  # still strip tokens so no broken links render
        return 0

    prefix = f"negative-qa/pr-{os.environ.get('PR_NUMBER', 'unknown')}/{os.environ.get('GITHUB_RUN_ID', 'local')}"
    print("***** UPLOADING NEGATIVE-QA SCREENSHOTS *****")
    for name in shots:
        print(f"  {name}")

    upload = run(["gsutil", "-m", "cp", *[str(artifacts / n) for n in shots], f"{BUCKET}/{prefix}/"])
    if upload.returncode != 0:
        print("::warning::Failed to upload screenshots to GCS; the comment will reference "
              "the run artifact instead.")
        rewrite_report(report, {}, artifacts)
        return 0

    rewrite_report(report, resolve_urls(shots, prefix), artifacts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
