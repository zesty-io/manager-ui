#!/bin/bash

# What is the purpose of this script? Why was it made?

# Problem
# `tsc --noEmit` reports around twenty errors that originate in node_modules declaration files
# (react-window/csstype, unplugin, react-use). None of them are actionable in this repo, and they
# move whenever dependencies re-resolve, so tsc's own exit code can never be used as a CI gate.

# Solution
# Two checks, and they are opposites on purpose.
#
# 1. Diagnostics — run the typecheck and ignore only the errors that point at a file under
#    node_modules/. The filter is a deny-list. An allow-list ("keep the errors under src/") drops
#    every config-level diagnostic, because those are not attributed to a file we own: a malformed
#    tsconfig.json reports TS1005 against tsconfig.json itself. It would also drop errors in
#    index.d.ts, which tsconfig.json includes alongside src/.
#
# 2. Coverage — assert that tsc actually read every .ts/.tsx file git tracks under src/.
#    A deny-list catches diagnostics; this catches their absence. Repointing `include` at a
#    directory that does not exist, or adding `"exclude": ["src/**/*"]`, does not produce a
#    diagnostic at all: tsconfig.json also includes index.d.ts, so tsc still has one input, checks
#    it, finds nothing and exits 0. Measured — under either edit tsc reads exactly one non-lib file
#    instead of 572. No output filter can catch that, because there is no output. A gate that only
#    reads tsc's complaints cannot tell "clean" from "never looked".
#
# The expected file set is derived from `git ls-files` rather than compared against a hardcoded
# count, so it maintains itself as files are added and deleted.

echo "***** TYPECHECKING *****"

# -P resolves symlinks. --listFiles prints physical paths, so a logical PROJECT_ROOT would not be a
# prefix of them and the sed below would strip nothing — every file would look unchecked.
PROJECT_ROOT=$(cd "$(dirname "$0")/../.." && pwd -P)

cd "$PROJECT_ROOT" || exit 1

if [ ! -x ./node_modules/.bin/tsc ]; then
    echo "typescript is not installed, run 'npm install --legacy-peer-deps' first"
    exit 1
fi

# --pretty false keeps the "path(line,col): error TSxxxx" format stable so the filter below can
# anchor on it. tsc already drops pretty output when stdout is a pipe, this makes it explicit.
# --listFiles adds one absolute path per file tsc read, which feeds the coverage check.
TSC_OUTPUT=$(./node_modules/.bin/tsc --noEmit --pretty false --listFiles 2>&1)
TSC_EXIT_CODE=$?

# --listFiles interleaves those ~3900 paths with the diagnostics on the same stream. Split them
# apart once, here, so neither check below has to print the other's lines. The discriminator is the
# diagnostic marker itself: every diagnostic carries ": error TS", a listed path does not. Keying on
# the marker rather than on the absence of a space keeps paths that do contain one — a tracked file,
# or a checkout directory — on the file side. The two patterns are exact complements, so no line is
# silently dropped.
TSC_FILES=$(printf '%s\n' "$TSC_OUTPUT" | grep -E '^/' | grep -v ': error TS')
TSC_DIAGNOSTICS=$(printf '%s\n' "$TSC_OUTPUT" | grep -E '^[^/]|^$|: error TS')

# tsc exits 0 when it found nothing and 2 when it ran and reported diagnostics. Any other code means
# it stopped before checking the project (1 is what a bad CLI flag produces), so the output cannot be
# filtered meaningfully — print all of it and fail closed.
if [ $TSC_EXIT_CODE -ne 0 ] && [ $TSC_EXIT_CODE -ne 2 ]; then
    printf '%s\n' "$TSC_DIAGNOSTICS"
    echo "***** TYPECHECK ABORTED (tsc exited $TSC_EXIT_CODE) *****"
    exit 1
fi

# Coverage runs before the verdict, so a program that covers none of our sources cannot reach the
# PASSED banner on its way out.
EXPECTED_FILES=$(git ls-files src | grep -E '\.tsx?$' | LC_ALL=C sort)

if [ -z "$EXPECTED_FILES" ]; then
    echo "could not list the tracked files under src/, so the typecheck cannot be verified"
    echo "***** TYPECHECK ABORTED (no expected file set) *****"
    exit 1
fi

CHECKED_FILES=$(printf '%s\n' "$TSC_FILES" | sed "s|^$PROJECT_ROOT/||" | grep -E '^src/.*\.tsx?$' | LC_ALL=C sort)

MISSING_FILES=$(comm -23 <(printf '%s\n' "$EXPECTED_FILES") <(printf '%s\n' "$CHECKED_FILES"))

OUR_ERRORS=$(printf '%s\n' "$TSC_DIAGNOSTICS" | grep 'error TS' | grep -v '^node_modules/')

if [ -n "$MISSING_FILES" ]; then
    MISSING_COUNT=$(printf '%s\n' "$MISSING_FILES" | wc -l | tr -d ' ')
    EXPECTED_COUNT=$(printf '%s\n' "$EXPECTED_FILES" | wc -l | tr -d ' ')
    # A broken tsconfig.json usually reports a diagnostic of its own. Print it first: it is the
    # cause, and the missing files below are the symptom.
    if [ -n "$OUR_ERRORS" ]; then
        printf '%s\n' "$OUR_ERRORS"
    fi
    printf '%s\n' "$MISSING_FILES" | head -10
    if [ "$MISSING_COUNT" -gt 10 ]; then
        echo "+$((MISSING_COUNT - 10)) more"
    fi
    echo "tsc did not read these tracked files, so nothing above type checked them"
    echo "***** TYPECHECK FAILED: $MISSING_COUNT OF $EXPECTED_COUNT FILE(S) UNDER src/ NOT CHECKED *****"
    exit 1
fi

if [ -n "$OUR_ERRORS" ]; then
    printf '%s\n' "$OUR_ERRORS"
    echo "***** TYPECHECK FAILED: $(printf '%s\n' "$OUR_ERRORS" | wc -l | tr -d ' ') ERROR(S) IN OUR CODE *****"
    exit 1
fi

echo "***** TYPECHECK PASSED: NO ERRORS IN OUR CODE *****"
