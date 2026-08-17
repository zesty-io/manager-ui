#!/bin/bash

# What is the purpose of this script? Why was it made?

# Problem
# `tsc --noEmit` reports around twenty errors that originate in node_modules declaration files
# (react-window/csstype, unplugin, react-use). None of them are actionable in this repo, and they
# move whenever dependencies re-resolve, so tsc's own exit code can never be used as a CI gate.

# Solution
# Run the typecheck, then fail only on diagnostics that point at a file under src/ — the code we own.

echo "***** TYPECHECKING src/ *****"

PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)

cd "$PROJECT_ROOT" || exit 1

if [ ! -x ./node_modules/.bin/tsc ]; then
    echo "typescript is not installed, run 'npm install --legacy-peer-deps' first"
    exit 1
fi

# --pretty false keeps the "path(line,col): error TSxxxx" format stable so the filter below can
# anchor on it. tsc already drops pretty output when stdout is a pipe, this makes it explicit.
TSC_OUTPUT=$(./node_modules/.bin/tsc --noEmit --pretty false 2>&1)
TSC_EXIT_CODE=$?

# tsc exits 0 with no diagnostics and 2 when it reported some. Anything else means it failed to run
# at all, which must not be reported as a passing gate.
if [ $TSC_EXIT_CODE -ne 0 ] && [ $TSC_EXIT_CODE -ne 2 ]; then
    echo "$TSC_OUTPUT"
    echo "***** TYPECHECK COULD NOT RUN (tsc exited $TSC_EXIT_CODE) *****"
    exit 1
fi

SRC_ERRORS=$(echo "$TSC_OUTPUT" | grep 'error TS' | grep '^src/')

if [ -n "$SRC_ERRORS" ]; then
    echo "$SRC_ERRORS"
    echo "***** TYPECHECK FAILED: $(echo "$SRC_ERRORS" | wc -l | tr -d ' ') ERROR(S) UNDER src/ *****"
    exit 1
fi

echo "***** TYPECHECK PASSED: NO ERRORS UNDER src/ *****"
