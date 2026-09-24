import { Alert, AlertTitle, Box, CircularProgress } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StudioAiPreview } from "../hooks/useStudioAiEdit";

// PVL returns the view's markup alone; the page's styling comes from the
// instance's site.css and site.js, as the Freestyle canvas loads them.
const buildPreviewDocument = (
  html: string,
  previewOrigin: string,
  previewPassword?: string
) => {
  const query = previewPassword
    ? `?zpw=${encodeURIComponent(previewPassword)}`
    : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><base href="${previewOrigin}/"><link rel="stylesheet" href="${previewOrigin}/site.css${query}"><script src="${previewOrigin}/site.js${query}" defer></script></head><body>${html}</body></html>`;
};

type StudioAIPreviewProps = {
  preview: StudioAiPreview;
  previewOrigin: string;
  previewPassword?: string;
};

// Covers the live canvas while an AI change is staged, which is also what
// keeps canvas selection and drag out of reach until Save or Cancel.
export const StudioAIPreview = ({
  preview,
  previewOrigin,
  previewPassword,
}: StudioAIPreviewProps) => {
  const { t } = useTranslation();
  const srcDoc = useMemo(
    () =>
      preview.status === "ready"
        ? buildPreviewDocument(preview.html, previewOrigin, previewPassword)
        : "",
    [preview, previewOrigin, previewPassword]
  );

  return (
    <Box
      data-cy="StudioAIPreview"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="common.white"
      sx={{ position: "absolute", inset: 0, zIndex: 1 }}
    >
      {preview.status === "loading" ? <CircularProgress size={28} /> : null}
      {preview.status === "ready" ? (
        // No allow-same-origin: srcdoc would otherwise inherit the manager's
        // origin, and the site's scripts with it.
        <Box
          data-cy="StudioAIPreviewFrame"
          component="iframe"
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          sx={{ border: "none", height: "100%", width: "100%" }}
        />
      ) : null}
      {preview.status === "error" ? (
        <Alert
          data-cy="StudioAIPreviewError"
          severity="warning"
          sx={{ maxWidth: 560, mx: 3 }}
        >
          <AlertTitle>{t("content.studioAiPreviewUnavailable")}</AlertTitle>
          {preview.message} {t("content.studioAiPreviewStagedHint")}
        </Alert>
      ) : null}
    </Box>
  );
};
