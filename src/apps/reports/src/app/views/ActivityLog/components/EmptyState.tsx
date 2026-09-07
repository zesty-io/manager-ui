import { FC } from "react";
import { useTranslation } from "react-i18next";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Typography, Button } from "@mui/material";

interface EmptyStateProps {
  title: string;
  onReset: () => void;
}
export const EmptyState: FC<EmptyStateProps> = ({ title, onReset }) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ textAlign: "center" }}>
      <ErrorIcon fontSize="large" sx={{ mb: 3 }} color="primary" />
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("reports.emptyStateHint")}
      </Typography>
      <Button variant="contained" onClick={onReset}>
        {t("shell.resetFilters")}
      </Button>
    </Box>
  );
};
