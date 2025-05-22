import {
  useEffect,
  useCallback,
  useState,
  RefObject,
  ForwardedRef,
} from "react";

export const useResizeObserver = (
  ref: RefObject<Element> | ForwardedRef<Element>
) => {
  const [dimensions, setDimensions] = useState<DOMRectReadOnly | null>(null);

  const callback = useCallback((entries: ResizeObserverEntry[]) => {
    const entry = entries[0];

    setDimensions(entry.contentRect);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(callback);

    if (ref && "current" in ref && ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref && "current" in ref && ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, callback]);

  return dimensions;
};
