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

  const onLocalChange = useCallback((v: string) => {
    setLocal(v);
    debouncedRef.current!(v);
  }, []);

  return { local, onLocalChange };
}
