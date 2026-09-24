import { debounce } from "lodash";
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

  // A "debounced" commit still defers to a timer even with delay=0 (lodash
  // schedules it via setTimeout), so it can still lose a race against a
  // click handled in the same tick. A delay of 0 (or less) means "don't
  // debounce at all" — commit synchronously, so there's never a pending
  // commit to race against.
  const onLocalChange = useCallback(
    (v: string) => {
      setLocal(v);
      if (delay <= 0) {
        commitRef.current(v);
      } else {
        debouncedRef.current!(v);
      }
    },
    [delay]
  );

  return { local, onLocalChange };
}
