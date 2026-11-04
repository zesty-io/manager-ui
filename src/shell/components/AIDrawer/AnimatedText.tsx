import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { detectFormat } from "./detectFormat";

// Provisional: product has not confirmed typing out code blocks. Set to false
// to show them at once; plain text still animates.
export const ANIMATE_CODE_BLOCKS = true;

type AnimatedTextProps = {
  text: string;
  animate: boolean;
  onGrow?: () => void;
  // Opt in to showing html/markdown text as a code block; plain text otherwise.
  renderCodeBlock?: boolean;
};

export const AnimatedText = ({
  text,
  animate: animateProp,
  onGrow,
  renderCodeBlock = false,
}: AnimatedTextProps) => {
  const isCode = renderCodeBlock && detectFormat(text) !== "plain";
  const animate = animateProp && (!isCode || ANIMATE_CODE_BLOCKS);
  const [displayedText, setDisplayedText] = useState(animate ? "" : text);
  const intervalRef = useRef(null);
  // Read through a ref instead of listing `onGrow` as a dep - it's an inline
  // callback that gets a new reference every parent render, which would
  // otherwise restart the typing animation on every re-render.
  const onGrowRef = useRef(onGrow);
  onGrowRef.current = onGrow;

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
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

  if (isCode) {
    // Source is shown as-is, never rendered.
    return (
      <Typography
        data-cy="AIDrawerCodeBlock"
        component="pre"
        variant="body3"
        sx={{
          // body3 is inline-block, which would sit beside the refKey label.
          display: "block",
          m: 0,
          p: 1.5,
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          overflowX: "auto",
          bgcolor: "grey.100",
          border: 1,
          borderColor: "border",
          borderRadius: 1,
        }}
      >
        {displayedText}
      </Typography>
    );
  }

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
