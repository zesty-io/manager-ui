import { Typography } from "@mui/material";
import { Stack } from "@mui/material";
import { FC } from "react";
import { UploadButton } from "./UploadButton";

type Props = {
  currentBinId: string;
  currentGroupId: string;
};
export const EmptyState: FC<Props> = (ids) => {
  return (
    <Stack sx={{ gap: 2, justifyContent: "center", height: "100%", px: 4 }}>
      <Typography variant="h4">Start Uploading Now</Typography>
      <Typography variant="body2">
        You can drag and drop files here or use the "Upload" button.
      </Typography>
      <UploadButton {...ids} />
    </Stack>
  );
};
