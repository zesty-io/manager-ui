#!/usr/bin/env bash
# Flaky-hunter loop.
#
# Runs THIS runner's assigned Cypress specs ITERATIONS times in a row, with
# retries DISABLED, writing one mochawesome JSON per spec per iteration into
# results/iter-N/. The aggregation step (ci/scripts/aggregate_flaky.js) reads
# those JSONs and classifies each spec/test:
#   - fails in SOME iterations but not all  -> flaky
#   - fails in EVERY iteration              -> genuinely broken
#   - never fails                           -> stable
#
# Retries are off on purpose: ci.yaml uses retries:1 which MASKS flakiness
# (a flaky test that passes on retry shows green). Here we want the raw signal.
#
# The server is already up on :8080 (start-server-and-test launches us). The
# SPLIT / SPLIT_INDEX / SPLIT_FILE / SPEC / SKIP_SPEC env vars are inherited
# from the workflow step and consumed by cypress-split, so this runner executes
# exactly the same spec subset it would in real CI.
set -u

ITERATIONS="${ITERATIONS:-5}"

echo "Flaky-hunter: $ITERATIONS iterations on split_index=${SPLIT_INDEX:-?} (SPLIT=${SPLIT:-?})"

for i in $(seq 1 "$ITERATIONS"); do
  echo "::group::Flaky iteration ${i}/${ITERATIONS} (split_index=${SPLIT_INDEX:-?})"
  CYPRESS_RETRIES=0 \
  ./node_modules/.bin/cypress run \
    --headless \
    --browser electron \
    --reporter mochawesome \
    --reporter-options "reportDir=results/iter-${i},overwrite=false,html=false,json=true,reportFilename=spec-[name]" \
    || echo "iteration ${i} ended with failures (expected while hunting flaky specs)"
  echo "::endgroup::"
done

# Always exit 0: pass/fail is determined by the aggregation step from the
# per-iteration JSON, not by this loop's exit code.
exit 0
