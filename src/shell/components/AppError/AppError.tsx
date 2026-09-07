import { Stack, Box, Typography, Button } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useTranslation } from "react-i18next";

import notFound from "../../../../public/images/notFoundTransparent.png";

export const AppError = () => {
  const { t } = useTranslation();

  return (
    <Stack
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        component="img"
        src={notFound}
        alt={t("shell.notFoundImageAlt")}
        width={320}
        height={320}
        mb={8}
      />
      <Typography variant="h4" fontWeight={600} mb={1} color="text.primary">
        {t("shell.appErrorHeading")}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {t("shell.appErrorBody")}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<RefreshRoundedIcon />}
        onClick={() => window.location.reload()}
      >
        {t("shell.reloadApplication")}
      </Button>
    </Stack>
  );
};
