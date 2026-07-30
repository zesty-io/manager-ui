#!/bin/bash

# This script is for CI only. Companion to upload_debug_screenshots_to_gcp.sh.

# Problem
# The negative-QA agent captures screenshots as evidence for each finding, but a PR comment
# can only show an image it can fetch over HTTP. GitHub has no API for attaching images to a
# comment, so the files have to live somewhere addressable first.

# Solution
# Reuse the existing cypress_screenshots bucket, but under a negative-qa/pr-<N>/<run>/ prefix.
# That prefix matters: ci.yaml's setup job runs `gsutil rm gs://cypress_screenshots/*` at the
# start of every PR run, and gsutil's `*` does not match across a `/` boundary — so anything
# nested under a prefix survives another PR's CI run. (The workflow also uploads a GitHub
# artifact as the durable copy, because that guarantee is subtle.)
#
# The agent writes evidence links as ![caption](SCREENSHOT:<filename>.png); this script
# rewrites each SCREENSHOT: token to a real URL once the file has an address.

set -uo pipefail

ARTIFACTS_DIR="${1:-qa-artifacts}"
REPORT_FILE="${2:-negative-qa-comment.md}"
BUCKET="gs://cypress_screenshots"
PREFIX="negative-qa/pr-${PR_NUMBER}/${GITHUB_RUN_ID}"

if [ ! -f "$REPORT_FILE" ]; then
    echo "No report at $REPORT_FILE — nothing to rewrite."
    exit 0
fi

if [ ! -d "$ARTIFACTS_DIR" ] || [ -z "$(find "$ARTIFACTS_DIR" -type f -name '*.png' 2>/dev/null)" ]; then
    echo "No screenshots in $ARTIFACTS_DIR."
    # Still strip the tokens so the comment never renders a broken SCREENSHOT: link.
    python3 ci/scripts/rewrite_screenshot_links.py "$REPORT_FILE" /dev/null "$ARTIFACTS_DIR"
    exit 0
fi

echo "***** UPLOADING NEGATIVE-QA SCREENSHOTS *****"
find "$ARTIFACTS_DIR" -type f -name "*.png" -exec basename {} \;

gsutil -m cp "$ARTIFACTS_DIR"/*.png "$BUCKET/$PREFIX/" || {
    echo "::warning::Failed to upload screenshots to GCS; the comment will reference the run artifact instead."
    python3 ci/scripts/rewrite_screenshot_links.py "$REPORT_FILE" /dev/null "$ARTIFACTS_DIR"
    exit 0
}

FIRST_OBJECT=$(basename "$(find "$ARTIFACTS_DIR" -type f -name '*.png' | head -n1)")

# Prefer plain public URLs. On a bucket with uniform bucket-level access this ACL change is
# rejected, which is fine — we fall back to signed URLs below.
gsutil -m acl ch -u AllUsers:R "$BUCKET/$PREFIX/*.png" >/dev/null 2>&1

URL_MAP=$(mktemp)

if curl -sfI "https://storage.googleapis.com/cypress_screenshots/$PREFIX/$FIRST_OBJECT" >/dev/null 2>&1; then
    echo "bucket objects are publicly readable — using direct URLs"
    for shot in "$ARTIFACTS_DIR"/*.png; do
        name=$(basename "$shot")
        echo "$name https://storage.googleapis.com/cypress_screenshots/$PREFIX/$name" >> "$URL_MAP"
    done
elif [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]; then
    # google-github-actions/auth exports GOOGLE_APPLICATION_CREDENTIALS pointing at a key file.
    # 7d is the maximum; GitHub's camo image proxy fetches and caches on first render, so the
    # image keeps working in the comment long after the URL itself expires.
    echo "bucket is not public — signing URLs"
    for shot in "$ARTIFACTS_DIR"/*.png; do
        name=$(basename "$shot")
        signed=$(gsutil signurl -d 7d "$GOOGLE_APPLICATION_CREDENTIALS" "$BUCKET/$PREFIX/$name" 2>/dev/null | awk 'NR>1 {print $NF}')
        if [ -n "$signed" ]; then
            echo "$name $signed" >> "$URL_MAP"
        fi
    done
else
    echo "::warning::Screenshots uploaded but not addressable; the comment will reference the run artifact."
fi

python3 ci/scripts/rewrite_screenshot_links.py "$REPORT_FILE" "$URL_MAP" "$ARTIFACTS_DIR"
rm -f "$URL_MAP"

echo "***** DONE *****"
