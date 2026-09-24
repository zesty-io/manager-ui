import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRenderParsleyPreviewMutation } from "shell/services/mcp";
import { WebView } from "shell/services/types";
import { useRegisterRef } from "../../../engine/useRegisterRef";

// The load balancer in front of PVL answers 413 at 1 MiB. The margin covers
// the multipart framing and the zuid field.
const PVL_MAX_PARSLEY_BYTES = 1024 * 1024 - 1024;
// A healthy render takes well under a second; {{this.autolayout()}} never
// answers at all.
const PVL_TIMEOUT_MS = 20000;

const loadsExternalStylesheet = (source: string) =>
  (source.match(/<link\b[^>]*>/gi) || []).some(
    (tag) =>
      /stylesheet/i.test(tag) && /\bhref\s*=\s*["']?(?:https?:)?\/\//i.test(tag)
  );

export type StudioAiPreview =
  | { status: "loading" }
  | { status: "ready"; html: string }
  | { status: "error"; message: string };

export type StudioSaveStatus = "unsaved" | "saved" | null;

type Args = {
  // Registers the page's view for the AI while true.
  active: boolean;
  webViews: WebView[];
  pageModelZUID: string;
  pageItemZUID: string;
  // The page model's full field objects, as the Code app sends them. `any`
  // because the fields store is untyped (see AppState's TODO).
  pageFields: any[];
  randomHashID?: string;
  previewPassword?: string;
  pendingLayoutCodeIds: string[];
  stageLayoutSourceUpdate: (
    codeId: string,
    next: string,
    options?: { replacesSource?: boolean }
  ) => void;
  readStagedLayoutSource: (codeId: string) => string | null;
  // Runs before a change is staged; the live canvas is about to be covered.
  onBeforeStage: () => void;
};

// AI edits to the page's own view. The model's whole-file replacement is
// staged through the layout save funnel and previewed by rendering it with
// WebEngine's PVL endpoint, so nothing reaches the instance until Save.
export const useStudioAiEdit = ({
  active,
  webViews,
  pageModelZUID,
  pageItemZUID,
  pageFields,
  randomHashID,
  previewPassword,
  pendingLayoutCodeIds,
  stageLayoutSourceUpdate,
  readStagedLayoutSource,
  onBeforeStage,
}: Args) => {
  const { t } = useTranslation();
  const [renderParsleyPreview] = useRenderParsleyPreviewMutation();
  const [stagedCodeId, setStagedCodeId] = useState<string | null>(null);
  const stagedCodeIdRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<StudioAiPreview | null>(null);
  const [saveStatus, setSaveStatus] = useState<StudioSaveStatus>(null);
  const previewRequestRef = useRef(0);

  // Freestyle layouts live in a per-item `/z/pvl/` view the model does not
  // render through, so they are never the target.
  const pageView = useMemo(
    () =>
      webViews.find(
        (view) =>
          !!pageModelZUID &&
          view?.contentModelZUID === pageModelZUID &&
          !view.fileName?.startsWith("/z/pvl/")
      ) || null,
    [pageModelZUID, webViews]
  );

  // Always https: the dev config's http:// preview host redirects, and a
  // preflighted request cannot follow a redirect.
  const previewOrigin = `https://${randomHashID ?? ""}${CONFIG.URL_PREVIEW}`;

  const readSource = useCallback(() => {
    if (!pageView) return "";
    return readStagedLayoutSource(pageView.ZUID) ?? pageView.code ?? "";
  }, [pageView, readStagedLayoutSource]);

  const describePreviewError = useCallback(
    (error: unknown, source: string) => {
      const status = (error as FetchBaseQueryError)?.status;
      const seconds = PVL_TIMEOUT_MS / 1000;
      if (status === "TIMEOUT_ERROR") {
        return source.includes("autolayout(")
          ? t("content.studioAiPreviewTimeoutAutolayout", {
              seconds,
              call: "{{this.autolayout()}}",
            })
          : t("content.studioAiPreviewTimeout", { seconds });
      }
      if (status === 413) return t("content.studioAiPreviewTooLarge");
      if (status === 403) return t("content.studioAiPreviewStylesheet");
      const failed =
        typeof status === "number"
          ? t("content.studioAiPreviewFailedStatus", { status })
          : t("content.studioAiPreviewUnreachable");
      return loadsExternalStylesheet(source)
        ? `${failed} ${t("content.studioAiPreviewStylesheet")}`
        : failed;
    },
    [t]
  );

  const renderPreview = useCallback(
    async (source: string) => {
      const request = ++previewRequestRef.current;
      if (new TextEncoder().encode(source).length > PVL_MAX_PARSLEY_BYTES) {
        setPreview({
          status: "error",
          message: t("content.studioAiPreviewTooLarge"),
        });
        return;
      }
      setPreview({ status: "loading" });
      const query = previewPassword
        ? `?zpw=${encodeURIComponent(previewPassword)}`
        : "";
      try {
        const html = await renderParsleyPreview({
          url: `${previewOrigin}/-/pvl/${query}`,
          parsley: source,
          itemZUID: pageItemZUID,
          timeout: PVL_TIMEOUT_MS,
        }).unwrap();
        if (request !== previewRequestRef.current) return;
        setPreview({ status: "ready", html });
      } catch (error) {
        if (request !== previewRequestRef.current) return;
        setPreview({
          status: "error",
          message: describePreviewError(error, source),
        });
      }
    },
    [
      describePreviewError,
      pageItemZUID,
      previewOrigin,
      previewPassword,
      renderParsleyPreview,
      t,
    ]
  );

  const stage = (next: string) => {
    if (!pageView || typeof next !== "string") return;
    onBeforeStage();
    stageLayoutSourceUpdate(pageView.ZUID, next, { replacesSource: true });
    stagedCodeIdRef.current = pageView.ZUID;
    setStagedCodeId(pageView.ZUID);
    setSaveStatus("unsaved");
    void renderPreview(next);
  };
  const stageRef = useRef(stage);
  stageRef.current = stage;

  const handle = useMemo(
    () => ({ setValue: (next: string) => stageRef.current(next) }),
    []
  );
  const context = useCallback(
    () => ({
      fileName: pageView?.fileName,
      code: readSource(),
      fields: pageFields,
    }),
    [pageFields, pageView?.fileName, readSource]
  );
  const isRegistered = active && !!pageView;
  useRegisterRef("code-editor", isRegistered ? handle : null, context, {
    skip: !isRegistered,
  });

  // A save or a discard takes the view out of the pending set; either way the
  // live canvas is current again.
  useEffect(() => {
    if (!stagedCodeId || pendingLayoutCodeIds.includes(stagedCodeId)) return;
    previewRequestRef.current++;
    stagedCodeIdRef.current = null;
    setStagedCodeId(null);
    setPreview(null);
    setSaveStatus((prev) => (prev === "saved" ? prev : null));
  }, [pendingLayoutCodeIds, stagedCodeId]);

  useEffect(() => {
    if (!stagedCodeIdRef.current) setSaveStatus(null);
  }, [pageItemZUID]);

  const handleLayoutRegionSaved = useCallback((codeId: string) => {
    if (codeId === stagedCodeIdRef.current) setSaveStatus("saved");
  }, []);

  return {
    pageView,
    previewOrigin,
    isPreviewing: !!stagedCodeId,
    preview,
    saveStatus,
    handleLayoutRegionSaved,
  };
};
