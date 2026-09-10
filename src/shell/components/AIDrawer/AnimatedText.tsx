import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

type AnimatedTextProps = {
  text: string;
  animate: boolean;
  onGrow?: () => void;
};

export const AnimatedText = ({ text, animate, onGrow }: AnimatedTextProps) => {
  const [displayedText, setDisplayedText] = useState(animate ? "" : text);
  const intervalRef = useRef(null);
  // Read through a ref instead of listing `onGrow` as a dep - it's an inline
  // callback that gets a new reference every parent render, which would
  // otherwise restart the typing animation on every re-render.
  const onGrowRef = useRef(onGrow);
  onGrowRef.current = onGrow;

  useEffect(() => {
    if (!animate) {
      return;
    }
    setDisplayedText("");
    intervalRef.current = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) {
          const next = prev + text[prev.length];
          onGrowRef.current?.();
          if (prev.length + 1 === text.length) {
            clearInterval(intervalRef.current);
          }
          return next;
        } else {
          clearInterval(intervalRef.current);
          return prev;
        }
      });
    }, 30);

    return () => clearInterval(intervalRef.current);
  }, [text, animate]);

  return (
    <Typography
      data-cy="AIDrawerSystemOutput"
      variant="body2"
      sx={{ overflowWrap: "break-word" }}
    >
      {displayedText}
    </Typography>
  );
};
