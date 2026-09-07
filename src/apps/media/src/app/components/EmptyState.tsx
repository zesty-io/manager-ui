import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import uploadFiles from "../../../../../../public/images/uploadFiles.svg";
import { UploadButton } from "./UploadButton";

type Props = {
  currentBinId: string;
  currentGroupId: string;
};
export const EmptyState = (ids: Props) => {
  const { t } = useTranslation();
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
            {t("media.emptyStateTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("media.emptyStateDescription")}
          </Typography>
          <UploadButton {...ids} />
        </Box>
        <Box>
          {/* Illustration Attribution: Illustration from Storyset (a company owned by Flaticon) */}
          <img src={uploadFiles} height={280} />
        </Box>
      </Stack>
    </Box>
  );
};
