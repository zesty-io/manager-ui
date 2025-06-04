import { useEffect } from "react";
import { RefHandle, refRegistry } from "./refRegistry";

export function useRegisterRef(
  key: string,
  handle: RefHandle | null,
  context?: Record<string, any>,
  options?: { skip?: boolean }
) {
  useEffect(() => {
    if (options?.skip) return;
    if (handle)
      refRegistry[key] = {
        handle,
        context,
      };
    return () => {
      delete refRegistry[key];
    };
  }, [key, handle, context]);
}
