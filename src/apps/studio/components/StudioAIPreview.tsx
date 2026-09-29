import { Alert, AlertTitle, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { StudioAiPreview } from "../hooks/useStudioAiEdit";

type StudioAIPreviewProps = {
  preview: StudioAiPreview;
};

// Where the AI preview stands, shown above the canvas rather than over it:
// once painted, the live canvas is the preview.
export const StudioAIPreview = ({ preview }: StudioAIPreviewProps) => {
  const { t } = useTranslation();

  if (preview.status === "loading") {
    return (
      <Alert
        data-cy="StudioAIPreviewStatus"
        severity="info"
        icon={<CircularProgress size={18} />}
        sx={{ borderRadius: 0 }}
      >
        {t("content.studioAiPreviewRendering")}
      </Alert>
    );
  }

  if (preview.status === "error") {
    return (
      <Alert
        data-cy="StudioAIPreviewError"
        severity="warning"
        sx={{ borderRadius: 0 }}
      >
        <AlertTitle>{t("content.studioAiPreviewUnavailable")}</AlertTitle>
        {preview.message} {t("content.studioAiPreviewReviewHint")}
      </Alert>
    );
  }

  return null;
};
