import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Paper,
} from "@mui/material";
import TrapFocus from "@mui/material/Unstable_TrapFocus";
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
import { StudioPreview } from "./components/StudioWrapper/StudioPreview";
import { StudioSidePanel } from "./components/StudioWrapper/StudioSidePanel";
import { useLayoutReorderState } from "./hooks/useLayoutReorderState";
import { useStudioBridge } from "./hooks/useStudioBridge";
import { InteractionMode, LayoutBreadcrumbItem } from "./hooks/studioTypes";
import { useStudioSelection } from "./hooks/useStudioSelection";
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
      isLeafImg?: boolean;
      imgIndex?: number;
      newSrc?: string;
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

  const {
    selectedElement,
    selectedLayout,
    panelMode,
    filteredFieldName,
    setSelectedLayout,
    clearSelection,
    clearLayoutSelection,
    applyLayoutSelection,
    handleLayoutBreadcrumbSelect,
    clearHighlightOnly,
    applySelection,
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

      if (
        selectedItem?.dirty &&
        resolved?.meta?.ZUID &&
        resolved.meta.ZUID !== selectedItemZUID
      ) {
        const openModal = (window as any).openContentNavigationModal;
        if (typeof openModal === "function") {
          openModal((shouldProceed: boolean) => {
            if (shouldProceed) {
              applyResolved();
            }
          });
          return;
        }
      }

      applyResolved();
    },
    [contentItems, dispatch, selectedItem?.dirty, selectedItemZUID]
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
  } = useLayoutReorderState({
    webViews,
    codeFileNameById,
    updateWebView,
    publishWebView,
    dispatch,
    clearLayoutSelection,
    refreshPreviewFrame,
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

      if (nextMode === "layout" && selectedItem?.dirty) {
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
      postCommandToBridge,
      requestProceedWithPendingLayoutSave,
      selectedItem?.dirty,
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

  const discardPendingEdits = useCallback(() => {
    if (!selectedItemZUID || !selectedModelZUID) return Promise.resolve();
    dispatch({
      type: "UNMARK_ITEMS_DIRTY",
      items: [selectedItemZUID],
    });
    return dispatch(fetchItem(selectedModelZUID, selectedItemZUID));
  }, [dispatch, selectedItemZUID, selectedModelZUID]);

  const requestClearSelection = useCallback(() => {
    if (!selectedItem?.dirty) {
      clearSelection();
      return;
    }

    const openModal = (window as any).openContentNavigationModal;
    if (typeof openModal === "function") {
      openModal((shouldProceed: boolean) => {
        if (shouldProceed) {
          clearSelection();
        }
      });
      return;
    }

    clearSelection();
  }, [clearSelection, selectedItem?.dirty]);

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

      if (res?.err === "VALIDATION_ERROR") {
        const errors = cloneDeep(fieldErrors);

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

        setFieldErrors(errors);

        dispatch(
          notify({
            kind: "error",
            message: `Cannot Save: ${selectedItemLabel} - missing or invalid data`,
          })
        );
        return res;
      }

      if (res?.status === 400) {
        if (res.error?.toLowerCase()?.includes("data too long")) {
          const dataLongErrorMatch = res.error?.match(/'([^']*)'/);

          if (dataLongErrorMatch?.[1]) {
            const fieldName = dataLongErrorMatch[1];
            const errors = cloneDeep(fieldErrors);
            const oneToManyFieldNames = activeFields?.reduce(
              (names: string[], currItem: any) => {
                if (currItem?.datatype === "one_to_many") {
                  return [...names, currItem?.name];
                }

                return names;
              },
              []
            );

            errors[fieldName] = {
              ...(errors[fieldName] ?? {}),
              CUSTOM_ERROR: oneToManyFieldNames?.includes(fieldName)
                ? "Cannot save field. Please reduce the total number of items selected."
                : "Cannot save field. Value is too long.",
            };

            setFieldErrors(errors);
          }
        }

        dispatch(
          notify({
            kind: "error",
            message: `Cannot Save: ${selectedItemLabel}${
              res.error ? ` - ${res.error}` : ""
            }`,
          })
        );
        return res;
      }

      // @ts-ignore
      if (res?.status === 200) {
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
    activeFields,
    dispatch,
    fieldErrors,
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

  const { handlePreviewLoad } = useStudioBridge({
    dispatch,
    interactionMode,
    syncBridgeInteractionMode,
    postCommandToBridge,
    handleTemplateSourceMap,
    handleReorderOutput,
    handleLayoutContentUpdate,
    applyLayoutSelection,
    requestProceedWithPendingLayoutSave,
    clearLayoutSelection,
    applySelection: applyBridgeSelection,
    fieldNameByZuid,
    currentHoverStudioIdRef,
    pendingLayoutHasMappedSource: hasPendingLayoutChanges,
    selectedLayoutCodeId: selectedLayout?.codeId,
    selectedItemDirty: selectedItem?.dirty,
    selectedItemZUID,
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
        compact={true}
      />
      {filteredFieldName ? (
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
      <TrapFocus open disableAutoFocus disableEnforceFocus>
        <Paper
          role="dialog"
          aria-modal="false"
          square
          variant="outlined"
          tabIndex={-1}
          sx={{
            position: "fixed",
            display: "flex",
            flexDirection: "column",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "grey.900",
            overflow: "hidden",
            zIndex: (theme) => theme.zIndex.drawer,
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
          />
          <Box display="flex" flex="1" minHeight={0} width="100%">
            <StudioPreview
              iframeRef={iframeRef}
              iframeSrc={iframeSrc}
              isNavigating={isNavigating}
              isBusy={isRefreshing || studioSaving || isSavingLayout}
              onLoad={handlePreviewFrameLoad}
            />
            {interactionMode === "content" ? (
              <StudioSidePanel
                headerTitle={headerTitle}
                pageItemVersion={pageItemVersion}
                unresolvedPath={unresolvedPath}
                panelMode={panelMode}
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
          {hasPendingLayoutChanges ? (
            <Box
              data-cy="StudioLayoutSaveBar"
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
                  data-cy="StudioLayoutCancelButton"
                  color="inherit"
                  onClick={() => {
                    handleDiscardPendingLayoutSave();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  data-cy="StudioLayoutSaveButton"
                  variant="contained"
                  color="primary"
                  startIcon={
                    isSavingLayout ? undefined : (
                      <SaveRoundedIcon fontSize="small" />
                    )
                  }
                  sx={{ whiteSpace: "nowrap" }}
                  onClick={() => {
                    if (!canUpdatePendingLayout) return;
                    void handleSavePendingLayout();
                  }}
                  disabled={isSavingLayout || !canUpdatePendingLayout}
                >
                  {isSavingLayout ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  data-cy="StudioLayoutSavePublishButton"
                  variant="contained"
                  color="success"
                  startIcon={
                    isSavingLayout ? undefined : (
                      <CloudUploadRoundedIcon fontSize="small" />
                    )
                  }
                  sx={{ whiteSpace: "nowrap" }}
                  onClick={() => {
                    if (!canPublishPendingLayout) return;
                    void handleSaveAndPublishPendingLayout();
                  }}
                  disabled={isSavingLayout || !canPublishPendingLayout}
                >
                  {isSavingLayout ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Save and Publish"
                  )}
                </Button>
              </Box>
            </Box>
          ) : null}
          <PendingEditsModal
            show={Boolean(selectedItem?.dirty)}
            loading={isSaving}
            onSave={handleSave}
            // @ts-ignore
            onDiscard={discardPendingEdits}
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
      </TrapFocus>
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
                setImageEditState(null);
              }}
            />
          </Dialog>
        </MemoryRouter>
      )}
    </>
  );
};
