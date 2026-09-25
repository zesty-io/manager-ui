import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { notify } from "shell/store/notifications";
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

const isExternalStylesheet = (tag: string) =>
  /stylesheet/i.test(tag) && /\bhref\s*=\s*["']?(?:https?:)?\/\//i.test(tag);

const loadsExternalStylesheet = (source: string) =>
  (source.match(/<link\b[^>]*>/gi) || []).some(isExternalStylesheet);

const CURRENT_VIEW = /\{\{\s*current_view\s*\}\}/;

// The loader around the staged view, minus what the preview only needs as
// markup: scripts, Parsley comments, and external stylesheets (returned for
// the preview's <head>). Null when the loader has no {{current_view}} left.
const wrapInLoader = (loader: string | null, view: string) => {
  if (!loader) return null;
  const stylesheets: string[] = [];
  const stripped = loader
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script\b[^>]*\/>/gi, "")
    .replace(/\(\*\*[\s\S]*?\*\*\)/g, "")
    .replace(/<link\b[^>]*>/gi, (tag) => {
      if (!isExternalStylesheet(tag)) return tag;
      const href = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const url = href?.[1] ?? href?.[2] ?? href?.[3];
      if (url && !url.includes("{{")) stylesheets.push(url);
      return "";
    });
  if (!CURRENT_VIEW.test(stripped)) return null;
  return {
    payload: stripped.replace(new RegExp(CURRENT_VIEW.source, "g"), () => view),
    stylesheets,
  };
};

export type StudioAiPreview =
  | { status: "loading" }
  | {
      status: "ready";
      html: string;
      // External stylesheets taken out of the loader.
      stylesheets: string[];
      // The loader-wrapped request failed; this is the view alone.
      withoutLayout: boolean;
    }
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
  const dispatch = useDispatch();
  const [renderParsleyPreview] = useRenderParsleyPreviewMutation();
  const [stagedCodeId, setStagedCodeId] = useState<string | null>(null);
  const stagedCodeIdRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<StudioAiPreview | null>(null);
  const [saveStatus, setSaveStatus] = useState<StudioSaveStatus>(null);
  const previewRequestRef = useRef(0);
  // Staged AI changes dropped without a save, so the transcript can say so.
  const [discardCount, setDiscardCount] = useState(0);
  const savedRef = useRef(false);

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

  const loaderView = useMemo(
    () => webViews.find((view) => view?.fileName === "loader") || null,
    [webViews]
  );

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
      // Only a 200 carries CORS headers, so every error PVL answers (a Parsley
      // 400, the edge's 403, the load balancer's 413) reaches the browser as
      // a failed fetch with no status to read.
      const failed = t("content.studioAiPreviewRejected");
      return loadsExternalStylesheet(source)
        ? `${failed} ${t("content.studioAiPreviewStylesheet")}`
        : failed;
    },
    [t]
  );

  const renderPreview = useCallback(
    async (view: string) => {
      const request = ++previewRequestRef.current;
      const loader = loaderView
        ? readStagedLayoutSource(loaderView.ZUID) ?? loaderView.code
        : null;
      const wrapped = wrapInLoader(loader, view);
      const source = wrapped?.payload ?? view;
      const stylesheets = wrapped?.stylesheets ?? [];
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
      const render = (parsley: string) =>
        renderParsleyPreview({
          url: `${previewOrigin}/-/pvl/${query}`,
          parsley,
          itemZUID: pageItemZUID,
          timeout: PVL_TIMEOUT_MS,
        }).unwrap();
      const show = (html: string, withoutLayout: boolean) => {
        if (request !== previewRequestRef.current) return;
        setPreview({ status: "ready", html, stylesheets, withoutLayout });
      };
      const fail = (error: unknown) => {
        if (request !== previewRequestRef.current) return;
        setPreview({
          status: "error",
          message: describePreviewError(error, view),
        });
      };
      try {
        show(await render(source), false);
      } catch (error) {
        // The loader is extra; if the wrapped page is refused, try the view.
        if (
          !wrapped ||
          (error as FetchBaseQueryError)?.status !== "FETCH_ERROR"
        ) {
          fail(error);
          return;
        }
        try {
          show(await render(view), true);
        } catch (viewError) {
          fail(viewError);
        }
      }
    },
    [
      describePreviewError,
      loaderView,
      pageItemZUID,
      previewOrigin,
      previewPassword,
      readStagedLayoutSource,
      renderParsleyPreview,
      t,
    ]
  );

  const stage = (next: string) => {
    if (!pageView || typeof next !== "string") return;
    if (!next.trim()) {
      dispatch(
        notify({ kind: "warn", message: t("content.studioAiEmptyFile") })
      );
      return;
    }
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
  // Registered with a stable context: re-registering deletes the key in a
  // passive cleanup, and a reply handled in that same commit found no ref.
  const contextRef = useRef(context);
  contextRef.current = context;
  const stableContext = useCallback(() => contextRef.current(), []);
  const isRegistered = active && !!pageView;
  useRegisterRef("code-editor", isRegistered ? handle : null, stableContext, {
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
    if (!savedRef.current) setDiscardCount((count) => count + 1);
    savedRef.current = false;
  }, [pendingLayoutCodeIds, stagedCodeId]);

  useEffect(() => {
    if (!stagedCodeIdRef.current) setSaveStatus(null);
  }, [pageItemZUID]);

  // A reload or a closed tab would drop the staged change without a word; the
  // in-app prompt only sees navigation the router handles.
  useEffect(() => {
    if (!stagedCodeId) return;
    const handleBeforeUnload = (evt: BeforeUnloadEvent) => {
      evt.preventDefault();
      // Chrome only prompts when returnValue is set.
      evt.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [stagedCodeId]);

  // "Saved" describes the last AI save only until anything is staged again.
  // Keyed on the empty → non-empty transition: a save only ever shrinks the
  // set, so a multi-file save cannot clear the chip it just set.
  const hadPendingLayoutRef = useRef(false);
  useEffect(() => {
    const hasPending = pendingLayoutCodeIds.length > 0;
    if (hasPending && !hadPendingLayoutRef.current) {
      setSaveStatus((prev) => (prev === "saved" ? null : prev));
    }
    hadPendingLayoutRef.current = hasPending;
  }, [pendingLayoutCodeIds]);

  const handleLayoutRegionSaved = useCallback((codeId: string) => {
    if (codeId !== stagedCodeIdRef.current) return;
    savedRef.current = true;
    setSaveStatus("saved");
  }, []);

  return {
    pageView,
    previewOrigin,
    isPreviewing: !!stagedCodeId,
    preview,
    saveStatus,
    discardCount,
    handleLayoutRegionSaved,
  };
};
