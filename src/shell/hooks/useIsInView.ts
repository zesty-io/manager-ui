import { ForwardedRef, RefObject, useEffect, useState } from "react";

export const useIsInView = (
  ref: RefObject<Element> | ForwardedRef<Element>
) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref || !("current" in ref) || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return isInView;
};
