import { keyframes } from "@emotion/react";
import type { SxProps, Theme } from "@mui/material";

const shimmer = keyframes`
  0% {
    background-position: 1000px 0;
  }
  100% {
    background-position: -1000px 0;
  }
`;

/**
 * Shimmer placeholder shown while a media thumbnail is still loading. Replaces
 * the former Loading.less. The gradient stops are resolved off `theme` rather
 * than written as palette paths: sx only resolves paths for
 * color/bgcolor/backgroundColor, not for the `background` shorthand
 * (docs/design-system.md section 1).
 */
export const loadingThumbnailSx: SxProps<Theme> = (theme) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: "100%",
  background: `linear-gradient(0.35turn, ${theme.palette.background.shimmer} 25%, ${theme.palette.background.shimmerSweep} 45%, ${theme.palette.background.shimmer} 65%)`,
  backgroundSize: "1000px 100%",
  animation: `${shimmer} 3s infinite linear`,
  // Perf: Hack to trigger hardware acceleration for animation performance
  transform: "translate3d(0, 0, 0)",
});
