import { Box, CircularProgress } from "@mui/material";
import { ReactNode, RefObject } from "react";

type StudioPreviewProps = {
  iframeRef: RefObject<HTMLIFrameElement>;
  iframeSrc: string;
  isNavigating: boolean;
  isBusy: boolean;
  onLoad: () => void;
  // Floats over the top of the canvas, above the refresh overlay.
  overlaySlot?: ReactNode;
};

export const StudioPreview = ({
  iframeRef,
  iframeSrc,
  isNavigating,
  isBusy,
  onLoad,
  overlaySlot,
}: StudioPreviewProps) => (
  <Box position="relative" flex="1" minWidth={0}>
    <Box
      data-cy="StudioPreviewFrame"
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
        bgcolor: "common.white",
      }}
    />
    {isNavigating ? (
      <Box
        component="div"
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 3,
        }}
        display="flex"
        alignItems="center"
        gap={1}
      >
        <CircularProgress size={24} />
      </Box>
    ) : null}
    {/* While a save reload is in flight, a dark overlay fades over the preview
        to hide the blank reload and block edits against soon-to-be-stale
        content. It fades back out once the refreshed page has loaded. */}
    <Box
      data-cy="StudioPreviewRefreshOverlay"
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.900",
        opacity: isBusy ? 1 : 0,
        pointerEvents: isBusy ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
    >
      {isBusy ? <CircularProgress size={28} /> : null}
    </Box>
    {overlaySlot ? (
      <Box
        sx={{
          position: "absolute",
          top: 40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 640,
          maxWidth: "calc(100% - 48px)",
          zIndex: 4,
        }}
      >
        {overlaySlot}
      </Box>
    ) : null}
  </Box>
);
