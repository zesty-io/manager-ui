import { Alert, AlertTitle, Box, CircularProgress } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGetHeadTagsQuery } from "shell/services/instance";
import { HeadTag } from "shell/services/types";
import instanceZUID from "utility/instanceZUID";
import { StudioAiPreview } from "../hooks/useStudioAiEdit";

// Only tags that style or describe the page: a preview runs no head scripts.
const HEAD_TAG_TYPES = new Set(["link", "meta"]);

const escapeAttribute = (value: string) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Head tags are data: only allowed tag types and well-formed, non-handler
// attribute names reach the markup, and every value is escaped.
const renderHeadTag = ({ type, attributes }: HeadTag) => {
  const tag = (type || "").toLowerCase();
  if (!HEAD_TAG_TYPES.has(tag)) return "";
  const attrs = Object.entries(attributes || {})
    .filter(
      ([name]) => /^[a-z_:][-a-z0-9_:.]*$/i.test(name) && !/^on/i.test(name)
    )
    .map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`)
    .join("");
  return `<${tag}${attrs}>`;
};

// PVL returns the page's body; its <head> is rebuilt here from the instance's
// head tags, the loader's external stylesheets, and site.css and site.js.
// None of it is sent to PVL.
const buildPreviewDocument = (
  html: string,
  headTags: HeadTag[],
  stylesheets: string[],
  previewOrigin: string,
  previewPassword?: string
) => {
  const query = previewPassword
    ? `?zpw=${encodeURIComponent(previewPassword)}`
    : "";
  const tags = headTags.map(renderHeadTag).join("");
  const links = stylesheets
    .map((href) => `<link rel="stylesheet" href="${escapeAttribute(href)}">`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><base href="${previewOrigin}/">${tags}${links}<link rel="stylesheet" href="${previewOrigin}/site.css${query}"><script src="${previewOrigin}/site.js${query}" defer></script></head><body>${html}</body></html>`;
};

type StudioAIPreviewProps = {
  preview: StudioAiPreview;
  previewOrigin: string;
  previewPassword?: string;
  pageItemZUID: string;
};

// Covers the live canvas while an AI change is staged, which is also what
// keeps canvas selection and drag out of reach until Save or Cancel.
export const StudioAIPreview = ({
  preview,
  previewOrigin,
  previewPassword,
  pageItemZUID,
}: StudioAIPreviewProps) => {
  const { t } = useTranslation();
  const { data: allHeadTags } = useGetHeadTagsQuery();
  // The instance's own tags plus the page item's, in their saved order.
  const headTags = useMemo(
    () =>
      (allHeadTags || [])
        .filter(
          (tag) =>
            tag.resourceZUID === instanceZUID ||
            tag.resourceZUID === pageItemZUID
        )
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
    [allHeadTags, pageItemZUID]
  );
  const srcDoc = useMemo(
    () =>
      preview.status === "ready"
        ? buildPreviewDocument(
            preview.html,
            headTags,
            preview.stylesheets,
            previewOrigin,
            previewPassword
          )
        : "",
    [headTags, preview, previewOrigin, previewPassword]
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
        <Box display="flex" flexDirection="column" height="100%" width="100%">
          {preview.withoutLayout ? (
            <Alert
              data-cy="StudioAIPreviewWithoutLayout"
              severity="info"
              sx={{ borderRadius: 0 }}
            >
              {t("content.studioAiPreviewWithoutLayout")}
            </Alert>
          ) : null}
          {/* No allow-same-origin: srcdoc would otherwise inherit the
              manager's origin, and the site's scripts with it. */}
          <Box
            data-cy="StudioAIPreviewFrame"
            component="iframe"
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            sx={{ border: "none", flex: 1, width: "100%" }}
          />
        </Box>
      ) : null}
      {preview.status === "error" ? (
        <Alert
          data-cy="StudioAIPreviewError"
          severity="warning"
          sx={{ maxWidth: 560, mx: 3 }}
        >
          <AlertTitle>{t("content.studioAiPreviewUnavailable")}</AlertTitle>
          {preview.message} {t("content.studioAiPreviewReviewHint")}
        </Alert>
      ) : null}
    </Box>
  );
};
