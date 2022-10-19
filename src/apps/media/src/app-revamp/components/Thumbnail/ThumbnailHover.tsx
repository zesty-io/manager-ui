import { useSelector } from "react-redux";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { State } from "../../../../../../shell/store/media-revamp";

export function ThumbnailHover() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        "&:hover": {
          background: `linear-gradient(to bottom,rgba(16,24,40,.26),transparent 56px,transparent)`,
          "& .MuiCheckbox-root": {
            display: "block",
          },
        },
      }}
    />
  );
}
