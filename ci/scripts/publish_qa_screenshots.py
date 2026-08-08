#!/usr/bin/env python3
"""Upload the negative-QA agent's screenshots and turn its ![](SCREENSHOT:name.png) tokens
into real URLs, so evidence renders inline in the PR comment.

Usage: publish_qa_screenshots.py <artifacts-dir> <report.md>
Env: PR_NUMBER, GITHUB_RUN_ID, optionally GOOGLE_APPLICATION_CREDENTIALS.
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
    # Playwright MCP's --output-dir covers console logs and snapshots but NOT screenshots:
    # browser_take_screenshot writes relative to cwd. Without this they never appear.
    for png in Path(".").glob("*.png"):
        print(f"recovering screenshot from workspace root: {png.name}")
        shutil.move(str(png), str(artifacts / png.name))


def resolve_urls(names: list[str], prefix: str) -> dict[str, str]:
    if not names:
        return {}

    # Rejected on a bucket with uniform access, which is fine — signed URLs below.
    run(["gsutil", "-m", "acl", "ch", "-u", "AllUsers:R", f"{BUCKET}/{prefix}/*.png"])

    try:
        urllib.request.urlopen(f"{PUBLIC_BASE}/{prefix}/{names[0]}", timeout=10).close()
        print("bucket objects are publicly readable — using direct URLs")
        return {n: f"{PUBLIC_BASE}/{prefix}/{n}" for n in names}
    except Exception:
        pass

    creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not creds:
        print("::warning::Screenshots uploaded but not addressable; the comment will "
              "reference the run artifact.")
        return {}

    # 7d is gsutil's max; GitHub's camo proxy caches on first render so the image outlives it.
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
    linked, on_disk, missing = [], [], []

    def replace(match: "re.Match[str]") -> str:
        caption, name = match.group(1), match.group(2).strip()
        if name in urls:
            linked.append(name)
            return f"![{caption}]({urls[name]})"
        if (artifacts / name).is_file():
            on_disk.append(name)
            return f"_evidence: `{name}` — see the `negative-qa-artifacts` run artifact_"
        # Never-captured is called out rather than pointed at the artifact, so an unevidenced
        # report doesn't read as evidenced.
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
        rewrite_report(report, {}, artifacts)
        return 0

    # Nested under a prefix so ci.yaml's `gsutil rm gs://cypress_screenshots/*` can't reach it.
    prefix = (f"negative-qa/pr-{os.environ.get('PR_NUMBER', 'unknown')}"
              f"/{os.environ.get('GITHUB_RUN_ID', 'local')}")
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
