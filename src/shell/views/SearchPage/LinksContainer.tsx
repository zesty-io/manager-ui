import { FC } from "react";

import { CopyButton } from "./CopyButton";
import { Stack, IconButton } from "@mui/material";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import { Link } from "react-router-dom";

export type LinksContainerProps = {
  url: string;
};
export const LinksContainer: FC<LinksContainerProps> = ({ url }) => {
  if (!url) return null; //TODO visual indication of missing meta data
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        gap: 1,
      }}
    >
      <CopyButton url={url} />
      <IconButton component={Link} to={url}>
        <OpenInNewRounded fontSize="small" />
      </IconButton>
    </Stack>
  );
};
