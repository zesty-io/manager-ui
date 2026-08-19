import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Modal,
  Paper,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { MemoryRouter, useHistory, useLocation } from "react-router";
import { cloneDeep } from "lodash";
import { AppState } from "shell/store/types";
import { usePermission } from "shell/hooks/use-permissions";
import { isZestyEmail } from "utility/isZestyEmail";
import {
  fetchAllModelPublishings,
  fetchItem,
  saveItem,
} from "shell/store/content";
import { fetchModel } from "shell/store/models";
import { fetchAuditTrailDrafting } from "shell/store/logs";
import { notify } from "shell/store/notifications";
import { fetchFields } from "shell/store/fields";
import { ContentInfo } from "../content-editor/src/app/views/ItemEdit/Content/Actions/Widgets/ContentInfo";
import Editor from "../content-editor/src/app/components/Editor/Editor";
import { FieldError } from "../content-editor/src/app/components/Editor/FieldError";
import { PendingEditsModal } from "../content-editor/src/app/components/PendingEditsModal";
import { DirtyCodeModal } from "shell/components/DirtyCodeModal";
import { ResizableContainer } from "shell/components/ResizeableContainer";
import contentOneLogoOnly from "../../../public/images/contentOneLogoOnly.webp";
import contentOneLogo from "../../../public/images/contentOneLogo.webp";
import {
  findItemByPath,
  normalizePath,
  resolveItemByPath,
} from "./utils/pathResolver";
import {
  useGetWebViewsQuery,
  usePublishWebViewMutation,
  useUpdateWebViewMutation,
} from "shell/services/instance";
import { StudioHeader } from "./components/StudioHeader";
import { StudioPreview } from "./components/StudioPreview";
import { StudioSidePanel } from "./components/StudioSidePanel";
import { StudioInspectorPanel } from "./components/StudioInspectorPanel";
import {
  isMediaSlotDatatype,
  isTextReferenceableDatatype,
} from "./components/studioFieldMeta";
import { parseParsleyRef } from "./components/studioParsley";
import { StudioLayersPanel } from "./components/StudioLayersPanel";
import { StudioFreestyleAlert } from "./components/StudioFreestyleAlert";
import {
  StudioSaveChange,
  StudioSaveChangesModal,
} from "./components/StudioSaveChangesModal";
import { useLayoutReorderState } from "./hooks/useLayoutReorderState";
import {
  collectDirtyContentItems,
  useStudioContentSave,
} from "./hooks/useStudioContentSave";
import { useStudioBridge } from "./hooks/useStudioBridge";
import {
  ConnectField,
  ElementSlot,
  InteractionMode,
  LayoutBreadcrumbItem,
  usesLayoutGrammar,
} from "./hooks/studioTypes";
import { useStudioSelection } from "./hooks/useStudioSelection";
import { useStudioLayersTree } from "./hooks/useStudioLayersTree";
import { getRefRegistry } from "../../engine/refRegistry";
import { useMultiPermission } from "shell/hooks/use-permissions";
import { MediaApp } from "../media/src/app";

const drawerWidth = 440;

// Duration the dark refresh overlay takes to fade in/out. Kept in sync with
// the `transition` on the overlay in StudioPreview.
const REFRESH_FADE_MS = 200;

// Whether a resolved field value is markup rather than plain text. Deliberately
// narrow: it wants a real tag (`<h2`, `</p>`, `<br/>`), so prose containing a
// stray comparison like "5 < 6" is still previewed as text.
const looksLikeHtml = (value: string): boolean =>
  /<\/?[a-z][a-z0-9-]*(\s[^<>]*)?\/?>/i.test(value);

const withCodeIdBreadcrumbRoot = (
  codeId: string,
  breadcrumb: LayoutBreadcrumbItem[],
  codeLabel?: string
): LayoutBreadcrumbItem[] => {
  const segments = Array.isArray(breadcrumb)
    ? breadcrumb.filter((segment) => Boolean(segment?.label))
    : [];
  if (!codeId) return segments;
  const resolvedLabel = codeLabel || codeId;
  if (segments[0]?.label === resolvedLabel) return segments;
  return [{ label: resolvedLabel }, ...segments];
};

export const StudioWrapper = () => {
  const dispatch = useDispatch();

  // Which interaction modes this user is entitled to. Layout mode writes view
  // source, so it requires code access; content mode requires content update.
  // Studio is the union and needs both. The toggle renders only these, and no
  // code path may set a mode outside this list.
  //
  // Order matters: availableModes[0] is the preferred default, so a user with
  // both capabilities lands in studio.
  const canEditLayout = usePermission("CODE");
  const canEditContent = usePermission("UPDATE");
  const availableModes = useMemo<InteractionMode[]>(
    () =>
      [
        canEditContent && canEditLayout && "full",
        canEditContent && "content",
        canEditLayout && "layout",
      ].filter(Boolean) as InteractionMode[],
    [canEditContent, canEditLayout]
  );

  // `usePermission` reads redux `state.userRole`, which `fetchUserRole`
  // populates asynchronously. On first render it is `{systemRole: {}}`, so
  // every capability reads false and availableModes is empty. Initialising
  // the mode from it directly would lock the user into content before their
  // role arrives; instead the mode is promoted to the preferred default once
  // entitlement resolves, and only until the user picks a mode themselves.
  const userChoseModeRef = useRef(false);

  // Per the PRD, mode is resolved from permissions rather than chosen: a user
  // is placed in the mode that matches their access and is never offered one
  // they cannot act in. Zesty staff keep the switch so a single account can
  // exercise all three surfaces without re-provisioning roles.
  //
  // This is presentation only. `availableModes` still bounds what any switch
  // can reach, so a staff account cannot select into a mode it lacks the
  // permissions for.
  const userEmail = useSelector((state: AppState) => state.user?.email);
  const canSelectMode = isZestyEmail(userEmail || "");

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const currentHoverStudioIdRef = useRef<string | null>(null);
  const [showPendingLayoutModal, setShowPendingLayoutModal] = useState(false);
  const [showSaveChangesModal, setShowSaveChangesModal] = useState(false);
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("content");
  const [studioSaving, setStudioSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});
  const [saveClicked, setSaveClicked] = useState(false);
  const fieldErrorRef = useRef<any>(null);
  const pendingLayoutContinuationRef = useRef<null | (() => void)>(null);
  const previewReloadContinuationRef = useRef<null | (() => void)>(null);
  // Set while a merged save is running so the content and layout save paths,
  // which each refresh the preview internally, do not reload the iframe twice.
  const suppressPreviewRefreshRef = useRef(false);
  const bridgeUpdatedFieldZuidRef = useRef<string | null>(null);
  const [isFetchingItem, setIsFetchingItem] = useState(false);
  const [isFetchingModel, setIsFetchingModel] = useState(false);
  const [isFetchingFields, setIsFetchingFields] = useState(false);
  // The field the user picked, per SLOT (`codeId::layoutId::slotKey`). The bridge
  // is only ever handed the Parsley expression, so it can't tell the layers tree
  // which field a freshly connected row shows. We already have the ConnectField
  // at pick time — keep it rather than trying to recover a name from the
  // expression afterwards.
  //
  // Keyed per slot, not per element: an <img> has several (src, alt, poster), and
  // an element-level key meant a plain-text edit to ANY of them dropped the label
  // recorded for a sibling that is still connected.
  const [connectedBySlot, setConnectedBySlot] = useState<
    Record<string, ConnectField>
  >({});
  const [imageEditState, setImageEditState] = useState<{
    codeId: string;
    layoutId: string;
    isLeafImg: boolean;
    imgIndex: number;
    currentSrc: string;
    // Set when the picker was opened from the Inspector panel, so the panel's
    // displayed value updates after a pick. `attr` is the target attribute
    // (src or poster) and `tagName` addresses nested elements.
    fromInspector?: boolean;
    attr?: string;
    tagName?: string;
  } | null>(null);
  const history = useHistory();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const rawPathParam = searchParams.get("path") || "/";
  const normalizedPathParam = useMemo(
    () => normalizePath(rawPathParam || "/"),
    [rawPathParam]
  );

  const instance = useSelector((state: AppState) => state.instance);
  const previewLock = useSelector((state: AppState) =>
    state.settings.instance.find(
      (setting: any) => setting.key === "preview_lock_password" && setting.value
    )
  );
  const contentItems = useSelector((state: AppState) => state.content);
  const modelsState = useSelector((state: AppState) => state.models);
  const fieldsState = useSelector((state: AppState) => state.fields);
  // Read content straight off the store rather than through the `contentItems`
  // render value. Three reasons: it keeps resolvePreviewValue — and therefore
  // handleSlotChange, handed straight to the panel — at a stable identity even
  // though `contentItems` changes on every keystroke; it stays correct inside
  // the fetch-and-replay `.then()` below, which runs after the reducer but
  // BEFORE React re-renders, so any render-time snapshot would be stale exactly
  // when the replay needs it; and it lets the revalidation effects below check
  // the cache without taking `contentItems` as a dependency, which would make
  // an unconditional fetch re-trigger itself forever.
  const store = useStore();
  const getContentItems = useCallback(
    () => (store.getState() as AppState).content,
    [store]
  );
  const { data: webViews = [] } = useGetWebViewsQuery({ status: "dev" });
  const [updateWebView] = useUpdateWebViewMutation();
  const [publishWebView] = usePublishWebViewMutation();

  const codeFileNameById = useMemo(() => {
    return webViews.reduce<Record<string, string>>((acc, view) => {
      if (view?.ZUID && view?.fileName) {
        acc[view.ZUID] = view.fileName.endsWith(".html")
          ? view.fileName
          : `${view.fileName}.html`;
      }
      return acc;
    }, {});
  }, [webViews]);

  const postCommandToBridge = useCallback(
    (cmd: {
      action: string;
      studioId?: string;
      mode?: InteractionMode;
      fieldZuid?: string;
      className?: string;
      css?: string;
      value?: string;
      html?: string;
      itemZuid?: string;
      selector?: string;
      layoutId?: string;
      codeId?: string;
      // Patched template source for `codeId` (syncTemplateSource).
      source?: string;
      targetLayoutId?: string;
      targetCodeId?: string;
      position?: string;
      isLeafImg?: boolean;
      imgIndex?: number;
      newSrc?: string;
      attr?: string;
      isSelf?: boolean;
      tagName?: string;
      elementIndex?: number;
      newTag?: string;
      booleanAttr?: boolean;
      // Which of the element's own text runs to write (updateElementText).
      textIndex?: number;
      // Resolved value to DISPLAY in the live DOM on connect, while the template
      // still saves the Parsley `value` (updateElementText / updateElementAttr).
      previewValue?: string;
      // `previewValue` is markup and should be parsed rather than written as
      // text (a wysiwyg/markdown field). Text slots only.
      previewAsHtml?: boolean;
    }) => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow) return;

      iframeWindow.postMessage(
        {
          source: "zesty-studio-host",
          message: {
            type: "COMMAND",
            payload: cmd,
          },
        },
        "*"
      );
    },
    []
  );

  // The bridge reads its template source off the page's <template> blocks, which
  // are frozen at render time. Push every unsaved layout edit down so it doesn't
  // keep answering from the pre-edit source.
  const syncTemplateSourceToBridge = useCallback(
    (codeId: string, source: string) => {
      postCommandToBridge({ action: "syncTemplateSource", codeId, source });
    },
    [postCommandToBridge]
  );

  const {
    selectedElement,
    selectedLayout,
    inspectorSelection,
    panelMode,
    filteredFieldZuid,
    setSelectedLayout,
    clearSelection,
    clearLayoutSelection,
    applyLayoutSelection,
    handleLayoutBreadcrumbSelect,
    clearHighlightOnly,
    applySelection,
    applyInspectorSelection,
    returnToInspector,
    updateInspectorSlotValue,
    refreshInspectorSlots,
  } = useStudioSelection({
    postCommandToBridge,
    codeFileNameById,
    withCodeIdBreadcrumbRoot,
  });

  const resolvedFromCache = useMemo(
    () => findItemByPath(normalizedPathParam, contentItems),
    [contentItems, normalizedPathParam]
  );

  const [pageItemZUID, setPageItemZUID] = useState("");
  const [pageModelZUID, setPageModelZUID] = useState("");
  const [unresolvedPath, setUnresolvedPath] = useState(
    !resolvedFromCache && !!normalizedPathParam
  );

  const pageItem = pageItemZUID ? contentItems[pageItemZUID] : null;
  const pageModel = pageModelZUID ? modelsState[pageModelZUID] : null;

  const buildIframeSrc = useCallback(
    (path: string) => {
      const normalized = normalizePath(path || "/");
      const instanceHash = instance?.randomHashID ?? "";
      const baseUrl = `${CONFIG.URL_PREVIEW_PROTOCOL}${instanceHash}${CONFIG.URL_PREVIEW}${normalized}`;
      const queryParams = new URLSearchParams();

      queryParams.set("studio", "bridge");

      if (previewLock) {
        queryParams.set("zpw", previewLock.value);
      }

      const query = queryParams.toString();

      return query ? `${baseUrl}?${query}` : baseUrl;
    },
    [instance?.randomHashID, previewLock]
  );

  const [previewPath, setPreviewPath] = useState(
    normalizedPathParam || pageItem?.web?.path || "/"
  );

  const iframeSrc = useMemo(
    () => buildIframeSrc(previewPath),
    [buildIframeSrc, previewPath]
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedItemZUID = selectedElement?.itemZuid || pageItemZUID;
  const selectedModelZUID = selectedElement?.modelZuid || pageModelZUID;

  const selectedItem = selectedItemZUID
    ? contentItems[selectedItemZUID] || null
    : null;

  const selectedModel = selectedModelZUID
    ? modelsState[selectedModelZUID] || null
    : null;
  const panelTitle =
    pageItem?.web?.metaTitle || pageItem?.web?.metaLinkText || "Studio";
  const pageItemVersion =
    typeof pageItem?.meta?.version === "number" ? pageItem.meta.version : null;
  const headerTitle = unresolvedPath ? "Preview only" : panelTitle;

  const updateItemByPath = useCallback(
    async (path: string, options?: { onApplied?: () => void }) => {
      const { onApplied } = options ?? {};
      const resolved = await resolveItemByPath({
        path,
        contentItems,
        dispatch,
      });

      const applyResolved = () => {
        if (resolved?.meta?.ZUID && resolved?.meta?.contentModelZUID) {
          const normalized = normalizePath(path || "/");
          onApplied?.();
          setPreviewPath(normalized);
          setPageItemZUID(resolved.meta.ZUID);
          setPageModelZUID(resolved.meta.contentModelZUID);
          setUnresolvedPath(false);
        } else {
          onApplied?.();
          setUnresolvedPath(true);
        }
      };

      applyResolved();
    },
    [contentItems, dispatch]
  );

  useEffect(() => {
    if (
      !resolvedFromCache?.meta?.ZUID ||
      !resolvedFromCache?.meta?.contentModelZUID
    ) {
      return;
    }
    if (
      resolvedFromCache.meta.ZUID === pageItemZUID &&
      resolvedFromCache.meta.contentModelZUID === pageModelZUID
    ) {
      if (unresolvedPath) setUnresolvedPath(false);
      return;
    }
    setPageItemZUID(resolvedFromCache.meta.ZUID);
    setPageModelZUID(resolvedFromCache.meta.contentModelZUID);
    clearLayoutSelection();
    clearSelection();
    setUnresolvedPath(false);
  }, [
    clearLayoutSelection,
    clearSelection,
    pageItemZUID,
    pageModelZUID,
    resolvedFromCache,
    unresolvedPath,
  ]);

  const updateStudioUrl = useCallback(
    (path: string) => {
      if (!location.pathname.startsWith("/studio")) return;
      const normalized = normalizePath(path || "/");
      history.replace(`/studio?path=${normalized}`);

      if (window.parent && window.parent !== window) {
        // When Studio itself is embedded, notify the outer parent window so it
        // can stay in sync with the active preview path.
        window.parent.postMessage(
          {
            source: "zesty-studio-host",
            message: {
              type: "PATH_CHANGE",
              location: {
                path: normalized,
                search: window.location.search,
                hash: window.location.hash,
                href: window.location.href,
              },
            },
          },
          "*"
        );
      }
    },
    [history, location.pathname]
  );

  const handleEditInManager = useCallback(() => {
    if (!pageModelZUID || !pageItemZUID) return;
    history.push(`/content/${pageModelZUID}/${pageItemZUID}`);
  }, [pageModelZUID, pageItemZUID, history]);

  // A layout built in Freestyle is backed by its own per-item view file rather
  // than the model's shared template, so it is only editable in the Freestyle
  // app. Same convention Content.js uses to find an item's Freestyle template.
  const isFreestyleLayout = useMemo(
    () =>
      !!pageItemZUID &&
      webViews.some(
        (view) => view?.fileName === `/z/pvl/${pageItemZUID}.zhtml`
      ),
    [pageItemZUID, webViews]
  );

  // Dismissal is tracked per mode, not globally: in layout mode the overlay is
  // the only route to Freestyle, so a dismissal in content mode (where the
  // panel button still offers it) must not suppress it there too.
  const [dismissedAlertModes, setDismissedAlertModes] = useState<
    InteractionMode[]
  >([]);

  // Re-surface the notice whenever the preview moves to a different item — a
  // dismissal applies to the page it was dismissed on, not the whole session.
  useEffect(() => {
    setDismissedAlertModes([]);
  }, [pageItemZUID]);

  const dismissFreestyleAlert = useCallback(() => {
    setDismissedAlertModes((prev) =>
      prev.includes(interactionMode) ? prev : [...prev, interactionMode]
    );
  }, [interactionMode]);

  const showFreestyleAlert =
    isFreestyleLayout && !dismissedAlertModes.includes(interactionMode);

  const handleEditInFreestyle = useCallback(() => {
    if (!pageModelZUID || !pageItemZUID) return;
    history.push(`/content/${pageModelZUID}/${pageItemZUID}/freestyle`);
  }, [pageModelZUID, pageItemZUID, history]);

  const fields = useMemo(() => {
    if (!selectedModelZUID) return [];
    return Object.keys(fieldsState)
      .filter(
        (fieldZUID) =>
          fieldsState[fieldZUID]?.contentModelZUID === selectedModelZUID
      )
      .map((fieldZUID) => fieldsState[fieldZUID])
      .sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0));
  }, [fieldsState, selectedModelZUID]);

  useEffect(() => {
    if (!selectedModelZUID) return;
    setIsFetchingFields(true);
    Promise.resolve(dispatch(fetchFields(selectedModelZUID))).finally(() =>
      setIsFetchingFields(false)
    );
  }, [dispatch, selectedModelZUID]);

  const activeFields = useMemo(() => {
    if (fields?.length) {
      return fields.filter(
        (field: any) => !field.deletedAt && !["og_image"].includes(field.name)
      );
    }

    return [];
  }, [fields]);

  const fieldNameByZuid = useMemo(() => {
    const map = new Map<string, string>();
    activeFields.forEach((field: any) => {
      if (field?.ZUID && field?.name) {
        map.set(field.ZUID, field.name);
      }
    });
    return map;
  }, [activeFields]);

  // Derived, not snapshotted at click time: selecting a field on an EXTERNAL
  // item switches `selectedModelZUID`, and that model's fields are still being
  // fetched when the click is handled. Resolving here means the panel narrows as
  // soon as they land instead of staying stuck on "all fields".
  const filteredFieldName = useMemo(
    () =>
      filteredFieldZuid ? fieldNameByZuid.get(filteredFieldZuid) || null : null,
    [fieldNameByZuid, filteredFieldZuid]
  );

  const hasErrors = useMemo(() => {
    const errorList = Object.values(fieldErrors)
      ?.map((error) => {
        return Object.values(error) ?? [];
      })
      ?.flat()
      .some((error) => !!error);

    if (!errorList) {
      setSaveClicked(false);
    }

    return errorList;
  }, [fieldErrors]);

  const onUpdateFieldErrors = useCallback((errors: Record<string, any>) => {
    setFieldErrors(errors);
  }, []);

  // `state.content` is hydrated from the IndexedDB warm cache at boot
  // (src/shell/index.js), so an entry being *present* says nothing about how
  // *current* it is — the cached copy can be many versions behind whatever the
  // API has. So always revalidate on mount and whenever the page item changes,
  // the way ItemEdit's `load()` does; the cache only decides whether we can
  // render something while the request is in flight. Checking the cache through
  // getContentItems() rather than the `contentItems` render value is what keeps
  // this effect from re-triggering itself off its own fetch.
  useEffect(() => {
    if (!pageModelZUID || !pageItemZUID) return;
    const hasWarmCopy = Boolean(getContentItems()[pageItemZUID]?.meta?.ZUID);
    if (!hasWarmCopy) setIsFetchingItem(true);
    Promise.resolve(dispatch(fetchItem(pageModelZUID, pageItemZUID))).finally(
      () => setIsFetchingItem(false)
    );
  }, [dispatch, getContentItems, pageItemZUID, pageModelZUID]);

  useEffect(() => {
    if (!pageModelZUID) return;
    if (!pageModel) {
      setIsFetchingModel(true);
      Promise.resolve(dispatch(fetchModel(pageModelZUID))).finally(() =>
        setIsFetchingModel(false)
      );
    } else {
      setIsFetchingModel(false);
    }
  }, [dispatch, pageModel, pageModelZUID]);

  const editorItem = selectedItem || null;
  const editorModel = selectedModel || null;

  const isSelectedItemLoading =
    isFetchingItem ||
    isFetchingModel ||
    isFetchingFields ||
    !editorItem ||
    !editorModel ||
    (selectedElement?.itemZuid &&
      selectedElement.itemZuid !== pageItemZUID &&
      !selectedItem);
  const isSaving = studioSaving;

  const selectedItemLabel = useMemo(
    () =>
      selectedItem?.web?.metaTitle ||
      selectedItem?.web?.metaLinkText ||
      selectedItemZUID,
    [
      selectedItem?.web?.metaLinkText,
      selectedItem?.web?.metaTitle,
      selectedItemZUID,
    ]
  );

  const activeVersion = editorItem?.meta?.version ?? 0;
  const lastVersionRef = useRef<{ itemZUID: string; version: number } | null>(
    null
  );

  useEffect(() => {
    if (!selectedItemZUID || !editorItem) return;
    if (typeof editorItem?.meta?.version !== "number") return;

    const nextVersion = editorItem.meta.version;
    const prev = lastVersionRef.current;

    if (!prev || prev.itemZUID !== selectedItemZUID) {
      lastVersionRef.current = {
        itemZUID: selectedItemZUID,
        version: nextVersion,
      };
      return;
    }

    if (prev.version !== nextVersion) {
      if (!studioSaving) {
        dispatch({
          type: "MARK_ITEM_DIRTY",
          itemZUID: selectedItemZUID,
        });
      }
      lastVersionRef.current = {
        itemZUID: selectedItemZUID,
        version: nextVersion,
      };
    }
  }, [dispatch, editorItem, selectedItemZUID, studioSaving]);

  useEffect(() => {
    const iframeEl = iframeRef.current;
    if (!iframeEl) return;

    const handleLoad = () => setIsNavigating(false);
    iframeEl.addEventListener("load", handleLoad);
    return () => iframeEl.removeEventListener("load", handleLoad);
  }, []);

  useEffect(
    () => () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    },
    []
  );

  const refreshPreviewFrame = useCallback(
    (onReloadComplete?: () => void) => {
      // A merged save refreshes once itself, after both backends have run.
      if (suppressPreviewRefreshRef.current) {
        if (onReloadComplete) {
          previewReloadContinuationRef.current = onReloadComplete;
        }
        return;
      }
      previewReloadContinuationRef.current = onReloadComplete || null;
      // Fade the dark overlay in first, then reload the iframe underneath it
      // so the blank reload is hidden and edits are blocked until it finishes.
      setIsRefreshing(true);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        refreshTimeoutRef.current = null;
        if (iframeRef.current) {
          iframeRef.current.src = iframeSrc;
        }
      }, REFRESH_FADE_MS);
    },
    [iframeSrc]
  );

  // Maps a saveItem() response's validation / server errors into the shared
  // fieldErrors UI state and surfaces a notification. Shared by the single-item
  // save (handleSave) and the staged batch save (useStudioContentSave).
  const applyItemSaveErrors = useCallback(
    (res: any, itemLabel: string, options?: { applyFieldErrors?: boolean }) => {
      // `setFieldErrors` / `activeFields` are scoped to the selected item, so
      // callers batch-saving non-selected items pass applyFieldErrors: false to
      // get the toast without polluting the active item's field panel.
      const applyFieldErrors = options?.applyFieldErrors ?? true;
      if (res?.err === "VALIDATION_ERROR") {
        if (applyFieldErrors) {
          setFieldErrors((prev) => {
            const errors = cloneDeep(prev);

            res?.missingRequired?.forEach((field: any) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                MISSING_REQUIRED: true,
              };
            });

            res?.lackingCharLength?.forEach((field: any) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                LACKING_MINLENGTH: field.settings?.minCharLimit,
              };
            });

            res?.regexPatternMismatch?.forEach((field: any) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                REGEX_PATTERN_MISMATCH: field.settings?.regexMatchErrorMessage,
              };
            });

            res?.regexRestrictPatternMatch?.forEach((field: any) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                REGEX_RESTRICT_PATTERN_MATCH:
                  field.settings?.regexRestrictErrorMessage,
              };
            });

            res?.invalidRange?.forEach((field: any) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                INVALID_RANGE: `Value must be between ${field.settings?.minValue} and ${field.settings?.maxValue}`,
              };
            });

            res?.invalidBlockVariantValue?.forEach((field: any) => {
              errors[field.name] = {
                ...(errors[field.name] ?? {}),
                INVALID_BLOCK_VARIANT: true,
              };
            });

            return errors;
          });
        }

        dispatch(
          notify({
            kind: "error",
            message: `Cannot Save: ${itemLabel} - missing or invalid data`,
          })
        );
        return;
      }

      if (res?.status === 400) {
        if (
          applyFieldErrors &&
          res.error?.toLowerCase()?.includes("data too long")
        ) {
          const dataLongErrorMatch = res.error?.match(/'([^']*)'/);

          if (dataLongErrorMatch?.[1]) {
            const fieldName = dataLongErrorMatch[1];
            const oneToManyFieldNames = activeFields?.reduce(
              (names: string[], currItem: any) => {
                if (currItem?.datatype === "one_to_many") {
                  return [...names, currItem?.name];
                }

                return names;
              },
              []
            );

            setFieldErrors((prev) => {
              const errors = cloneDeep(prev);
              errors[fieldName] = {
                ...(errors[fieldName] ?? {}),
                CUSTOM_ERROR: oneToManyFieldNames?.includes(fieldName)
                  ? "Cannot save field. Please reduce the total number of items selected."
                  : "Cannot save field. Value is too long.",
              };
              return errors;
            });
          }
        }

        dispatch(
          notify({
            kind: "error",
            message: `Cannot Save: ${itemLabel}${
              res.error ? ` - ${res.error}` : ""
            }`,
          })
        );
        return;
      }

      dispatch(
        notify({
          kind: "error",
          message: `Cannot Save: ${itemLabel}`,
        })
      );
    },
    [activeFields, dispatch]
  );

  const { saveAllContent, saveAndPublishAllContent, discardAllContent } =
    useStudioContentSave({
      dispatch,
      refreshPreviewFrame,
      applyItemSaveErrors,
      setStudioSaving,
    });

  const dirtyContentItems = useMemo(
    () => collectDirtyContentItems(contentItems),
    [contentItems]
  );
  const hasPendingContentChanges = dirtyContentItems.length > 0;
  const dirtyContentItemZUIDs = useMemo(
    () => dirtyContentItems.map((item) => item.itemZUID),
    [dirtyContentItems]
  );
  const canUpdatePendingContent = useMultiPermission(
    "UPDATE",
    dirtyContentItemZUIDs
  );
  const canPublishPendingContent = useMultiPermission(
    "PUBLISH",
    dirtyContentItemZUIDs
  );

  const {
    pendingLayoutCodeIds,
    isSavingLayout,
    handleDiscardPendingLayoutSave,
    handleSavePendingLayout,
    handleSaveAndPublishPendingLayout,
    handleTemplateSourceMap,
    handleReorderOutput,
    handleLayoutContentUpdate,
    handleLayoutImageSrcUpdate,
    handleLayoutElementAttrUpdate,
    handleLayoutTextUpdate,
    handleLayoutTagUpdate,
  } = useLayoutReorderState({
    webViews,
    codeFileNameById,
    updateWebView,
    publishWebView,
    dispatch,
    clearLayoutSelection,
    refreshPreviewFrame,
    syncTemplateSourceToBridge,
    withCodeIdBreadcrumbRoot,
    onSelectedLayoutBreadcrumbChange: setSelectedLayout,
  });
  const hasPendingLayoutChanges = pendingLayoutCodeIds.length > 0;
  const canUpdatePendingLayout = useMultiPermission(
    "UPDATE",
    pendingLayoutCodeIds
  );
  const canPublishPendingLayout = useMultiPermission(
    "PUBLISH",
    pendingLayoutCodeIds
  );

  // One save bar across all three modes. There is no mode fork here any more:
  // the merged form degenerates correctly in the single-capability modes,
  // because a mode that cannot stage a change never has one pending, and
  // `useMultiPermission` returns true for an empty ZUID list — so a user with
  // no layout changes is not gated on layout permission.
  const showSaveBar = hasPendingContentChanges || hasPendingLayoutChanges;
  // The save bar is one control now, but its test hooks stay binary because
  // the existing studio specs address them by name. Layout naming only when
  // layout is the ONLY thing pending, which is exactly when layout mode used
  // to render this bar; every other case keeps the content naming.
  const saveBarHookPrefix =
    hasPendingLayoutChanges && !hasPendingContentChanges
      ? "StudioLayout"
      : "StudioContent";
  const saveBarIsSaving = studioSaving || isSavingLayout;
  const saveBarCanSave = canUpdatePendingContent && canUpdatePendingLayout;
  const saveBarCanPublish = canPublishPendingContent && canPublishPendingLayout;
  // Saving AND discarding both reload the preview and rebuild the layers tree, so
  // afterwards neither the canvas nor the tree row is still selected. Leaving the
  // Inspector open would describe a selection nothing else agrees with.
  //
  // Only the Inspector — a content-mode field editor is deliberately left alone,
  // since dropping it would eject the user from what they were editing.
  // Deliberately synchronous, NOT hung off refreshPreviewFrame's completion
  // callback: that only fires on the iframe's load event, so a preview that
  // never finishes loading would leave the panel selected forever. The save path
  // has always deselected synchronously without the tree re-emit reinstating it.
  const deselectForPreviewReload = useCallback(() => {
    if (inspectorSelection) clearSelection();
    clearLayoutSelection();
  }, [clearLayoutSelection, clearSelection, inspectorSelection]);

  // Discards whatever is actually pending, in either or both backends.
  const handleSaveBarCancel = () => {
    deselectForPreviewReload();
    if (hasPendingLayoutChanges) handleDiscardPendingLayoutSave();
    if (hasPendingContentChanges) void discardAllContent();
  };
  // The "Save Changes" bar button opens the modal; the modal's Save All /
  // Save & Publish All buttons run the active mode's batch handlers and close.
  // Close the modal on full success; keep it open on partial failure so the
  // user sees which items remain (still listed + toasted) and can retry.
  const closeModalUnlessFailed = (result: { failedCount?: number } | void) => {
    if (result && result.failedCount) return;
    setShowSaveChangesModal(false);
    deselectForPreviewReload();
  };
  // Runs whichever backends have pending changes, content first, and reloads
  // the preview exactly once at the end.
  //
  // The two are attempted INDEPENDENTLY rather than short-circuiting on the
  // first failure. Both row sources derive from what is still dirty
  // (`dirtyContentItems` from redux, `pendingLayoutCodeIds` from the hook,
  // which drops successfully-saved regions), so attempting both leaves exactly
  // the failed half listed in the modal with no extra bookkeeping.
  const runMergedSave = async (
    saveContent: () => Promise<{ failedCount?: number } | void>,
    saveLayout: () => Promise<unknown>
  ): Promise<{ failedCount: number }> => {
    // Both save paths call refreshPreviewFrame internally. Suppress it for the
    // duration so a merged save does not reload the iframe twice.
    suppressPreviewRefreshRef.current = true;
    let failedCount = 0;

    try {
      if (hasPendingContentChanges) {
        const result = await saveContent();
        failedCount += (result && result.failedCount) || 0;
      }
    } catch {
      failedCount += 1;
    }

    try {
      // Layout writes view source and strips layout ids; running it after the
      // content writes avoids racing two preview reloads against a layers-tree
      // rebuild.
      if (hasPendingLayoutChanges) await saveLayout();
    } catch {
      failedCount += 1;
    }

    // A save hook may have registered a post-reload continuation while the
    // refresh was suppressed. Hand it to the single real refresh instead of
    // letting the no-arg call clear it.
    suppressPreviewRefreshRef.current = false;
    const storedContinuation = previewReloadContinuationRef.current;
    previewReloadContinuationRef.current = null;
    refreshPreviewFrame(storedContinuation || undefined);
    return { failedCount };
  };

  const handleModalSaveAll = () => {
    if (!saveBarCanSave) return;
    runMergedSave(saveAllContent, handleSavePendingLayout).then(
      closeModalUnlessFailed,
      () => {}
    );
  };
  const handleModalSaveAndPublishAll = () => {
    if (!saveBarCanPublish) return;
    runMergedSave(
      saveAndPublishAllContent,
      handleSaveAndPublishPendingLayout
    ).then(closeModalUnlessFailed, () => {});
  };

  // Rows shown in the Save Changes modal — scoped to the active mode: content
  // mode lists the staged content/block items, layout mode lists changed code
  // files. (Per product: staging is gated by mode, never mixed.)
  const saveChanges = useMemo<StudioSaveChange[]>(() => {
    const layoutChanges: StudioSaveChange[] = pendingLayoutCodeIds.map(
      (codeId) => {
        const webView = webViews.find((view) => view.ZUID === codeId);
        return {
          id: codeId,
          title: codeFileNameById[codeId] || webView?.fileName || codeId,
          type: "Code",
          versions:
            typeof webView?.version === "number"
              ? [{ version: webView.version, state: "published" }]
              : [],
        };
      }
    );

    const contentChanges: StudioSaveChange[] = dirtyContentItems.map((item) => {
      const storeItem = contentItems[item.itemZUID];
      const model = modelsState[item.modelZUID];
      const draftVersion = storeItem?.meta?.version;
      const publishedVersion = storeItem?.publishing?.version;
      const versions: StudioSaveChange["versions"] = [];
      if (typeof draftVersion === "number") {
        versions.push({ version: draftVersion, state: "draft" });
      }
      if (
        typeof publishedVersion === "number" &&
        publishedVersion !== draftVersion
      ) {
        versions.push({ version: publishedVersion, state: "published" });
      }
      return {
        id: item.itemZUID,
        title: item.label,
        type: model?.type === "block" ? "Block" : "Content",
        versions,
      };
    });

    // Content first, matching the order the merged save runs them in. The
    // modal groups by the `type` chip each row already carries.
    return [...contentChanges, ...layoutChanges];
  }, [
    codeFileNameById,
    contentItems,
    dirtyContentItems,
    modelsState,
    pendingLayoutCodeIds,
    webViews,
  ]);

  const requestProceedWithPendingLayoutSave = useCallback(
    (onProceed: () => void) => {
      if (!hasPendingLayoutChanges) {
        onProceed();
        return;
      }

      pendingLayoutContinuationRef.current = onProceed;
      setShowPendingLayoutModal(true);
    },
    [hasPendingLayoutChanges]
  );

  const syncBridgeInteractionMode = useCallback(
    (nextMode: InteractionMode) => {
      // The bridge stays binary. Studio's canvas grammar IS layout's, so it
      // goes over the wire as "layout" and the bridge needs no third value.
      const wireMode: "content" | "layout" = usesLayoutGrammar(nextMode)
        ? "layout"
        : "content";

      postCommandToBridge({
        action: "setInteractionMode",
        mode: wireMode,
      });

      if (wireMode === "layout") {
        postCommandToBridge({
          action: "enableReorderByUid",
          selector: "[data-layout-id]",
        });
      } else {
        postCommandToBridge({
          action: "disableReorderByUid",
        });
      }
    },
    [postCommandToBridge]
  );

  const handleInteractionModeChange = useCallback(
    (nextMode: InteractionMode) => {
      if (interactionMode === nextMode) return;
      // Refuse a mode the user is not entitled to, before any of the
      // dirty-state branches below can run and commit the change.
      if (!availableModes.includes(nextMode)) return;

      // From here the mode is the user's choice, so stop tracking the
      // preferred default.
      userChoseModeRef.current = true;

      const applyInteractionModeChange = () => {
        if (currentHoverStudioIdRef.current) {
          postCommandToBridge({
            action: "removeClass",
            studioId: currentHoverStudioIdRef.current,
            className: "studio-hover",
          });
          currentHoverStudioIdRef.current = null;
        }

        clearLayoutSelection();
        clearSelection();
        setInteractionMode(nextMode);
        syncBridgeInteractionMode(nextMode);
      };

      // The gate is on what the DESTINATION cannot commit, which is why both
      // conditions name a specific target rather than testing "leaving X".
      // Studio commits both, so it matches neither and entering it is never
      // gated — correct, since nothing becomes uncommittable. Leaving studio
      // still prompts, because the destination narrows.
      if (nextMode === "layout" && hasPendingContentChanges) {
        const openModal = (window as any).openContentNavigationModal;
        if (typeof openModal === "function") {
          openModal((shouldProceed: boolean) => {
            if (shouldProceed) {
              applyInteractionModeChange();
            }
          });
          return;
        }
      }

      if (nextMode === "content" && hasPendingLayoutChanges) {
        requestProceedWithPendingLayoutSave(applyInteractionModeChange);
        return;
      }

      applyInteractionModeChange();
    },
    [
      availableModes,
      clearLayoutSelection,
      clearSelection,
      interactionMode,
      hasPendingLayoutChanges,
      hasPendingContentChanges,
      postCommandToBridge,
      requestProceedWithPendingLayoutSave,
      syncBridgeInteractionMode,
    ]
  );

  // Two rules, in priority order:
  //
  // 1. Clamp — if the active mode is not entitled, correct it. This holds
  //    whether or not the user chose it, and covers entitlement narrowing
  //    while Studio is open.
  // 2. Promote — until the user picks a mode themselves, track the preferred
  //    default. This is what resolves the hydration race: the mode starts as
  //    "content" and becomes "full" when the role arrives.
  //
  // Selection is not cleared on either path. Unlike a user-driven switch,
  // nothing has been selected yet when these fire.
  //
  // Pending work is a different matter. A user-driven switch routes through
  // the modals in handleInteractionModeChange, but this path cannot: the
  // entitlement is already gone, so there is nothing to offer — the write
  // would be rejected by the server. Leaving the change staged is worse than
  // dropping it, because the mode that could commit it is now unreachable and
  // the save bar disappears with it: the edit stays applied in memory with no
  // affordance to save, discard, or even see it. So discard explicitly and
  // say so, rather than silently stranding it.
  useEffect(() => {
    if (!availableModes.length) return;

    const isEntitled = availableModes.includes(interactionMode);
    if (isEntitled && userChoseModeRef.current) return;

    const nextMode = availableModes[0];
    if (nextMode === interactionMode) return;

    const losesLayout = !usesLayoutGrammar(nextMode) && hasPendingLayoutChanges;
    const losesContent = nextMode === "layout" && hasPendingContentChanges;

    if (losesLayout) handleDiscardPendingLayoutSave();
    if (losesContent) void discardAllContent();

    if (losesLayout || losesContent) {
      dispatch(
        notify({
          kind: "warn",
          message:
            "Your permissions changed while Studio was open, so unsaved " +
            (losesLayout && losesContent
              ? "content and layout changes were discarded."
              : losesLayout
              ? "layout changes were discarded."
              : "content changes were discarded."),
        })
      );
    }

    setInteractionMode(nextMode);
    syncBridgeInteractionMode(nextMode);
  }, [
    availableModes,
    dispatch,
    discardAllContent,
    handleDiscardPendingLayoutSave,
    hasPendingContentChanges,
    hasPendingLayoutChanges,
    interactionMode,
    syncBridgeInteractionMode,
  ]);

  const handleLanguageChange = useCallback(
    (langCode: string) => {
      const normalizedPath = normalizePath(previewPath);
      const pathSegments = normalizedPath.split("/").filter(Boolean);
      // Match a leading locale segment like `en` or `en-us`.
      const isLangSegment =
        pathSegments.length > 0 &&
        /^[a-z]{2}(?:-[a-z]{2})?$/i.test(pathSegments[0]);
      const basePath = isLangSegment
        ? normalizePath(`/${pathSegments.slice(1).join("/")}`)
        : normalizedPath;
      const localizedPath =
        langCode === "en-US"
          ? basePath
          : normalizePath(`/${langCode.toLowerCase()}${basePath}`);

      const nextSrc = buildIframeSrc(localizedPath);
      if (!nextSrc) {
        dispatch(
          notify({
            kind: "warn",
            message: "Invalid URL. Please check and try again.",
          })
        );
        return;
      }
      updateItemByPath(localizedPath, {
        onApplied: () => {
          clearSelection();
          setIsNavigating(true);
          updateStudioUrl(localizedPath);
        },
      });
    },
    [
      buildIframeSrc,
      clearSelection,
      dispatch,
      previewPath,
      updateItemByPath,
      updateStudioUrl,
    ]
  );

  const lastResolvedPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (!normalizedPathParam) return;
    if (lastResolvedPathRef.current === normalizedPathParam) return;
    lastResolvedPathRef.current = normalizedPathParam;
    const normalized = normalizePath(normalizedPathParam);
    setIsNavigating(true);
    setPreviewPath(normalized);
    updateItemByPath(normalized, { onApplied: clearSelection });
  }, [normalizedPathParam, updateItemByPath, clearSelection]);

  const requestClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    if (interactionMode !== "content") return;
    if (
      !selectedElement?.studioId ||
      !selectedElement.fieldZuid ||
      !editorItem
    ) {
      return;
    }

    const selectedFieldName = fieldNameByZuid.get(selectedElement.fieldZuid);
    if (!selectedFieldName) return;

    const rawValue = editorItem?.data?.[selectedFieldName];
    const nextValue =
      typeof rawValue === "string"
        ? rawValue
        : rawValue == null
        ? ""
        : String(rawValue);

    if (
      ["markdown", "wysiwyg_basic", "wysiwyg_advanced"].includes(
        selectedElement.fieldType
      )
    ) {
      // Use ref registry to update tinyMCE field
      if (bridgeUpdatedFieldZuidRef.current === selectedElement.fieldZuid) {
        getRefRegistry()?.[selectedFieldName]?.handle?.setValue?.(nextValue);
        bridgeUpdatedFieldZuidRef.current = null;
        return;
      }

      postCommandToBridge({
        action: "setHtmlByField",
        fieldZuid: selectedElement.fieldZuid,
        itemZuid: selectedElement.itemZuid,
        html: nextValue,
      });
      return;
    }

    if (
      selectedElement.fieldType &&
      ["text", "textarea"].includes(selectedElement.fieldType)
    ) {
      // A text field can hold markup, and WebEngine renders it as markup — so
      // the server already painted a real element here. Seeding it as text
      // would replace that element with its own escaped tags, which is both
      // wrong on the canvas and a visible regression from the pristine render.
      // Sniff the value, matching what postSlotPreview does for layout slots.
      // The bridge records which way it painted and echoes inline edits back
      // the same way, so the round trip keeps the markup either way.
      if (looksLikeHtml(nextValue)) {
        postCommandToBridge({
          action: "setHtmlByField",
          fieldZuid: selectedElement.fieldZuid,
          itemZuid: selectedElement.itemZuid,
          html: nextValue,
        });
        return;
      }

      postCommandToBridge({
        action: "setTextByField",
        fieldZuid: selectedElement.fieldZuid,
        itemZuid: selectedElement.itemZuid,
        value: nextValue,
      });
    }
  }, [
    editorItem,
    fieldNameByZuid,
    interactionMode,
    postCommandToBridge,
    selectedElement,
  ]);

  const handleSave = useCallback(async () => {
    if (!selectedItemZUID) return;
    setSaveClicked(true);
    setStudioSaving(true);

    try {
      const res = (await dispatch(
        saveItem({
          itemZUID: selectedItemZUID,
          skipContentItemValidation: false,
        })
      )) as any;

      // Any 2xx is a successful save (saveItem resolves 201 on version create).
      if (res?.status >= 200 && res?.status < 300) {
        dispatch(
          notify({
            kind: "success",
            message: `Item Saved: ${selectedItemLabel}`,
          })
        );

        await Promise.all([
          dispatch(fetchAuditTrailDrafting(selectedItemZUID)),
          dispatch(fetchAllModelPublishings({ modelZUID: selectedModelZUID })),
        ]);
        refreshPreviewFrame();
      } else {
        applyItemSaveErrors(res, selectedItemLabel);
      }

      return res;
    } catch (err) {
      dispatch(
        notify({
          kind: "error",
          message: `Cannot Save: ${selectedItemLabel}`,
        })
      );
      throw err;
    } finally {
      setStudioSaving(false);
    }
  }, [
    applyItemSaveErrors,
    dispatch,
    selectedItemLabel,
    selectedItemZUID,
    selectedModelZUID,
    refreshPreviewFrame,
  ]);

  // Same warm-cache caveat as the page item above: revalidate the newly
  // selected item instead of trusting whatever is already in `state.content`.
  // Keyed on the model/item pair so re-selecting the same element — or the
  // fetch's own write to the store — doesn't refetch.
  const selectedItemZuid = selectedElement?.itemZuid;
  const selectedItemModelZuid = selectedElement?.modelZuid;
  useEffect(() => {
    if (!selectedItemZuid || !selectedItemModelZuid) return;
    const hasWarmCopy = Boolean(
      getContentItems()[selectedItemZuid]?.meta?.ZUID
    );
    if (!hasWarmCopy) setIsFetchingItem(true);
    Promise.resolve(
      dispatch(fetchItem(selectedItemModelZuid, selectedItemZuid))
    ).finally(() => setIsFetchingItem(false));
  }, [dispatch, getContentItems, selectedItemModelZuid, selectedItemZuid]);

  useEffect(() => {
    if (
      selectedElement?.modelZuid &&
      selectedElement.modelZuid !== pageModelZUID &&
      !modelsState[selectedElement.modelZuid]
    ) {
      setIsFetchingModel(true);
      Promise.resolve(dispatch(fetchModel(selectedElement.modelZuid))).finally(
        () => setIsFetchingModel(false)
      );
    }
  }, [dispatch, pageModelZUID, modelsState, selectedElement]);

  // Alias only — the hooks below take this under a bridge-specific prop name.
  // It used to close over `fieldNameByZuid` to resolve the filtered field name
  // eagerly; that lookup now lives in a memo (see filteredFieldName), which also
  // stops every consumer of this callback from re-running when fields load.
  const applyBridgeSelection = applySelection;

  const handleBridgeFieldInput = useCallback((fieldZuid: string) => {
    bridgeUpdatedFieldZuidRef.current = fieldZuid;
  }, []);

  const {
    hasTree: hasLayersTree,
    flatRows: layersFlatRows,
    selectedNodeId: selectedLayersNodeId,
    handleLayersTree,
    resetTree: resetLayersTree,
    toggleNode: toggleLayersNode,
    handleNodeSelect: handleLayersNodeSelect,
    openInspectorForLayoutElement,
    canDrop: canDropLayersNode,
    handleNodeDrop: handleLayersNodeDrop,
  } = useStudioLayersTree({
    interactionMode,
    postCommandToBridge,
    applyBridgeSelection,
    applyLayoutSelection,
    applyInspectorSelection,
    refreshInspectorSlots,
    codeFileNameById,
    fieldsState,
    connectedBySlot,
    selectedElement,
    selectedLayout,
    inspectorSelection,
    dndDisabled: isSavingLayout || isRefreshing,
  });

  // The tree describes the current document — drop it whenever the iframe
  // starts reloading or navigating; the fresh page re-emits it on load.
  useEffect(() => {
    if (isRefreshing || isNavigating) {
      resetLayersTree();
    }
  }, [isNavigating, isRefreshing, resetLayersTree]);

  // Canvas layout selection (bridge mousedown/dblclick) selects the element
  // AND opens its Inspector panel, mirroring a click on its layers-tree row.
  const handleBridgeLayoutSelection = useCallback(
    (next: {
      codeId?: string;
      layoutId?: string;
      breadcrumb?: LayoutBreadcrumbItem[];
    }) => {
      applyLayoutSelection(next);
      if (next.codeId && next.layoutId) {
        openInspectorForLayoutElement(next.codeId, next.layoutId);
      }
    },
    [applyLayoutSelection, openInspectorForLayoutElement]
  );

  // The bridge resolved a bound leaf on the canvas. Open the Inspector for that
  // element FIRST, then select the field.
  //
  // Order is the whole point. `applySelection` keeps an open Inspector only
  // when its slots carry the field being edited, and clears it otherwise —
  // so selecting straight from the canvas closes the Inspector and takes
  // "Back to Element" with it. `openInspectorForLayoutElement` resolves the
  // element to its lone bound text child, whose slots DO carry the fieldZuid,
  // which is exactly why the layers-row route keeps the button and this one
  // did not.
  const handleDynamicEditRequest = useCallback(
    (msg: {
      codeId?: string;
      layoutId?: string;
      studioId?: string;
      fieldZuid: string;
      fieldType?: string;
      itemZuid?: string;
      modelZuid?: string;
    }) => {
      if (msg.codeId && msg.layoutId) {
        openInspectorForLayoutElement(msg.codeId, msg.layoutId);
      }
      applyBridgeSelection({
        studioId: msg.studioId,
        fieldZuid: msg.fieldZuid,
        fieldType: msg.fieldType,
        itemZuid: msg.itemZuid,
        modelZuid: msg.modelZuid,
      });
    },
    [applyBridgeSelection, openInspectorForLayoutElement]
  );

  const { handlePreviewLoad } = useStudioBridge({
    dispatch,
    interactionMode,
    syncBridgeInteractionMode,
    postCommandToBridge,
    handleTemplateSourceMap,
    handleReorderOutput,
    handleLayoutContentUpdate,
    handleLayersTree,
    applyLayoutSelection: handleBridgeLayoutSelection,
    clearLayoutSelection,
    applySelection: applyBridgeSelection,
    onDynamicEditRequest: handleDynamicEditRequest,
    canEditLayout,
    fieldNameByZuid,
    currentHoverStudioIdRef,
    clearSelection,
    previewReloadContinuationRef,
    setIsNavigating,
    onBridgeFieldInput: handleBridgeFieldInput,
    onStaticEditImage: setImageEditState,
  });

  const handlePreviewFrameLoad = useCallback(() => {
    // The refreshed page has painted — drop the overlay, then run the
    // existing bridge load handler.
    setIsRefreshing(false);
    handlePreviewLoad();
  }, [handlePreviewLoad]);

  // Content mode: a dynamic slot (a bound attribute or bound text) was clicked
  // — open the existing single-field content editor for its field.
  const handleEditDynamicSlot = useCallback(
    (slot: ElementSlot) => {
      if (!slot.fieldZuid) return;
      applyBridgeSelection({
        studioId: slot.studioId,
        fieldZuid: slot.fieldZuid,
        fieldType: slot.fieldType,
        itemZuid: slot.itemZuid,
        modelZuid: slot.modelZuid,
      });
    },
    [applyBridgeSelection]
  );

  // Layout mode: a slot was edited free-text. Live-update the preview on every
  // keystroke (cheap postMessage) but debounce the template-source patch
  // (DOMParse + restage) so we don't reparse on each character. Attributes
  // write via setAttribute; text writes the element's inner text.
  const slotPatchTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );
  // Clear any pending debounced slot patches when the studio unmounts so a
  // timer never fires into a stale closure.
  useEffect(
    () => () => {
      Object.values(slotPatchTimers.current).forEach(clearTimeout);
    },
    []
  );
  // On connect, the panel emits a Parsley ref. For the LIVE preview we show the
  // field's RESOLVED value (its actual text, or a resolved image URL) instead of
  // the raw expression, while the template still saves the Parsley — so a
  // connection is visible without a save + reload. Returns the resolved display
  // value, or null when `value` is a plain edit (not a field ref) or the field
  // has no data to show. A `this.` ref resolves against the page item; a
  // `<model>.filter(<zuid>)` ref resolves against that pinned item, which
  // searchItems already merged into the content store when the user picked it.
  // Returns:
  //   null — `value` is not a field reference at all (a plain free-text edit).
  //          The caller sends no previewValue; the DOM shows what was typed.
  //   ""   — it IS a reference that resolves to nothing, because the field is
  //          empty on that item. Common across locales: a field set on en-US is
  //          frequently null on its es/cs-CZ siblings.
  //
  // The empty case MUST still be sent. When previewValue is absent the bridge
  // falls back to printing `value`, which would paint the literal
  // "{{model.filter(zuid).field}}" onto the canvas — the binding looking broken
  // when it is merely empty.
  //
  // This deliberately covers `this.` refs too, not just cross-item ones. An
  // empty local media field previously left the raw Parsley as the src, and
  // `src="{{this.logo}}"` is strictly worse than `src=""`: the browser resolves
  // it against the base URL and fires a real request (measured: a GET for
  // /%7B%7Bthis.logo%7D%7D → 404), whereas an empty src fires none. Scoping the
  // "" return to `ref.source` would reintroduce exactly that.
  const resolvePreviewValue = useCallback(
    (value: string): string | null => {
      const ref = parseParsleyRef(value);
      if (!ref) return null;
      const item = ref.source
        ? getContentItems()[ref.source.itemZUID]
        : pageItem;
      const raw = (item?.data as Record<string, any>)?.[ref.name];
      if (raw === undefined || raw === null || raw === "") return "";
      if (ref.isMedia) {
        // Image field → the URL getImage() resolves to, via the media resolver.
        return `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${raw}/getimage`;
      }
      return String(raw);
    },
    [getContentItems, pageItem]
  );

  // Parsley names a model by its reference name; fetchItem needs its ZUID.
  // Derived from the models already in the store rather than its own query —
  // Studio's boot already fetches content/models, and a second request for the
  // same data would just race it.
  const modelZUIDByName = useMemo(
    () =>
      Object.values(modelsState ?? {})
        .filter((model: any) => model?.name && model?.ZUID)
        .sort((a: any, b: any) => a.ZUID.localeCompare(b.ZUID))
        .reduce<Record<string, string>>((acc, model: any) => {
          // First by ZUID wins when two models share a `name` — see
          // useCrossModelConnectField for why that ambiguity is tolerable.
          if (!(model.name in acc)) acc[model.name] = model.ZUID;
          return acc;
        }, {}),
    [modelsState]
  );

  // Latest value written to each slot, keyed `codeId::layoutId::slotKey`. Only
  // the async preview replay reads it, to detect that its write is stale.
  const latestSlotWriteRef = useRef<Record<string, string>>({});

  // The live-preview half of a slot write, split out so it can be replayed once
  // a referenced item's data arrives. Never touches the template — the staged
  // template value is written exactly once, by handleSlotChange below.
  const postSlotPreview = useCallback(
    (
      slot: ElementSlot,
      patch: NonNullable<typeof inspectorSelection>["layoutPatch"],
      value: string,
      previewValue?: string
    ) => {
      if (!patch) return;
      if (slot.kind === "text") {
        postCommandToBridge({
          action: "updateElementText",
          codeId: patch.codeId,
          layoutId: patch.layoutId,
          value,
          previewValue,
          // A wysiwyg/markdown field resolves to markup. Written as text it
          // would show its own tags as characters, so tell the bridge to parse
          // it. Detected from the VALUE rather than the datatype on purpose: for
          // a cross-item ref we don't hold the other model's field types here,
          // and a rich-text field whose content happens to be plain needs no
          // HTML treatment anyway.
          previewAsHtml: previewValue ? looksLikeHtml(previewValue) : undefined,
          textIndex: slot.textIndex,
        });
        return;
      }
      // Attribute values are never markup — no previewAsHtml here.
      postCommandToBridge({
        action: "updateElementAttr",
        layoutId: patch.layoutId,
        isSelf: patch.isSelf,
        tagName: patch.tagName,
        elementIndex: patch.elementIndex,
        attr: slot.attr || slot.key,
        // Show the resolved value in the live DOM; the template stages `value`.
        value: previewValue ?? value,
        booleanAttr: slot.booleanAttr,
      });
    },
    [postCommandToBridge]
  );

  const handleSlotChange = useCallback(
    (slot: ElementSlot, value: string, connected?: ConnectField) => {
      const patch = inspectorSelection?.layoutPatch;
      if (!patch || !patch.codeId) return;
      // Never write a slot we've declared non-editable. The inputs are already
      // disabled in that case, so this is a guard on the invariant rather than
      // a reachable path — it keeps "layoutEditable" the single source of truth
      // for whether the template may be rewritten.
      if (!slot.layoutEditable) return;

      // On connect this is the RESOLVED value to preview in the live DOM; on a
      // plain edit it's undefined (the value IS what's shown). Either way the
      // template saves `value`.
      const previewValue = resolvePreviewValue(value) ?? undefined;

      const leafKey = `${patch.codeId}::${patch.layoutId}`;
      // Records the most recent value written to each slot so the async preview
      // replay below can tell whether it has been superseded.
      const writeKey = `${leafKey}::${slot.key}`;
      latestSlotWriteRef.current[writeKey] = value;

      setConnectedBySlot((prev) => {
        if (connected) return { ...prev, [writeKey]: connected };
        // A plain edit replaces whatever was bound in THIS slot only.
        if (!prev[writeKey]) return prev;
        const next = { ...prev };
        delete next[writeKey];
        return next;
      });

      postSlotPreview(slot, patch, value, previewValue);

      // A cross-item connect can only preview once we hold the referenced
      // item's data. searchItems normally merged it when the user picked the
      // item, but a binding that predates this session hasn't been through that
      // — fetch it and replay the PREVIEW only. The template write below already
      // staged the raw Parsley and must not run twice.
      //
      // Keyed on whether the ITEM is loaded, not on previewValue: "" is now a
      // legitimate resolved result (an empty field), so it must not be mistaken
      // for "we couldn't resolve this yet".
      const ref = parseParsleyRef(value);
      const refItemZUID = ref?.source?.itemZUID;
      if (refItemZUID && !getContentItems()[refItemZUID]?.data) {
        const refModelZUID = modelZUIDByName[ref!.source!.modelName];
        if (refModelZUID) {
          Promise.resolve(dispatch(fetchItem(refModelZUID, refItemZUID))).then(
            () => {
              // The replay closes over `value`, so it must not fire if the user
              // has since changed this slot — disconnecting and typing a
              // replacement inside the fetch window would otherwise repaint the
              // OLD binding's resolved value over the new text. Last write wins.
              if (latestSlotWriteRef.current[writeKey] !== value) return;
              const replay = resolvePreviewValue(value);
              if (replay !== null) postSlotPreview(slot, patch, value, replay);
            }
          );
        }
      }

      if (slot.kind === "text") {
        // An ADDRESSED run writes itself back: the bridge edits that one run and
        // echoes the leaf's innerHTML as LAYOUT_CONTENT_UPDATE, which the host
        // already knows how to fold into the source — preserving nested layout
        // subtrees. Patching here as well would overwrite the leaf's whole text
        // and take any nested <span> with it.
        if (slot.textIndex !== undefined) return;

        // A dynamic leaf has no nested markup, so the whole-content write is safe.
        clearTimeout(slotPatchTimers.current[slot.key]);
        slotPatchTimers.current[slot.key] = setTimeout(() => {
          handleLayoutTextUpdate(patch.codeId!, patch.layoutId, value);
        }, 300);
        return;
      }

      const attr = slot.attr || slot.key;
      clearTimeout(slotPatchTimers.current[slot.key]);
      slotPatchTimers.current[slot.key] = setTimeout(() => {
        handleLayoutElementAttrUpdate(
          patch.codeId!,
          patch.layoutId,
          patch.isSelf,
          patch.tagName,
          patch.elementIndex,
          attr,
          value,
          slot.booleanAttr
        );
      }, 300);
    },
    [
      dispatch,
      getContentItems,
      handleLayoutElementAttrUpdate,
      handleLayoutTextUpdate,
      modelZUIDByName,
      postSlotPreview,
      resolvePreviewValue,
      inspectorSelection,
    ]
  );

  // Layout mode: change the element's tag (e.g. h1 → h2, img → video). Only
  // valid when the element carries its own data-layout-id (isSelf), since the
  // swap is addressed by layout id. Applied immediately — it's a discrete
  // select change, not per-keystroke.
  const handleTagChange = useCallback(
    (newTag: string) => {
      const patch = inspectorSelection?.layoutPatch;
      if (!patch || !patch.codeId || !patch.isSelf) return;
      postCommandToBridge({
        action: "updateElementTag",
        layoutId: patch.layoutId,
        newTag,
      });
      handleLayoutTagUpdate(patch.codeId, patch.layoutId, newTag);
    },
    [handleLayoutTagUpdate, postCommandToBridge, inspectorSelection]
  );

  // Layout mode: connect a content item to a text slot. A text slot's value is
  // just the raw template content, so "connecting" means writing a Parsley
  // expression (e.g. "{{this.title}}") in place of the static text — which the
  // existing text write-path already persists. The content-item picker itself
  // isn't built yet; this is the entry point it will hang off.
  // Fields of the item being edited, offered in a text slot's "Connect Item"
  // dropdown. `this` in a Parsley expression resolves to the item rendering the
  // template region, which for the main page is the page item — so its model's
  // fields are what `{{this.<name>}}` can reference.
  const pageFields = useMemo(() => {
    if (!pageModelZUID) return [];
    return Object.values(fieldsState)
      .filter((field: any) => field?.contentModelZUID === pageModelZUID)
      .sort((a: any, b: any) => (a?.sort ?? 0) - (b?.sort ?? 0));
  }, [fieldsState, pageModelZUID]);

  const toConnectField = (field: any): ConnectField => ({
    name: field.name,
    label: field.label || field.name,
    datatype: field.datatype,
  });

  // Fields offered in a TEXT slot's "Connect Item" dropdown.
  const connectFields = useMemo<ConnectField[]>(
    () =>
      pageFields
        .filter((field: any) => isTextReferenceableDatatype(field?.datatype))
        .map(toConnectField),
    [pageFields]
  );

  // Fields offered in a MEDIA slot's (img/video src, poster) dropdown — media
  // assets and external-URL fields.
  const mediaFields = useMemo<ConnectField[]>(
    () =>
      pageFields
        .filter((field: any) => isMediaSlotDatatype(field?.datatype))
        .map(toConnectField),
    [pageFields]
  );

  // Layout mode: open the media picker for a media-URL slot (src or poster).
  // Reuses the img media-picker dialog; the tag-agnostic patch maps onto its
  // isLeafImg / imgIndex addressing, and `attr` records which attribute to set.
  const handleBrowseMedia = useCallback(
    (slot: ElementSlot) => {
      const patch = inspectorSelection?.layoutPatch;
      if (!patch || !patch.codeId) return;
      setImageEditState({
        codeId: patch.codeId,
        layoutId: patch.layoutId,
        isLeafImg: patch.isSelf,
        imgIndex: patch.elementIndex,
        currentSrc: slot.value,
        fromInspector: true,
        attr: slot.attr || "src",
        tagName: patch.tagName,
      });
    },
    [inspectorSelection]
  );

  const renderInfoPanel = () => {
    if (!isResolved) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight={120}
        >
          <CircularProgress size={24} />
        </Box>
      );
    }

    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Alert severity="info" variant="standard">
          {interactionMode === "layout"
            ? "Drag blocks on the canvas to reorder the layout"
            : interactionMode === "full"
            ? "Select items on the canvas to edit them, or drag blocks to reorder the layout"
            : "Select items on the canvas to make edits"}
        </Alert>
        <ContentInfo
          itemZUID={pageItemZUID}
          modelZUID={pageModelZUID}
          isLoadingItem={isFetchingItem || isFetchingModel}
        />
      </Box>
    );
  };

  const renderEditorPanel = () => (
    <Box display="flex" flexDirection="column" gap={2}>
      {selectedItemZUID === pageItemZUID && saveClicked && hasErrors && (
        <FieldError
          ref={fieldErrorRef}
          errors={fieldErrors}
          fields={activeFields}
        />
      )}
      <Editor
        // @ts-ignore
        active={selectedElement?.fieldZuid || undefined}
        item={editorItem}
        model={editorModel}
        onSave={handleSave}
        itemZUID={selectedItemZUID}
        modelZUID={selectedModelZUID}
        onUpdateFieldErrors={onUpdateFieldErrors}
        fieldErrors={fieldErrors}
        isLoadingItem={isSelectedItemLoading}
        visibleFieldName={filteredFieldName || undefined}
      />
      {inspectorSelection ? (
        <Button
          data-cy="StudioBackToInspector"
          variant="outlined"
          size="large"
          fullWidth
          onClick={returnToInspector}
        >
          Back to Element
        </Button>
      ) : filteredFieldName ? (
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={clearHighlightOnly}
        >
          View All Related Fields
        </Button>
      ) : null}
    </Box>
  );

  const isResolved = !!pageItemZUID && !!pageModelZUID;

  return (
    <>
      <Modal
        open
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
        disablePortal
      >
        <Paper
          role="dialog"
          aria-modal="true"
          aria-label="Studio editor"
          variant="outlined"
          square
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            bgcolor: "grey.900",
            overflow: "hidden",
          }}
        >
          <StudioHeader
            onLanguageChange={handleLanguageChange}
            interactionMode={interactionMode}
            onInteractionModeChange={handleInteractionModeChange}
            availableModes={availableModes}
            canSelectMode={canSelectMode}
            selectedLayoutBreadcrumb={selectedLayout?.breadcrumb || []}
            onLayoutBreadcrumbClick={handleLayoutBreadcrumbSelect}
            pageModelZUID={pageModelZUID}
            pageItemZUID={pageItemZUID}
            unresolvedPath={unresolvedPath}
            logoSrc={contentOneLogoOnly}
          />
          <Box display="flex" flex="1" minHeight={0} width="100%">
            <ResizableContainer
              id="studioLayersPanel"
              defaultWidth={220}
              minWidth={220}
              maxWidth={400}
              collapsible={false}
            >
              <StudioLayersPanel
                hasTree={hasLayersTree}
                flatRows={layersFlatRows}
                selectedNodeId={selectedLayersNodeId}
                onToggle={toggleLayersNode}
                onSelect={handleLayersNodeSelect}
                canDrop={canDropLayersNode}
                onDrop={handleLayersNodeDrop}
              />
            </ResizableContainer>
            <StudioPreview
              iframeRef={iframeRef}
              iframeSrc={iframeSrc}
              isNavigating={isNavigating}
              isBusy={isRefreshing || studioSaving || isSavingLayout}
              onLoad={handlePreviewFrameLoad}
              overlaySlot={
                usesLayoutGrammar(interactionMode) && showFreestyleAlert ? (
                  <StudioFreestyleAlert
                    showEditAction
                    onEditInFreestyle={handleEditInFreestyle}
                    onDismiss={dismissFreestyleAlert}
                  />
                ) : null
              }
            />
            {panelMode === "inspector" && inspectorSelection ? (
              <StudioInspectorPanel
                canEditLayout={usesLayoutGrammar(interactionMode)}
                canEditContent={interactionMode !== "layout"}
                elementKey={inspectorSelection.nodeId}
                tagName={inspectorSelection.tagName}
                slots={inspectorSelection.slots}
                canChangeTag={
                  usesLayoutGrammar(interactionMode) &&
                  !!inspectorSelection.layoutPatch?.isSelf
                }
                onChangeTag={handleTagChange}
                onClose={requestClearSelection}
                onEditDynamicSlot={handleEditDynamicSlot}
                onChangeSlot={handleSlotChange}
                onBrowseMedia={handleBrowseMedia}
                connectFields={connectFields}
                mediaFields={mediaFields}
                drawerWidth={drawerWidth}
                logoSrc={contentOneLogo}
              />
            ) : interactionMode === "content" ||
              (interactionMode === "full" && panelMode === "edit") ? (
              // Studio renders the content editor when a field is being
              // edited, but otherwise shows nothing — matching layout, which
              // has no right panel at all. Falling through to `panelMode`'s
              // "info" default here would put an info panel where layout mode
              // deliberately shows empty canvas.
              <StudioSidePanel
                headerTitle={headerTitle}
                selectedItemLabel={selectedItemLabel}
                pageItemVersion={pageItemVersion}
                unresolvedPath={unresolvedPath}
                panelMode={panelMode === "edit" ? "edit" : "info"}
                clearSelection={requestClearSelection}
                activeVersion={activeVersion}
                selectedModelZUID={selectedModelZUID}
                selectedItemZUID={selectedItemZUID}
                isSaving={isSaving}
                hasErrors={hasErrors}
                isSelectedItemLoading={isSelectedItemLoading}
                onEditInManager={handleEditInManager}
                isFreestyleLayout={isFreestyleLayout}
                onEditInFreestyle={handleEditInFreestyle}
                onSave={handleSave}
                editorPanel={renderEditorPanel()}
                infoPanel={renderInfoPanel()}
                drawerWidth={drawerWidth}
                logoSrc={contentOneLogo}
                alertSlot={
                  showFreestyleAlert ? (
                    <StudioFreestyleAlert
                      onEditInFreestyle={handleEditInFreestyle}
                      onDismiss={dismissFreestyleAlert}
                    />
                  ) : null
                }
              />
            ) : null}
          </Box>
          {showSaveBar && !showSaveChangesModal ? (
            <Box
              data-cy={`${saveBarHookPrefix}SaveBar`}
              position="absolute"
              left="50%"
              bottom={24}
              sx={{
                transform: "translateX(-50%)",
                zIndex: (theme) => theme.zIndex.modal + 1,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                p={2}
                borderRadius={1.5}
                bgcolor="background.paper"
                boxShadow={6}
              >
                <Button
                  data-cy={`${saveBarHookPrefix}CancelButton`}
                  color="inherit"
                  onClick={handleSaveBarCancel}
                  disabled={saveBarIsSaving}
                >
                  Cancel
                </Button>
                <Button
                  data-cy={`${saveBarHookPrefix}SaveChangesButton`}
                  variant="contained"
                  color="primary"
                  startIcon={<SaveRoundedIcon fontSize="small" />}
                  sx={{ whiteSpace: "nowrap" }}
                  onClick={() => setShowSaveChangesModal(true)}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          ) : null}
          <StudioSaveChangesModal
            open={showSaveChangesModal && showSaveBar}
            changes={saveChanges}
            isSaving={saveBarIsSaving}
            canSave={saveBarCanSave}
            canPublish={saveBarCanPublish}
            onCancel={() => setShowSaveChangesModal(false)}
            onSaveAll={handleModalSaveAll}
            onSaveAndPublishAll={handleModalSaveAndPublishAll}
          />
          <PendingEditsModal
            show={hasPendingContentChanges}
            loading={studioSaving}
            onSave={async () => {
              // Throw on partial failure so PendingEditsModal runs answer(false)
              // and keeps the user in content mode to fix the failed items
              // instead of navigating away and abandoning the dirty edits.
              const result = await saveAllContent();
              if (result.failedCount > 0) {
                throw new Error(`${result.failedCount} item(s) failed to save`);
              }
            }}
            onDiscard={discardAllContent}
          />
          <DirtyCodeModal
            title="Unsaved layout changes"
            content="You have unsaved layout changes. Save them before continuing?"
            open={showPendingLayoutModal}
            loading={isSavingLayout}
            saveDisabled={!canUpdatePendingLayout}
            onCancel={() => {
              setShowPendingLayoutModal(false);
              pendingLayoutContinuationRef.current = null;
            }}
            onSave={async () => {
              if (!canUpdatePendingLayout) return;
              const onProceed = pendingLayoutContinuationRef.current;
              setShowPendingLayoutModal(false);
              pendingLayoutContinuationRef.current = null;
              await handleSavePendingLayout(onProceed);
            }}
            onDiscard={async () => {
              const onProceed = pendingLayoutContinuationRef.current;
              setShowPendingLayoutModal(false);
              pendingLayoutContinuationRef.current = null;
              handleDiscardPendingLayoutSave(onProceed);
            }}
          />
        </Paper>
      </Modal>
      {imageEditState && (
        <MemoryRouter>
          <Dialog
            open
            fullScreen
            sx={{ my: 2.5, mx: 10 }}
            slotProps={{
              paper: { style: { borderRadius: "4px", overflow: "hidden" } },
            }}
            onClose={() => setImageEditState(null)}
          >
            <MediaApp
              limitSelected={1}
              isSelectDialog
              showHeaderActions={false}
              addImagesCallback={(images: any[]) => {
                if (!images.length) return;
                const newSrc = images[0].url;
                if (imageEditState.fromInspector) {
                  // Attributes-panel Browse: write the chosen URL to the
                  // recorded attribute (src or poster) via the generic path.
                  const attr = imageEditState.attr || "src";
                  handleLayoutElementAttrUpdate(
                    imageEditState.codeId,
                    imageEditState.layoutId,
                    imageEditState.isLeafImg,
                    imageEditState.tagName || "img",
                    imageEditState.imgIndex,
                    attr,
                    newSrc
                  );
                  postCommandToBridge({
                    action: "updateElementAttr",
                    layoutId: imageEditState.layoutId,
                    isSelf: imageEditState.isLeafImg,
                    tagName: imageEditState.tagName || "img",
                    elementIndex: imageEditState.imgIndex,
                    attr,
                    value: newSrc,
                  });
                  updateInspectorSlotValue(attr, newSrc);
                } else {
                  // Canvas image-replace flow: img-specific src update.
                  handleLayoutImageSrcUpdate(
                    imageEditState.codeId,
                    imageEditState.layoutId,
                    imageEditState.isLeafImg,
                    imageEditState.imgIndex,
                    newSrc
                  );
                  postCommandToBridge({
                    action: "updateImageSrc",
                    layoutId: imageEditState.layoutId,
                    isLeafImg: imageEditState.isLeafImg,
                    imgIndex: imageEditState.imgIndex,
                    newSrc,
                  });
                }
                setImageEditState(null);
              }}
            />
          </Dialog>
        </MemoryRouter>
      )}
    </>
  );
};
