import { useEffect } from "react";
import { RefHandle, refRegistry } from "./refRegistry";

type ContextType = Record<string, any>;
type ContextArg = ContextType | (() => ContextType);

export function useRegisterRef(
  key: string,
  handle: RefHandle | null,
  context?: ContextArg,
  options?: { skip?: boolean }
) {
  useEffect(() => {
    if (options?.skip) return;
    if (handle) {
      const contextFn =
        typeof context === "function"
          ? (context as () => ContextType)
          : () => context as ContextType;

      refRegistry[key] = {
        handle,
        context: contextFn,
      };
    }
    return () => {
      delete refRegistry[key];
    };
  }, [key, handle, context]);
}
