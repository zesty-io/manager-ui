import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  SvgIcon,
  IconButton,
  Tooltip,
  ThemeProvider,
} from "@mui/material";
import { useLocalStorage } from "react-use";
import {
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";
import { theme } from "@zesty-io/material";

type Props = {
  children: React.ReactNode;
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  id: string;
};

export const ResizableContainer = ({
  children,
  minWidth,
  maxWidth,
  defaultWidth,
  id,
}: Props) => {
  const [isResizing, setIsResizing] = useState(false);
  const [initialPos, setInitialPos] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  const [isHoveringCollapseButton, setIsHoveringCollapseButton] =
    useState(false);
  const [width, setWidth] = useLocalStorage(
    `zesty:resizableContainer:${id}`,
    defaultWidth
  );
  const [collapsed, setCollapsed] = useLocalStorage(
    `zesty:collapsedContainer:${id}`,
    false
  );
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setInitialPos(e.clientX);
    setInitialWidth(width);
    // set cursor on the document body to handle cursor leaving the container as we resize
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = initialWidth + e.clientX - initialPos;
      if (newWidth < minWidth) {
        newWidth = minWidth;
      } else if (newWidth > maxWidth) {
        newWidth = maxWidth;
      }
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

  const MemoizedChildren = useMemo(() => children, [children]);

  return (
    <ThemeProvider theme={theme}>
      <Box width={collapsed ? 0 : width} position="relative">
        <Box
          overflow={collapsed ? "hidden" : "visible"}
          height="100%"
          width="inherit"
        >
          {MemoizedChildren}
        </Box>
        <Box
          sx={{
            width: "4px",
            height: "100%",
            position: "absolute",
            right: "-2px",
            top: "0",
            zIndex: "2",
            bgcolor: isResizing ? "rgba(255, 93, 10, 0.5)" : "transparent",
            "&:hover": {
              backgroundColor: "rgba(255, 93, 10, 0.5)",
              cursor: "col-resize",
            },
          }}
          onMouseDown={handleMouseDown}
          display={collapsed ? "none" : "block"}
        />
        <Tooltip
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          placement="right-start"
          enterDelay={1000}
          enterNextDelay={1000}
          open={isTooltipOpen && isHoveringCollapseButton}
          onOpen={() => setIsTooltipOpen(true)}
          onClose={() => setIsTooltipOpen(false)}
        >
          <IconButton
            data-cy="collapseAppSideBar"
            onClick={() => {
              setIsTooltipOpen(false);
              setCollapsed(!collapsed);
              setIsHoveringCollapseButton(false);
            }}
            onMouseOver={() => setIsHoveringCollapseButton(true)}
            sx={{
              borderRadius: "50%",
              borderColor: "grey.600",
              borderStyle: "solid",
              borderWidth: "1px",
              backgroundColor: "grey.900",

              width: "24px",
              height: "24px",

              position: "absolute",
              top: "32px",
              right: "-12px",
              zIndex: (theme) => theme.zIndex.appBar,

              "&:hover": {
                backgroundColor: "grey.900",

                ".MuiSvgIcon-root": {
                  color: "common.white",
                },
              },
            }}
          >
            <SvgIcon
              component={
                collapsed ? KeyboardDoubleArrowRight : KeyboardDoubleArrowLeft
              }
              fontSize="small"
              sx={{
                color: "grey.500",
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    </ThemeProvider>
  );
};
