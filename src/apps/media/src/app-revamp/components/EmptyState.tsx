import { Typography } from "@mui/material";
import { Stack } from "@mui/material";
import { FC } from "react";
import { UploadButton } from "./UploadButton";

type Props = {};
export const EmptyState: FC<Props> = ({}) => {
  return (
    <Stack sx={{ gap: 2, justifyContent: "center" }}>
      <Typography variant="h4">Start Uploading Now</Typography>
      <Typography variant="body2">
        You can drag and drop files here or use the "Upload" button.
      </Typography>
      {/* TODO FIX THIS */}
      <UploadButton currentBin={null} currentGroup={null} />
    </Stack>
  );
};
