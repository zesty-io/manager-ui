import React, { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useLocalStorage } from "react-use";

interface ResizableContainerProps {
  children: React.ReactNode;
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  id: string;
}

export const ResizableContainer: React.FC<ResizableContainerProps> = ({
  children,
  minWidth,
  maxWidth,
  defaultWidth,
  id,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [initialPos, setInitialPos] = useState(0);
  const [width, setWidth] = useLocalStorage(
    `zesty:resizableContainer:${id}`,
    defaultWidth
  );

  console.log("testing width", width);
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setInitialPos(e.clientX);
    document.body.style.cursor = "col-resize";
  };

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "default";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = width + e.clientX - initialPos;
      if (newWidth < minWidth || newWidth > maxWidth) return;
      setInitialPos(e.clientX);
      setWidth(newWidth);
    },
    [isResizing, initialPos, width, minWidth, maxWidth]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Box width={width} position="relative">
      {children}
      <Box
        sx={{
          width: "4px",
          height: "100%",
          position: "absolute",
          right: "-2px",
          top: "0",
          zIndex: "1",
          bgcolor: isResizing ? "rgba(255, 93, 10, 0.5)" : "transparent",
          "&:hover": {
            backgroundColor: "rgba(255, 93, 10, 0.5)",
            cursor: "col-resize",
          },
        }}
        onMouseDown={handleMouseDown}
      />
    </Box>
  );
};
