import { Typography } from "@mui/material";
import { Stack } from "@mui/material";
import { FC } from "react";
import { UploadButton } from "./UploadButton";

export type EmptyState = {};
export const EmptyState: FC<EmptyState> = ({}) => {
  return (
    <Stack>
      <Typography variant="h4">Start Uploading Now</Typography>
      <Typography variant="body2">
        You can drag and drop files here or use the "Upload" button.
      </Typography>
      <UploadButton onClick={() => console.log("Hello world")} />
    </Stack>
  );
};
