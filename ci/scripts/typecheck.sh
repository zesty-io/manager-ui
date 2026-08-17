#!/bin/bash

# What is the purpose of this script? Why was it made?

# Problem
# `tsc --noEmit` reports around twenty errors that originate in node_modules declaration files
# (react-window/csstype, unplugin, react-use). None of them are actionable in this repo, and they
# move whenever dependencies re-resolve, so tsc's own exit code can never be used as a CI gate.

# Solution
# Run the typecheck, then ignore only the diagnostics that point at a file under node_modules/.
# The filter is a deny-list on purpose. An allow-list ("keep the errors under src/") drops every
# config-level diagnostic, because those are not attributed to a file we own: an `include` pointing
# at a directory that no longer exists, an `exclude` that covers our sources, or a malformed
# tsconfig.json all make tsc check nothing and report TS18003. Under an allow-list that reads as a
# clean run, so a one-line edit to tsconfig.json would silently disable this gate. It also drops
# errors in index.d.ts, which tsconfig.json includes alongside src/. A diagnostic that means "your
# code was never checked" has to fail the gate, not vanish from it.

echo "***** TYPECHECKING *****"

PROJECT_ROOT=$(cd "$(dirname "$0")/../.." && pwd)

cd "$PROJECT_ROOT" || exit 1

if [ ! -x ./node_modules/.bin/tsc ]; then
    echo "typescript is not installed, run 'npm install --legacy-peer-deps' first"
    exit 1
fi

# --pretty false keeps the "path(line,col): error TSxxxx" format stable so the filter below can
# anchor on it. tsc already drops pretty output when stdout is a pipe, this makes it explicit.
TSC_OUTPUT=$(./node_modules/.bin/tsc --noEmit --pretty false 2>&1)
TSC_EXIT_CODE=$?

# tsc exits 0 when it found nothing and 2 when it ran and reported diagnostics. Any other code means
# it stopped before checking the project (1 is what a bad CLI flag produces), so the output cannot be
# filtered meaningfully — print all of it and fail closed.
if [ $TSC_EXIT_CODE -ne 0 ] && [ $TSC_EXIT_CODE -ne 2 ]; then
    echo "$TSC_OUTPUT"
    echo "***** TYPECHECK ABORTED (tsc exited $TSC_EXIT_CODE) *****"
    exit 1
fi

OUR_ERRORS=$(printf '%s\n' "$TSC_OUTPUT" | grep 'error TS' | grep -v '^node_modules/')

if [ -n "$OUR_ERRORS" ]; then
    printf '%s\n' "$OUR_ERRORS"
    echo "***** TYPECHECK FAILED: $(printf '%s\n' "$OUR_ERRORS" | wc -l | tr -d ' ') ERROR(S) IN OUR CODE *****"
    exit 1
fi

echo "***** TYPECHECK PASSED: NO ERRORS IN OUR CODE *****"
