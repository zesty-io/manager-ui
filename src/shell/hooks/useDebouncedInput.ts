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

  // Commits a pending value now. Wire it to `onBlur` where a click elsewhere
  // (e.g. a Save button) must see the latest input, not wait out the delay.
  const flush = useCallback(() => {
    // React 18 defers the blur's state update past a synchronous mousedown→click,
    // so without flushSync Save would validate stale formData.
    flushSync(() => {
      debouncedRef.current!.flush();
    });
  }, []);

  return { local, onLocalChange, flush };
}
