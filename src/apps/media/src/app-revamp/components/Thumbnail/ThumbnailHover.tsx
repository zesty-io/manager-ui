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
          background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, rgba(29, 41, 57, 0) 24.17%)`,
          "& .MuiCheckbox-root": {
            display: "block",
          },
        },
      }}
    />
  );
}
