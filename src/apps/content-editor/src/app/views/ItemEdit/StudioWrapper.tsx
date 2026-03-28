import { Alert, Box, Button, CircularProgress, Dialog } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router";
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
import contentOneLogoOnly from "../../../../../../../public/images/contentOneLogoOnly.webp";
import contentOneLogo from "../../../../../../../public/images/contentOneLogo.webp";
import {
  findItemByPath,
  normalizePath,
  resolveItemByPath,
} from "../../../../../studio/utils/pathResolver";
import { Sentry } from "../../../../../../utility/sentry";
import { StudioHeader } from "./components/StudioWrapper/StudioHeader";
import { StudioPreview } from "./components/StudioWrapper/StudioPreview";
import { StudioSidePanel } from "./components/StudioWrapper/StudioSidePanel";

const drawerWidth = 440;
const mapSourceByLayoutOrder = (source: string, orderedLayoutIds: string[]) => {
  if (!source || !orderedLayoutIds?.length) return source;

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div id="studio-root">${source}</div>`,
    "text/html"
  );
  const root = doc.getElementById("studio-root");
  if (!root) return source;

  const rankByUid = new Map<string, number>();
  orderedLayoutIds.forEach((layoutId, index) => rankByUid.set(layoutId, index));

  const reorderWithinParent = (parent: Element) => {
    const allChildren = Array.from(parent.children);
    const uidChildren = allChildren.filter((child) =>
      child.hasAttribute("data-layout-id")
    );

    if (uidChildren.length > 1) {
      const sortedUidChildren = [...uidChildren].sort((a, b) => {
        const aUid = a.getAttribute("data-layout-id") || "";
        const bUid = b.getAttribute("data-layout-id") || "";
        const aRank = rankByUid.has(aUid)
          ? (rankByUid.get(aUid) as number)
          : Number.MAX_SAFE_INTEGER;
        const bRank = rankByUid.has(bUid)
          ? (rankByUid.get(bUid) as number)
          : Number.MAX_SAFE_INTEGER;
        return aRank - bRank;
      });

      sortedUidChildren.forEach((child) => {
        parent.appendChild(child);
      });
    }

    Array.from(parent.children).forEach((child) => reorderWithinParent(child));
  };

  reorderWithinParent(root);
  return root.innerHTML;
};

type SelectedElement = {
  studioId?: string;
  fieldZuid: string;
  fieldType?: string;
  itemZuid?: string;
  modelZuid?: string;
};

type InteractionMode = "content" | "layout";

export const StudioWrapper = () => {
  const dispatch = useDispatch();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const templateSourceByCodeIdRef = useRef<Record<string, string>>({});
  const currentHoverStudioIdRef = useRef<string | null>(null);
  const currentHoverLayoutIdRef = useRef<string | null>(null);
  const latestReorderOutputRef = useRef<{
    codeId: string | null;
    selector: string;
    orderedLayoutIds: string[];
    outputHtml: string;
    mappedSource: string;
  } | null>(null);
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null);
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>("content");
  const [panelMode, setPanelMode] = useState<"info" | "edit">("info");
  const [filteredFieldName, setFilteredFieldName] = useState<string | null>(
    null
  );
  const [studioSaving, setStudioSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});
  const [saveClicked, setSaveClicked] = useState(false);
  const fieldErrorRef = useRef<any>(null);
  const [isFetchingItem, setIsFetchingItem] = useState(false);
  const [isFetchingModel, setIsFetchingModel] = useState(false);
  const [isFetchingFields, setIsFetchingFields] = useState(false);
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
    setSelectedElement(null);
    setFilteredFieldName(null);
    setUnresolvedPath(false);
    setPanelMode("info");
  }, [pageItemZUID, pageModelZUID, resolvedFromCache, unresolvedPath]);

  const updateStudioUrl = useCallback(
    (path: string) => {
      if (!location.pathname.startsWith("/studio")) return;
      const normalized = normalizePath(path || "/");
      history.replace(`/studio?path=${normalized}`);

      if (window.parent && window.parent !== window) {
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

  const clearSelection = useCallback(() => {
    if (selectedElement?.fieldZuid) {
      postCommandToBridge({
        action: "disableEditing",
        studioId: selectedElement.studioId,
        itemZuid: selectedElement.itemZuid,
      });
      postCommandToBridge({
        action: "removeClass",
        studioId: selectedElement.studioId,
        className: "studio-selected",
        itemZuid: selectedElement.itemZuid,
      });
    }
    setSelectedElement(null);
    setFilteredFieldName(null);
    setPanelMode("info");
  }, [postCommandToBridge, selectedElement]);

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

      if (currentHoverStudioIdRef.current) {
        postCommandToBridge({
          action: "removeClass",
          studioId: currentHoverStudioIdRef.current,
          className: "studio-hover",
        });
        currentHoverStudioIdRef.current = null;
      }

      if (currentHoverLayoutIdRef.current) {
        postCommandToBridge({
          action: "removeClassByLayoutId",
          layoutId: currentHoverLayoutIdRef.current,
          className: "studio-hover",
        });
        currentHoverLayoutIdRef.current = null;
      }

      clearSelection();
      setInteractionMode(nextMode);
      syncBridgeInteractionMode(nextMode);
    },
    [
      clearSelection,
      interactionMode,
      postCommandToBridge,
      syncBridgeInteractionMode,
    ]
  );

  const handleLanguageChange = useCallback(
    (langCode: string) => {
      const normalizedPath = normalizePath(previewPath);
      const pathSegments = normalizedPath.split("/").filter(Boolean);
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

  const clearHighlightOnly = useCallback(() => {
    if (selectedElement?.fieldZuid) {
      postCommandToBridge({
        action: "disableEditing",
        studioId: selectedElement.studioId,
        itemZuid: selectedElement.itemZuid,
      });
      postCommandToBridge({
        action: "removeClass",
        studioId: selectedElement.studioId,
        className: "studio-selected",
        itemZuid: selectedElement.itemZuid,
      });
    }
    setFilteredFieldName(null);
  }, [postCommandToBridge, selectedElement]);

  const applySelection = useCallback(
    (next: {
      studioId?: string;
      fieldZuid: string;
      fieldType?: string;
      itemZuid?: string;
      modelZuid?: string;
    }) => {
      const { studioId, fieldZuid, fieldType, itemZuid, modelZuid } = next;

      if (selectedElement?.studioId && selectedElement.studioId !== studioId) {
        postCommandToBridge({
          action: "disableEditing",
          studioId: selectedElement.studioId,
          itemZuid: selectedElement.itemZuid,
        });
        postCommandToBridge({
          action: "removeClass",
          studioId: selectedElement.studioId,
          className: "studio-selected",
          itemZuid: selectedElement.itemZuid,
        });
      }

      setSelectedElement({
        studioId,
        fieldZuid,
        fieldType,
        itemZuid,
        modelZuid,
      });
      setFilteredFieldName(fieldNameByZuid.get(fieldZuid) || null);
      setPanelMode("edit");
      postCommandToBridge({
        action: "addClass",
        studioId,
        className: "studio-selected",
        itemZuid,
      });
      if (
        studioId &&
        fieldType &&
        [
          "text",
          "textarea",
          "markdown",
          "wysiwyg_basic",
          "wysiwyg_advanced",
        ].includes(fieldType)
      ) {
        postCommandToBridge({
          action: "enableEditing",
          studioId,
          itemZuid,
        });
      }
    },
    [fieldNameByZuid, postCommandToBridge, selectedElement]
  );

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
        selectedElement.fieldType || ""
      )
    ) {
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

  const handleTemplateSourceMap = useCallback((msg: any) => {
    templateSourceByCodeIdRef.current =
      (msg.templateSourceByCodeId as Record<string, string>) || {};
  }, []);

  const handleBridgeReady = useCallback(() => {
    postCommandToBridge({
      action: "injectCss",
      css: `
        .studio-hover {
          outline: 1px dashed #00bcd4;
          outline-offset: 2px;
          cursor: pointer;
        }
        .studio-selected {
          outline: 2px solid #ff9800;
          outline-offset: 2px;
          background-color: rgba(255,152,0,0.06);
        }
        [data-layout-id][draggable="true"] {
          cursor: move;
        }
        .studio-dragging {
          opacity: 0.6;
        }
      `,
    });
    syncBridgeInteractionMode(interactionMode);
  }, [interactionMode, postCommandToBridge, syncBridgeInteractionMode]);

  const handleBridgeError = useCallback(
    (msg: any) => {
      const bridgeError = msg.error || {};
      const error = new Error(bridgeError.message || "Bridge error");
      if (bridgeError.stack) {
        (error as any).stack = bridgeError.stack;
      }

      dispatch(
        notify({
          kind: "error",
          message: `Preview error: ${bridgeError.message || "Bridge error"}`,
        })
      );

      Sentry.withScope((scope) => {
        scope.setLevel("error");
        scope.setTag("bridge.kind", msg.kind || "error");
        scope.setContext("bridge.error", {
          filename: bridgeError.filename || null,
          lineno: bridgeError.lineno || null,
          colno: bridgeError.colno || null,
          stack: bridgeError.stack || null,
        });
        scope.setExtra("bridge.message", bridgeError.message || "");
        Sentry.captureException(error);
      });
    },
    [dispatch]
  );

  const handleBridgeDomEvent = useCallback(
    (msg: any) => {
      const { eventType, element, value } = msg;
      if (!element) return;

      const dataset: Record<string, string> =
        (element.dataset as Record<string, string>) || {};
      const studioId = dataset.studioId;
      const fieldZuid: string | undefined = dataset.fieldZuid;
      const fieldType = dataset.fieldType;
      const itemZuid = dataset.itemZuid;
      const modelZuid = dataset.modelZuid;
      const layoutId = dataset.layoutId;

      switch (eventType) {
        case "click": {
          if (interactionMode !== "content") return;
          if (!fieldZuid) return;

          const isChangingItem =
            Boolean(itemZuid) &&
            Boolean(selectedItemZUID) &&
            itemZuid !== selectedItemZUID;
          if (isChangingItem && selectedItem?.dirty) {
            const openModal = (window as any).openContentNavigationModal;
            if (typeof openModal === "function") {
              openModal((shouldProceed: boolean) => {
                if (shouldProceed) {
                  applySelection({
                    studioId,
                    fieldZuid,
                    fieldType,
                    itemZuid,
                    modelZuid,
                  });
                }
              });
              return;
            }
          }

          applySelection({
            studioId,
            fieldZuid,
            fieldType,
            itemZuid,
            modelZuid,
          });
          return;
        }

        case "input": {
          if (interactionMode !== "content") return;
          if (!fieldZuid || !itemZuid) return;

          const fieldName = fieldNameByZuid.get(fieldZuid);
          if (!fieldName) return;

          dispatch({
            type: "SET_ITEM_DATA",
            itemZUID: itemZuid,
            key: fieldName,
            value: typeof value === "string" ? value : "",
          });
          return;
        }

        case "mouseover": {
          if (interactionMode === "layout") {
            if (!layoutId) return;
            currentHoverLayoutIdRef.current = layoutId;
            postCommandToBridge({
              action: "addClassByLayoutId",
              layoutId,
              className: "studio-hover",
            });
            return;
          }

          if (!studioId) return;
          currentHoverStudioIdRef.current = studioId;
          postCommandToBridge({
            action: "addClass",
            studioId,
            className: "studio-hover",
            itemZuid,
          });
          return;
        }

        case "mouseout": {
          if (interactionMode === "layout") {
            if (!layoutId) return;
            if (currentHoverLayoutIdRef.current === layoutId) {
              currentHoverLayoutIdRef.current = null;
            }
            postCommandToBridge({
              action: "removeClassByLayoutId",
              layoutId,
              className: "studio-hover",
            });
            return;
          }

          if (!studioId) return;
          if (currentHoverStudioIdRef.current === studioId) {
            currentHoverStudioIdRef.current = null;
          }
          postCommandToBridge({
            action: "removeClass",
            studioId,
            className: "studio-hover",
            itemZuid,
          });
        }
      }
    },
    [
      applySelection,
      dispatch,
      fieldNameByZuid,
      interactionMode,
      postCommandToBridge,
      selectedItem?.dirty,
      selectedItemZUID,
    ]
  );

  const handleReorderOutput = useCallback((msg: any) => {
    const codeId = typeof msg.codeId === "string" ? msg.codeId : null;
    const orderedLayoutIds = Array.isArray(msg.orderedLayoutIds)
      ? msg.orderedLayoutIds.filter(
          (layoutId: unknown): layoutId is string =>
            typeof layoutId === "string"
        )
      : [];
    const sourceTemplate = codeId
      ? templateSourceByCodeIdRef.current[codeId] || ""
      : "";
    const mappedSource = sourceTemplate
      ? mapSourceByLayoutOrder(sourceTemplate, orderedLayoutIds)
      : "";

    latestReorderOutputRef.current = {
      codeId,
      selector:
        typeof msg.selector === "string" ? msg.selector : "[data-layout-id]",
      orderedLayoutIds,
      outputHtml: typeof msg.outputHtml === "string" ? msg.outputHtml : "",
      mappedSource,
    };

    // Temporary visibility while wiring source remapping from layout drag/drop.
    // eslint-disable-next-line no-console
    console.log("[studio] Reordered canvas output", {
      codeId,
      selector:
        typeof msg.selector === "string" ? msg.selector : "[data-layout-id]",
      orderedLayoutIds,
      outputHtml: typeof msg.outputHtml === "string" ? msg.outputHtml : "",
      sourceTemplate,
      mappedSource,
    });
  }, []);

  useEffect(() => {
    function handleMessage(evt: MessageEvent<any>) {
      const data = evt.data;
      if (!data || data.source !== "studio-bridge") {
        return;
      }

      const msg = data.message;
      if (!msg) return;

      if (msg.type === "TEMPLATE_SOURCE_MAP") {
        handleTemplateSourceMap(msg);
        return;
      }

      if (msg.type === "BRIDGE_READY") {
        handleBridgeReady();
        return;
      }

      if (msg.type === "PATH_CHANGE") {
        const loc = msg.location || {};
        const path = (loc.path as string) || "/";

        const normalizedPath = normalizePath(path || "/");
        updateStudioUrl(normalizedPath);
        updateItemByPath(normalizedPath, { onApplied: clearSelection });
        return;
      }

      if (msg.type === "BRIDGE_ERROR") {
        handleBridgeError(msg);
        return;
      }

      if (msg.type === "DOM_EVENT") {
        handleBridgeDomEvent(msg);
        return;
      }

      if (msg.type === "REORDER_OUTPUT") {
        handleReorderOutput(msg);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    clearSelection,
    handleBridgeDomEvent,
    handleBridgeError,
    handleBridgeReady,
    handleReorderOutput,
    handleTemplateSourceMap,
  ]);

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
    <Dialog
      open
      fullScreen
      PaperProps={{
        sx: {
          overflow: "hidden",
          bgcolor: "grey.900",
          borderRadius: 0,
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        width="100%"
        position="relative"
      >
        <StudioHeader
          onLanguageChange={handleLanguageChange}
          interactionMode={interactionMode}
          onInteractionModeChange={handleInteractionModeChange}
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
            onLoad={() => setIsNavigating(false)}
          />
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
        </Box>
        <PendingEditsModal
          show={Boolean(selectedItem?.dirty)}
          loading={isSaving}
          onSave={handleSave}
          // @ts-ignore
          onDiscard={discardPendingEdits}
        />
      </Box>
    </Dialog>
  );
};
