# Sentry RCA auto-fix classification criteria

Used by `.github/workflows/claude-sentry-rca.yml` after it has already attempted a
trial fix for a Sentry-origin issue. Score all four factors below. Record `"simple"`
in `classification.json` only if **all four pass** — the workflow then commits the
trial fix, pushes a branch, and opens a PR. If any factor fails, record `"complex"`
instead — the workflow discards the trial fix and posts an RCA-only comment.

Always state which factor(s) failed and why, in whichever output file you write —
this is what lets the bar get tuned over time instead of guessing at a fixed rule
once.

This file is the single source of truth for the bar. Edit it directly to tune the
bar — no changes to the workflow YAML or its prompt are needed.

## 1. Root-cause certainty

**PASS:** the exact faulty line(s) are identified and the symptom is fully
explained by them; there is no product/design judgment call involved in picking
the fix — a reasonable engineer presented with the same evidence would write the
same fix.

**FAIL:** multiple plausible fixes exist, the intended behavior is ambiguous, or
the stack trace doesn't clearly localize to specific application code (e.g. it
bottoms out in third-party library internals, or looks like flaky
infrastructure rather than a code defect).

## 2. Blast radius (hard veto — overrides factors 1, 3, and 4)

**PASS:** the fix stays entirely outside all of the following:

- `src/shell/store/auth.js` (auth/session — explicitly legacy, leave-as-is)
- `src/shell/hooks/use-permissions.js` (permission gating)
- IndexedDB warm-cache hydration — `src/shell/index.js` plus any reducer with a
  `LOADED_LOCAL_*` case handler. That currently includes several `src/shell/store/*.js`
  files and per-app store files under `src/apps/*/store/*.js`; don't trust this list to
  stay exhaustive as reducers change — check for the `LOADED_LOCAL_` prefix itself, not
  a fixed set of paths.
- RTK Query base config (`src/shell/services/util.js`)
- webpack config (`src/shell/webpack.config.js`)
- any `.github/workflows/**` file

**FAIL:** the fix touches any file in the list above. This is a hard veto —
classify as complex regardless of how confident factors 1, 3, and 4 are.

## 3. Verifiable by inspection

**PASS:** the fix is a defensive/correctness change whose correctness is obvious
just from reading it — a null/undefined guard, a wrong comparison or boolean
inversion, a missing `await`, a stale ref, a typo'd config key, an off-by-one.
It is equivalent-or-better in every case, not just the reported one.

**FAIL:** the fix changes business logic, output, or control flow in a way that
would need a human or a test run to confirm it's actually correct — i.e. its
correctness depends on runtime behavior, not just on reading the diff.

## 4. Cohesion, not count

**PASS:** every touched file belongs to one conceptual unit — e.g. a component
plus its direct helpers/types, or a reducer plus the action creators it
responds to. This may legitimately span several files; a cohesive multi-file
change is not automatically complex.

**FAIL:** the touched files cross unrelated subsystems (e.g. a shell-level
routing change plus a sub-app reducer plus an unrelated component), signaling
hidden coupling the trial fix may not have fully accounted for. This is a
judgment about coupling, not a file-count cap — do not fail this factor solely
because a change touches more than some number of files.
