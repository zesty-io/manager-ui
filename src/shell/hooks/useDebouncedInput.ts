import { debounce } from "lodash";
import { flushSync } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

// Every mounted input's debounce, so a caller about to read the store can land
// whatever is still waiting out its delay. Flushing a debounce with nothing
// pending is a no-op.
const mountedDebounces = new Set<{ flush: () => void }>();

// Commits every pending debounced input now. Studio's undo/redo calls it so an
// undo applies to what the user has actually typed.
export const flushAllDebouncedInputs = () => {
  mountedDebounces.forEach((debounced) => debounced.flush());
};

export function useDebouncedInput(
  externalValue: string | number | null | undefined,
  commit: (v: string) => void,
  delay = 500
) {
  const [local, setLocal] = useState(String(externalValue ?? ""));

  // Sync during render rather than in an effect, so children never render
  // with a stale `local` (e.g. TinyMCE capturing it as a remount's initialValue).
  const [prevExternalValue, setPrevExternalValue] = useState(externalValue);
  // Object.is (as useEffect deps did): with !==, a NaN value (e.g. a number
  // field set via Number("abc")) never equals itself and re-renders forever.
  if (!Object.is(externalValue, prevExternalValue)) {
    setPrevExternalValue(externalValue);
    setLocal(String(externalValue ?? ""));
  }

  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  }, [commit]);

  const debouncedRef = useRef<ReturnType<typeof debounce>>();
  if (!debouncedRef.current) {
    debouncedRef.current = debounce(
      (v: string) => {
        commitRef.current(v);
      },
      delay,
      { leading: false, trailing: true }
    );
  }

  useEffect(() => {
    const d = debouncedRef.current!;
    mountedDebounces.add(d);
    return () => {
      mountedDebounces.delete(d);
      d.cancel();
    };
  }, []);

  const onLocalChange = useCallback((v: string) => {
    setLocal(v);
    debouncedRef.current!(v);
  }, []);

  // Shows a value set from outside without committing it. The external value
  // alone cannot do this when it ends where it started — typed, flushed and
  // then undone in one batch — because the sync effect above never re-runs.
  const showLocal = useCallback((v: string) => setLocal(v), []);

  const flush = useCallback(() => {
    // flushSync: a synchronous mousedown→click (e.g. Cypress .click()) would
    // otherwise run Save's handler before the blur's commit renders.
    flushSync(() => {
      debouncedRef.current!.flush();
    });
  }, []);

  return { local, onLocalChange, showLocal, flush };
}
