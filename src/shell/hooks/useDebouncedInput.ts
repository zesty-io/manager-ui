import { debounce } from "lodash";
import { flushSync } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

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
    return () => d.cancel();
  }, []);

  const onLocalChange = useCallback((v: string) => {
    setLocal(v);
    debouncedRef.current!(v);
  }, []);

  const flush = useCallback(() => {
    // flushSync: a synchronous mousedown→click (e.g. Cypress .click()) would
    // otherwise run Save's handler before the blur's commit renders.
    flushSync(() => {
      debouncedRef.current!.flush();
    });
  }, []);

  return { local, onLocalChange, flush };
}
