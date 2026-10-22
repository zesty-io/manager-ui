import { debounce } from "lodash";
import { flushSync } from "react-dom";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

export function useDebouncedInput(
  externalValue: string | number | null | undefined,
  commit: (v: string) => void,
  delay = 500
) {
  const [local, setLocal] = useState(String(externalValue ?? ""));

  useEffect(() => {
    setLocal(String(externalValue ?? ""));
  }, [externalValue]);

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
