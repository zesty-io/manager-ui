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
import { useDispatch, useSelector } from "react-redux";
import { MemoryRouter, useHistory, useLocation } from "react-router";
import { cloneDeep } from "lodash";
import { AppState } from "../../../../../../shell/store/types";
import {
  fetchAllModelPublishings,
  fetchItem,
  saveItem,
} from "../../../../../../shell/store/content";
import { fetchModel } from "../../../../../../shell/store/models";
import { fetchAuditTrailDrafting } from "../../../../../../shell/store/logs";
import { notify } from "../../../../../../shell/store/notifications";
import { fetchFields } from "../../../../../../shell/store/fields";
import { ContentInfo } from "./Content/Actions/Widgets/ContentInfo";
import Editor from "../../components/Editor/Editor";
import { FieldError } from "../../components/Editor/FieldError";
import { PendingEditsModal } from "../../components/PendingEditsModal";
import { DirtyCodeModal } from "../../../../../../shell/components/DirtyCodeModal";
import { ResizableContainer } from "../../../../../../shell/components/ResizeableContainer";
import contentOneLogoOnly from "../../../../../../../public/images/contentOneLogoOnly.webp";
import contentOneLogo from "../../../../../../../public/images/contentOneLogo.webp";
import {
  findItemByPath,
  normalizePath,
  resolveItemByPath,
} from "../../../../../studio/utils/pathResolver";
import {
  useGetWebViewsQuery,
  usePublishWebViewMutation,
  useUpdateWebViewMutation,
} from "../../../../../../shell/services/instance";
import { StudioHeader } from "./components/StudioWrapper/StudioHeader";
import { StudioFeedbackModal } from "./components/StudioWrapper/StudioFeedbackModal";
import { StudioPreview } from "./components/StudioWrapper/StudioPreview";
import { StudioSidePanel } from "./components/StudioWrapper/StudioSidePanel";
import { StudioInspectorPanel } from "./components/StudioWrapper/StudioInspectorPanel";
import {
  isMediaSlotDatatype,
  isTextReferenceableDatatype,
} from "./components/StudioWrapper/studioFieldMeta";
import { StudioLayersPanel } from "./components/StudioWrapper/StudioLayersPanel";
import {
  StudioSaveChange,
  StudioSaveChangesModal,
} from "./components/StudioWrapper/StudioSaveChangesModal";
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
} from "./hooks/studioTypes";
import { useStudioSelection } from "./hooks/useStudioSelection";
import { useStudioLayersTree } from "./hooks/useStudioLayersTree";
import { getRefRegistry } from "../../../../../../engine/refRegistry";
import { useMultiPermission } from "../../../../../../shell/hooks/use-permissions";
import { MediaApp } from "../../../../../media/src/app";

const drawerWidth = 440;

// Duration the dark refresh overlay takes to fade in/out. Kept in sync with
// the `transition` on the overlay in StudioPreview.
const REFRESH_FADE_MS = 200;

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

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const currentHoverStudioIdRef = useRef<string | null>(null);
  const [showPendingLayoutModal, setShowPendingLayoutModal] = useState(false);
  const [showSaveChangesModal, setShowSaveChangesModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("content");
  const [studioSaving, setStudioSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});
  const [saveClicked, setSaveClicked] = useState(false);
  const fieldErrorRef = useRef<any>(null);
  const pendingLayoutContinuationRef = useRef<null | (() => void)>(null);
  const previewReloadContinuationRef = useRef<null | (() => void)>(null);
  const bridgeUpdatedFieldZuidRef = useRef<string | null>(null);
  const [isFetchingItem, setIsFetchingItem] = useState(false);
  const [isFetchingModel, setIsFetchingModel] = useState(false);
  const [isFetchingFields, setIsFetchingFields] = useState(false);
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
  const userEmail = useSelector((state: AppState) => state.user.email);
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
    filteredFieldName,
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
      // @ts-expect-error Config is provided globally at runtime
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

  useEffect(() => {
    if (!pageModelZUID || !pageItemZUID) return;
    const currentItemInStore = contentItems[pageItemZUID]?.meta?.ZUID;
    if (!currentItemInStore) {
      setIsFetchingItem(true);
      Promise.resolve(dispatch(fetchItem(pageModelZUID, pageItemZUID))).finally(
        () => setIsFetchingItem(false)
      );
    } else {
      setIsFetchingItem(false);
    }
  }, [dispatch, pageItem, pageItemZUID, pageModelZUID]);

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

  // The floating save bar is shared between modes ("gated by mode"): in layout
  // mode it commits staged layout changes, in content mode it commits the
  // staged multi-item content edits. Only the active mode's pending changes are
  // ever surfaced because switching modes prompts to save/discard first.
  const isLayoutMode = interactionMode === "layout";
  const showSaveBar = isLayoutMode
    ? hasPendingLayoutChanges
    : hasPendingContentChanges;
  const saveBarIsSaving = isLayoutMode ? isSavingLayout : studioSaving;
  const saveBarCanSave = isLayoutMode
    ? canUpdatePendingLayout
    : canUpdatePendingContent;
  const saveBarCanPublish = isLayoutMode
    ? canPublishPendingLayout
    : canPublishPendingContent;
  const handleSaveBarCancel = isLayoutMode
    ? () => handleDiscardPendingLayoutSave()
    : () => {
        void discardAllContent();
      };
  // The "Save Changes" bar button opens the modal; the modal's Save All /
  // Save & Publish All buttons run the active mode's batch handlers and close.
  // Close the modal on full success; keep it open on partial failure so the
  // user sees which items remain (still listed + toasted) and can retry.
  const closeModalUnlessFailed = (result: { failedCount?: number } | void) => {
    if (!result || !result.failedCount) setShowSaveChangesModal(false);
  };
  const handleModalSaveAll = () => {
    if (!saveBarCanSave) return;
    Promise.resolve(
      isLayoutMode ? handleSavePendingLayout() : saveAllContent()
    ).then(closeModalUnlessFailed, () => {});
  };
  const handleModalSaveAndPublishAll = () => {
    if (!saveBarCanPublish) return;
    Promise.resolve(
      isLayoutMode
        ? handleSaveAndPublishPendingLayout()
        : saveAndPublishAllContent()
    ).then(closeModalUnlessFailed, () => {});
  };

  // Rows shown in the Save Changes modal — scoped to the active mode: content
  // mode lists the staged content/block items, layout mode lists changed code
  // files. (Per product: staging is gated by mode, never mixed.)
  const saveChanges = useMemo<StudioSaveChange[]>(() => {
    if (isLayoutMode) {
      return pendingLayoutCodeIds.map((codeId) => {
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
      });
    }

    return dirtyContentItems.map((item) => {
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
  }, [
    codeFileNameById,
    contentItems,
    dirtyContentItems,
    isLayoutMode,
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
      postCommandToBridge({
        action: "setInteractionMode",
        mode: nextMode,
      });

      if (nextMode === "layout") {
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

  useEffect(() => {
    const selectedItemZuid = selectedElement?.itemZuid;
    if (!selectedItemZuid) return;

    const resolvedModelZuid = selectedElement?.modelZuid;

    const selectedItemInStore = contentItems[selectedItemZuid]?.meta?.ZUID;

    if (resolvedModelZuid && !selectedItemInStore) {
      setIsFetchingItem(true);
      Promise.resolve(
        dispatch(fetchItem(resolvedModelZuid, selectedItemZuid))
      ).finally(() => setIsFetchingItem(false));
    }

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
  }, [
    contentItems,
    dispatch,
    pageItemZUID,
    pageModelZUID,
    modelsState,
    selectedElement,
  ]);

  const applyBridgeSelection = useCallback(
    (next: {
      studioId?: string;
      fieldZuid: string;
      fieldType?: string;
      itemZuid?: string;
      modelZuid?: string;
    }) => {
      applySelection(next, fieldNameByZuid);
    },
    [applySelection, fieldNameByZuid]
  );

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
  // On connect, the panel emits a `{{this.field}}` Parsley ref. For the LIVE
  // preview we show the field's RESOLVED value (its actual text, or a resolved
  // image URL) instead of the raw expression, while the template still saves the
  // Parsley — so a connection is visible without a save + reload. Returns the
  // resolved display value, or null when `value` is a plain edit (not a field
  // ref) or the field has no data to show. Fields always resolve against the
  // page item, since our flow only ever emits `this.<pageItemField>`.
  const resolvePreviewValue = useCallback(
    (value: string): string | null => {
      const match = value.match(/^\{\{\s*this\.(\w+)(\.getImage\(\))?\s*\}\}$/);
      if (!match) return null;
      const raw = (pageItem?.data as Record<string, any>)?.[match[1]];
      if (raw === undefined || raw === null || raw === "") return null;
      if (match[2]) {
        // Image field → the URL getImage() resolves to, via the media resolver.
        // @ts-expect-error CONFIG is provided globally at runtime
        return `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${raw}/getimage`;
      }
      return String(raw);
    },
    [pageItem]
  );

  const handleSlotChange = useCallback(
    (slot: ElementSlot, value: string) => {
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

      if (slot.kind === "text") {
        postCommandToBridge({
          action: "updateElementText",
          codeId: patch.codeId,
          layoutId: patch.layoutId,
          value,
          previewValue,
          textIndex: slot.textIndex,
        });

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
      postCommandToBridge({
        action: "updateElementAttr",
        layoutId: patch.layoutId,
        isSelf: patch.isSelf,
        tagName: patch.tagName,
        elementIndex: patch.elementIndex,
        attr,
        // Show the resolved value in the live DOM; the template stages `value`.
        value: previewValue ?? value,
        booleanAttr: slot.booleanAttr,
      });
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
      handleLayoutElementAttrUpdate,
      handleLayoutTextUpdate,
      postCommandToBridge,
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
            selectedLayoutBreadcrumb={selectedLayout?.breadcrumb || []}
            onLayoutBreadcrumbClick={handleLayoutBreadcrumbSelect}
            pageModelZUID={pageModelZUID}
            pageItemZUID={pageItemZUID}
            unresolvedPath={unresolvedPath}
            logoSrc={contentOneLogoOnly}
            onFeedbackClick={() => setShowFeedbackModal(true)}
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
            />
            {panelMode === "inspector" && inspectorSelection ? (
              <StudioInspectorPanel
                mode={interactionMode}
                elementKey={inspectorSelection.nodeId}
                tagName={inspectorSelection.tagName}
                slots={inspectorSelection.slots}
                canChangeTag={
                  interactionMode === "layout" &&
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
            ) : interactionMode === "content" ? (
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
                onSave={handleSave}
                editorPanel={renderEditorPanel()}
                infoPanel={renderInfoPanel()}
                drawerWidth={drawerWidth}
                logoSrc={contentOneLogo}
              />
            ) : null}
          </Box>
          {showSaveBar && !showSaveChangesModal ? (
            <Box
              data-cy={
                isLayoutMode ? "StudioLayoutSaveBar" : "StudioContentSaveBar"
              }
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
                  data-cy={
                    isLayoutMode
                      ? "StudioLayoutCancelButton"
                      : "StudioContentCancelButton"
                  }
                  color="inherit"
                  onClick={handleSaveBarCancel}
                  disabled={saveBarIsSaving}
                >
                  Cancel
                </Button>
                <Button
                  data-cy={
                    isLayoutMode
                      ? "StudioLayoutSaveChangesButton"
                      : "StudioContentSaveChangesButton"
                  }
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
      <StudioFeedbackModal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        email={userEmail}
      />
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
