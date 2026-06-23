import { useTranslation } from "react-i18next";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Typography, Button } from "@mui/material";
export const ApiErrorState = (props) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ textAlign: "center" }}>
      <ErrorIcon fontSize="large" sx={{ mb: 3 }} color="error" />
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {t("reports.apiErrorTitle")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("reports.apiErrorMessage")}
      </Typography>
      <Button variant="contained" color="error" onClick={props.onRetry}>
        {t("reports.apiErrorRetry")}
      </Button>
    </Box>
  );
};
