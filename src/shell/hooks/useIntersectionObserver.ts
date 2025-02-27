import React, { useEffect, useState } from "react";

export const useIntersectionObserver = (
  target: React.RefObject<HTMLElement>
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!target?.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    observer.observe(target?.current);
    return () => observer.disconnect();
  }, [target?.current]);

  return { isVisible };
};
