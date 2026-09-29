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
// Session-wide, so ids stay unique across Studio remounts: AIChat remembers
// which discard it last showed for the rest of the session.
let discardSeq = 0;

// A page path compared loosely: no query, hash or trailing slash.
const comparablePath = (path: string) => {
  const bare = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  try {
    return decodeURI(bare);
  } catch {
    return bare;
  }
};

// How long the canvas has to acknowledge a paint. A page without Studio's
// bridge never answers.
const PAINT_TIMEOUT_MS = 5000;

const loadsExternalStylesheet = (source: string) =>
  (source.match(/<link\b[^>]*>/gi) || []).some(
    (tag) =>
      /stylesheet/i.test(tag) && /\bhref\s*=\s*["']?(?:https?:)?\/\//i.test(tag)
  );

// What the preview is doing. Once painted, the live canvas shows it.
export type StudioAiPreview =
  | { status: "loading" }
  | { status: "painted" }
  | { status: "error"; message: string };

export type CodeRegionReplaced = {
  codeId?: string;
  ok?: boolean;
  count?: number;
  reason?: string;
  requestId?: number;
};

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
  // Runs before a change is staged; the live canvas is about to change.
  onBeforeStage: () => void;
  // The page the canvas was loaded with, and how to load it again.
  loadedPath: string;
  reloadCanvas: () => void;
  postCommandToBridge: (cmd: {
    action: string;
    codeId?: string;
    html?: string;
    requestId?: number;
    locked?: boolean;
  }) => void;
};

// AI edits to the page's own view. The model's whole-file replacement is
// staged through the layout save funnel, rendered by WebEngine's PVL
// endpoint, and painted by the bridge into the view's region of the live
// canvas, so nothing reaches the instance until Save.
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
  postCommandToBridge,
  loadedPath,
  reloadCanvas,
}: Args) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [renderParsleyPreview] = useRenderParsleyPreviewMutation();
  const [stagedCodeId, setStagedCodeId] = useState<string | null>(null);
  const stagedCodeIdRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<StudioAiPreview | null>(null);
  const [saveStatus, setSaveStatus] = useState<StudioSaveStatus>(null);
  const previewRequestRef = useRef(0);
  // The last staged AI change dropped without a save, and whose page it was,
  // so that page's transcript can say so.
  const [lastDiscard, setLastDiscard] = useState<{
    id: number;
    pageItemZUID: string;
  } | null>(null);
  const savedRef = useRef(false);
  const stagedPageRef = useRef("");
  // The paint the canvas has yet to acknowledge.
  // Kept past its timeout, so a late reply still counts.
  const pendingPaintRef = useRef<{
    request: number;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);
  const paintSeqRef = useRef(0);
  // The last render PVL returned, painted again if the canvas reloads while
  // the change is staged.
  const lastPaintRef = useRef<{ codeId: string; html: string } | null>(null);

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
      // Only a 200 carries CORS headers, so every error PVL answers (a Parsley
      // 400, the edge's content-filter 403, the load balancer's 413) reaches
      // the browser as a failed fetch with no status to read.
      const failed = t("content.studioAiPreviewRejected");
      return loadsExternalStylesheet(source)
        ? `${failed} ${t("content.studioAiPreviewStylesheet")}`
        : failed;
    },
    [t]
  );

  const clearPendingPaint = useCallback(() => {
    const timer = pendingPaintRef.current?.timer;
    if (timer) clearTimeout(timer);
    pendingPaintRef.current = null;
  }, []);

  const paint = useCallback(
    (codeId: string, html: string) => {
      clearPendingPaint();
      lastPaintRef.current = { codeId, html };
      setPreview({ status: "loading" });
      const pending: NonNullable<typeof pendingPaintRef.current> = {
        request: ++paintSeqRef.current,
        timer: null,
      };
      pending.timer = setTimeout(() => {
        pending.timer = null;
        if (pendingPaintRef.current !== pending) return;
        setPreview({
          status: "error",
          message: t("content.studioAiPaintNoReply"),
        });
      }, PAINT_TIMEOUT_MS);
      pendingPaintRef.current = pending;
      postCommandToBridge({
        action: "replaceCodeRegion",
        codeId,
        html,
        requestId: pending.request,
      });
    },
    [clearPendingPaint, postCommandToBridge, t]
  );

  const renderPreview = useCallback(
    async (view: string, codeId: string) => {
      const request = ++previewRequestRef.current;
      clearPendingPaint();
      lastPaintRef.current = null;
      // Multipart encoding sends every line ending as CRLF.
      const bytes = new TextEncoder().encode(
        view.replace(/\r\n|\r|\n/g, "\r\n")
      ).length;
      if (bytes > PVL_MAX_PARSLEY_BYTES) {
        setPreview({
          status: "error",
          message: t("content.studioAiPreviewTooLarge"),
        });
        return;
      }
      setPreview({ status: "loading" });
      // The bridge paints the result between the canvas's own region markers.
      const query = new URLSearchParams({ studio: "bridge" });
      if (previewPassword) query.set("zpw", previewPassword);
      let html: string;
      try {
        html = await renderParsleyPreview({
          url: `${previewOrigin}/-/pvl/?${query}`,
          parsley: view,
          itemZUID: pageItemZUID,
          timeout: PVL_TIMEOUT_MS,
        }).unwrap();
      } catch (error) {
        if (request !== previewRequestRef.current) return;
        setPreview({
          status: "error",
          message: describePreviewError(error, view),
        });
        return;
      }
      if (request !== previewRequestRef.current) return;
      paint(codeId, html);
    },
    [
      clearPendingPaint,
      describePreviewError,
      pageItemZUID,
      paint,
      previewOrigin,
      previewPassword,
      renderParsleyPreview,
      t,
    ]
  );

  const handleCodeRegionReplaced = useCallback(
    (msg: CodeRegionReplaced) => {
      const pending = pendingPaintRef.current;
      if (!pending || msg.requestId !== pending.request) return;
      clearPendingPaint();
      setPreview(
        msg.ok
          ? { status: "painted" }
          : { status: "error", message: t("content.studioAiPaintNotFound") }
      );
    },
    [clearPendingPaint, t]
  );

  // Set after reloading a canvas that reported another page, so a page that
  // always answers under a different path cannot reload forever.
  const reloadedElsewhereRef = useRef(false);

  // The canvas reloaded under a staged change (a save of other edits, a
  // discard, a permission clamp): lock it again and repaint the last render.
  // Back moves only the iframe, so a canvas now on another page is sent back
  // instead: this page's render does not belong in it. An older bridge
  // reports no path.
  const handleBridgeReady = useCallback(
    (path?: string) => {
      if (!stagedCodeIdRef.current) return;
      const elsewhere =
        path !== undefined &&
        comparablePath(path) !== comparablePath(loadedPath);
      if (elsewhere && !reloadedElsewhereRef.current) {
        reloadedElsewhereRef.current = true;
        reloadCanvas();
        return;
      }
      reloadedElsewhereRef.current = false;
      postCommandToBridge({ action: "setPreviewLock", locked: true });
      const last = lastPaintRef.current;
      if (last) paint(last.codeId, last.html);
    },
    [loadedPath, paint, postCommandToBridge, reloadCanvas]
  );

  useEffect(() => () => clearPendingPaint(), [clearPendingPaint]);

  const stage = (next: string) => {
    if (!pageView || typeof next !== "string") return;
    if (!next.trim()) {
      dispatch(
        notify({ kind: "warn", message: t("content.studioAiEmptyFile") })
      );
      return;
    }
    onBeforeStage();
    postCommandToBridge({ action: "setPreviewLock", locked: true });
    stageLayoutSourceUpdate(pageView.ZUID, next, { replacesSource: true });
    stagedCodeIdRef.current = pageView.ZUID;
    stagedPageRef.current = pageItemZUID;
    setStagedCodeId(pageView.ZUID);
    setSaveStatus("unsaved");
    void renderPreview(next, pageView.ZUID);
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
    clearPendingPaint();
    lastPaintRef.current = null;
    reloadedElsewhereRef.current = false;
    // No unlock: every way out reloads the frame, and the reloaded bridge
    // starts unlocked. Unlocking first would let the painted page post.
    stagedCodeIdRef.current = null;
    setStagedCodeId(null);
    setPreview(null);
    setSaveStatus((prev) => (prev === "saved" ? prev : null));
    if (!savedRef.current) {
      setLastDiscard({
        id: ++discardSeq,
        pageItemZUID: stagedPageRef.current,
      });
    }
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
    isPreviewing: !!stagedCodeId,
    preview,
    saveStatus,
    lastDiscard,
    handleLayoutRegionSaved,
    handleCodeRegionReplaced,
    handleBridgeReady,
  };
};
