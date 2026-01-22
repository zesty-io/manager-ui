import { Box, CircularProgress } from "@mui/material";
import { RefObject } from "react";

type StudioPreviewProps = {
  iframeRef: RefObject<HTMLIFrameElement>;
  iframeSrc: string;
  isNavigating: boolean;
  onLoad: () => void;
};

export const StudioPreview = ({
  iframeRef,
  iframeSrc,
  isNavigating,
  onLoad,
}: StudioPreviewProps) => (
  <Box position="relative" flex="1" minWidth={0}>
    <Box
      flex="1"
      minWidth={0}
      ref={iframeRef}
      component="iframe"
      src={iframeSrc}
      onLoad={onLoad}
      sx={{
        border: "none",
        height: "100%",
        width: "100%",
        bgcolor: "grey.900",
      }}
    />
    {isNavigating ? (
      <Box
        component="div"
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
        }}
        display="flex"
        alignItems="center"
        gap={1}
      >
        <CircularProgress size={24} />
      </Box>
    ) : null}
  </Box>
);
