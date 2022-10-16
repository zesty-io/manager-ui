import { Box, Stack, Typography } from "@mui/material";
import uploadImage from "../../../../../../public/images/uploadImage.png";
import { UploadButton } from "./UploadButton";

type Props = {
  currentBinId: string;
  currentGroupId: string;
};
export const EmptyState = (ids: Props) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      height="100%"
      sx={{ px: 4 }}
      justifyContent="center"
      width="100%"
    >
      <Stack direction="row" spacing={8} alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
            Start Uploading Now
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can drag and drop files here or use the "Upload" button.
          </Typography>
          <UploadButton {...ids} />
        </Box>
        <Box>
          <img src={uploadImage} width={440} />
        </Box>
      </Stack>
    </Box>
  );
};
