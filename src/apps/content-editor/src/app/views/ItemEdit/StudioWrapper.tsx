import { Alert, Box, Button, Dialog } from "@mui/material";
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
import { useGetContentModelFieldsQuery } from "../../../../../../shell/services/instance";
import { ContentInfo } from "./Content/Actions/Widgets/ContentInfo";
import Editor from "../../components/Editor/Editor";
import { FieldError } from "../../components/Editor/FieldError";
import contentOneLogoOnly from "../../../../../../../public/images/contentOneLogoOnly.webp";
import contentOneLogo from "../../../../../../../public/images/contentOneLogo.webp";
import {
  normalizePath,
  resolveItemByPath,
} from "../../../../../studio/utils/pathResolver";
import { Sentry } from "../../../../../../utility/sentry";
import { StudioHeader } from "./components/StudioWrapper/StudioHeader";
import { StudioPreview } from "./components/StudioWrapper/StudioPreview";
import { StudioSidePanel } from "./components/StudioWrapper/StudioSidePanel";

const drawerWidth = 440;

type StudioWrapperProps = {
  modelZUID: string;
  itemZUID: string;
  initialPreviewPath?: string;
  initialUnresolved?: boolean;
};

type SelectedElement = {
  fieldZuid: string;
  dataset: Record<string, string>;
  weType?: string;
  itemZuid?: string;
  modelZuid?: string;
};

export const StudioWrapper = ({
  modelZUID,
  itemZUID,
  initialPreviewPath,
  initialUnresolved = false,
}: StudioWrapperProps) => {
  const dispatch = useDispatch();
  const [currentItemZUID, setCurrentItemZUID] = useState(itemZUID);
  const [currentModelZUID, setCurrentModelZUID] = useState(modelZUID);
  const [unresolvedPath, setUnresolvedPath] = useState(initialUnresolved);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null);
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
  const history = useHistory();
  const location = useLocation();

  const instance = useSelector((state: AppState) => state.instance);
  const previewLock = useSelector((state: AppState) =>
    state.settings.instance.find(
      (setting: any) => setting.key === "preview_lock_password" && setting.value
    )
  );
  const contentItems = useSelector((state: AppState) => state.content);
  const modelsState = useSelector((state: AppState) => state.models);
  const item = contentItems[currentItemZUID];
  const model = modelsState[currentModelZUID];

  const [previewPath, setPreviewPath] = useState(
    initialPreviewPath || item?.web?.path || "/"
  );

  const iframeSrc = useMemo(() => {
    const path = previewPath || "/";
    const instanceHash = instance?.randomHashID ?? "";
    // @ts-expect-error Config is provided globally at runtime
    const baseUrl = `${CONFIG.URL_PREVIEW_PROTOCOL}${instanceHash}${CONFIG.URL_PREVIEW}${path}`;
    const queryParams = new URLSearchParams();

    queryParams.set("studio", "on");

    if (previewLock) {
      queryParams.set("zpw", previewLock.value);
    }

    const query = queryParams.toString();

    return query ? `${baseUrl}?${query}` : baseUrl;
  }, [instance?.randomHashID, previewPath, previewLock]);
  const [previewUrl, setPreviewUrl] = useState(iframeSrc);
  const [isNavigating, setIsNavigating] = useState(false);
  const selectedItemZUID = selectedElement?.itemZuid || currentItemZUID;
  const selectedModelZUID = selectedElement?.modelZuid || currentModelZUID;

  const selectedItem = selectedItemZUID
    ? contentItems[selectedItemZUID] || null
    : null;

  const selectedModel = selectedModelZUID
    ? modelsState[selectedModelZUID] || null
    : null;
  const panelTitle = selectedItem?.web?.metaTitle || "Studio";
  const headerTitle = unresolvedPath ? "Preview only" : panelTitle;

  const updateItemByPath = useCallback(
    async (path: string) => {
      const resolved = await resolveItemByPath({
        path,
        contentItems,
        dispatch,
      });

      if (resolved?.meta?.ZUID && resolved?.meta?.contentModelZUID) {
        const normalized = normalizePath(path || "/");
        setPreviewPath(normalized);
        setCurrentItemZUID(resolved.meta.ZUID);
        setCurrentModelZUID(resolved.meta.contentModelZUID);
        setSelectedElement(null);
        setFilteredFieldName(null);
        setUnresolvedPath(false);
        setPanelMode("info");
      } else {
        setUnresolvedPath(true);
        setFilteredFieldName(null);
      }
    },
    [contentItems, dispatch]
  );

  const updateStudioUrl = useCallback(
    (path: string) => {
      if (!location.pathname.startsWith("/studio")) return;
      const normalized = normalizePath(path || "/");
      history.replace(`/studio?path=${encodeURIComponent(normalized)}`);

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

  const handlePreviewSubmit = useCallback(() => {
    try {
      const updatedUrl = new URL(previewUrl);
      setIsNavigating(true);
      iframeRef.current?.setAttribute("src", updatedUrl.toString());
      const normalizedPath = normalizePath(updatedUrl.pathname || "/");
      setPreviewPath(normalizedPath);
      updateStudioUrl(normalizedPath);
      updateItemByPath(normalizedPath);
    } catch (err) {
      dispatch(
        notify({
          kind: "warn",
          message: "Invalid URL. Please check and try again.",
        })
      );
    }
  }, [dispatch, previewUrl, updateItemByPath, updateStudioUrl]);

  const handlePreviewRefresh = useCallback(() => {
    if (!previewUrl) return;
    setIsNavigating(true);
    iframeRef.current?.setAttribute("src", previewUrl);
  }, [previewUrl]);

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

      try {
        const updatedUrl = new URL(previewUrl);
        updatedUrl.pathname = localizedPath;
        setPreviewUrl(updatedUrl.toString());
        setIsNavigating(true);
        iframeRef.current?.setAttribute("src", updatedUrl.toString());
        setPreviewPath(localizedPath);
        updateStudioUrl(localizedPath);
        updateItemByPath(localizedPath);
      } catch (err) {
        dispatch(
          notify({
            kind: "warn",
            message: "Invalid URL. Please check and try again.",
          })
        );
      }
    },
    [dispatch, previewPath, previewUrl, updateItemByPath, updateStudioUrl]
  );

  const handleEditInManager = useCallback(() => {
    history.push(`/content/${currentModelZUID}/${currentItemZUID}`);
  }, [currentModelZUID, currentItemZUID, history]);

  const { data: fields = [] as any[], isFetching: isFetchingFields } =
    useGetContentModelFieldsQuery({
      modelZUID: selectedModelZUID,
    });

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
    if (!item) {
      setIsFetchingItem(true);
      Promise.resolve(
        dispatch(fetchItem(currentModelZUID, currentItemZUID))
      ).finally(() => setIsFetchingItem(false));
    } else {
      setIsFetchingItem(false);
    }
  }, [dispatch, item, currentItemZUID, currentModelZUID]);

  useEffect(() => {
    if (!model) {
      setIsFetchingModel(true);
      Promise.resolve(dispatch(fetchModel(currentModelZUID))).finally(() =>
        setIsFetchingModel(false)
      );
    } else {
      setIsFetchingModel(false);
    }
  }, [dispatch, model, currentModelZUID]);

  const editorItem = selectedItem || null;
  const editorModel = selectedModel || null;

  const isSelectedItemLoading =
    isFetchingItem ||
    isFetchingModel ||
    isFetchingFields ||
    !editorItem ||
    !editorModel ||
    (selectedElement?.itemZuid &&
      selectedElement.itemZuid !== currentItemZUID &&
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
      fieldZuid?: string;
      className?: string;
      style?: Record<string, string>;
      css?: string;
      value?: string;
      html?: string; // NEW: for wysiwyg_advanced
      itemZuid?: string;
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
        "*" // TODO: restrict to preview origin in prod
      );
    },
    []
  );

  const clearSelection = useCallback(() => {
    if (selectedElement?.fieldZuid) {
      postCommandToBridge({
        action: "removeClass",
        fieldZuid: selectedElement.fieldZuid,
        className: "studio-selected",
      });
      postCommandToBridge({
        action: "disableEditing",
        fieldZuid: selectedElement.fieldZuid,
      });
    }
    setSelectedElement(null);
    setFilteredFieldName(null);
    setPanelMode("info");
  }, [postCommandToBridge, selectedElement]);

  // Sync item field values -> iframe for text / textarea / wysiwyg_advanced
  useEffect(() => {
    if (!editorItem || !selectedItemZUID || !activeFields?.length) return;

    const supportedTypes = new Set(["text", "textarea", "wysiwyg_advanced"]);

    activeFields.forEach((field: any) => {
      if (!supportedTypes.has(field?.datatype)) return;
      const fieldZuid = field?.ZUID;
      const fieldName = field?.name;
      if (!fieldZuid) return;
      if (!fieldName) return;

      const rawValue = editorItem?.data?.[fieldName];
      const nextValue =
        typeof rawValue === "string"
          ? rawValue
          : rawValue == null
          ? ""
          : String(rawValue);

      if (field.datatype === "wysiwyg_advanced") {
        postCommandToBridge({
          action: "setHtmlByField",
          itemZuid: selectedItemZUID,
          fieldZuid,
          html: nextValue,
        });
      } else {
        postCommandToBridge({
          action: "setTextByField",
          itemZuid: selectedItemZUID,
          fieldZuid,
          value: nextValue,
        });
      }
    });
  }, [activeFields, editorItem, postCommandToBridge, selectedItemZUID]);

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
    if (!selectedElement?.itemZuid || !selectedElement?.modelZuid) {
      return;
    }

    if (
      selectedElement.itemZuid !== currentItemZUID &&
      !contentItems[selectedElement.itemZuid]
    ) {
      setIsFetchingItem(true);
      Promise.resolve(
        dispatch(fetchItem(selectedElement.modelZuid, selectedElement.itemZuid))
      ).finally(() => setIsFetchingItem(false));
    }

    if (
      selectedElement.modelZuid !== currentModelZUID &&
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
    currentItemZUID,
    currentModelZUID,
    modelsState,
    selectedElement,
  ]);

  useEffect(() => {
    function handleMessage(evt: MessageEvent<any>) {
      console.log("i got message", evt);
      const data = evt.data;
      if (!data || data.source !== "zesty-webengine-bridge") {
        return;
      }

      const msg = data.message;
      if (!msg) return;

      if (msg.type === "BRIDGE_READY") {
        postCommandToBridge({
          action: "injectCss",
          css: `
            we[data-we-type] {
              position: relative;
            }

            /* WYSIWYG regions should behave like block containers */
            we[data-we-type="wysiwyg_advanced"] {
              display: block;
            }
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
          `,
        });
        return;
      }

      if (msg.type === "PATH_CHANGE") {
        const loc = msg.location || {};
        const href = (loc.href as string) || "";
        const path = (loc.path as string) || "/";

        if (href) {
          setPreviewUrl(href);
        }

        const normalizedPath = normalizePath(path || "/");

        setPreviewPath(normalizedPath);
        updateStudioUrl(normalizedPath);
        updateItemByPath(normalizedPath);

        setSelectedElement(null);
        setFilteredFieldName(null);
        setPanelMode("info");
        return;
      }

      if (msg.type === "BRIDGE_ERROR") {
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
        return;
      }

      if (msg.type === "DOM_EVENT") {
        const { eventType, element, value } = msg;
        if (!element) return;

        const dataset: Record<string, string> =
          (element.dataset as Record<string, string>) || {};
        const fieldZuid: string | undefined = dataset.weFieldZuid;
        const weType = dataset.weType;
        const itemZuid = dataset.weItemZuid;
        const modelZuid = dataset.weModelZuid;

        switch (eventType) {
          case "click": {
            if (!fieldZuid) return;

            if (
              selectedElement?.fieldZuid &&
              selectedElement.fieldZuid !== fieldZuid
            ) {
              postCommandToBridge({
                action: "removeClass",
                fieldZuid: selectedElement.fieldZuid,
                className: "studio-selected",
                itemZuid: selectedElement.itemZuid,
              });
              postCommandToBridge({
                action: "disableEditing",
                fieldZuid: selectedElement.fieldZuid,
                itemZuid: selectedElement.itemZuid,
              });
            }

            setSelectedElement({
              fieldZuid,
              dataset,
              weType,
              itemZuid,
              modelZuid,
            });
            const fieldName = fieldNameByZuid.get(fieldZuid) || null;
            setFilteredFieldName(fieldName);
            setPanelMode("edit");
            postCommandToBridge({
              action: "addClass",
              fieldZuid,
              className: "studio-selected",
              itemZuid,
            });

            // Enable inline editing for text / textarea / wysiwyg_advanced
            if (["text", "textarea", "wysiwyg_advanced"].includes(weType)) {
              postCommandToBridge({
                action: "enableEditing",
                fieldZuid,
                itemZuid,
              });
            }

            break;
          }

          case "mouseover": {
            console.log("testing field");
            if (!fieldZuid) return;
            postCommandToBridge({
              action: "addClass",
              fieldZuid,
              className: "studio-hover",
              itemZuid,
            });
            break;
          }

          case "mouseout": {
            if (!fieldZuid) return;
            postCommandToBridge({
              action: "removeClass",
              fieldZuid,
              className: "studio-hover",
              itemZuid,
            });
            break;
          }

          case "input": {
            if (!fieldZuid) return;
            // value comes from bridge:
            // - text/textarea: normalized text
            // - wysiwyg_advanced: innerHTML
            const nextValue: string = typeof value === "string" ? value : "";
            const fieldName = fieldNameByZuid.get(fieldZuid);
            if (!fieldName) return;

            dispatch({
              type: "SET_ITEM_DATA",
              itemZUID: dataset.weItemZuid,
              key: fieldName,
              // convert empty strings to null if you want later
              value: nextValue,
            });
            break;
          }

          default:
            break;
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [postCommandToBridge, selectedElement, dispatch, fieldNameByZuid]);

  const renderInfoPanel = () => (
    <Box display="flex" flexDirection="column" gap={2}>
      <Alert severity="info" variant="standard">
        Select items on the canvas to make edits
      </Alert>
      <ContentInfo
        itemZUID={selectedItemZUID}
        modelZUID={selectedModelZUID}
        isLoadingItem={isSelectedItemLoading}
      />
    </Box>
  );

  const renderEditorPanel = () => (
    <Box display="flex" flexDirection="column" gap={2}>
      {selectedItemZUID === currentItemZUID && saveClicked && hasErrors && (
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
          onClick={() => setFilteredFieldName(null)}
        >
          View All Related Fields
        </Button>
      ) : null}
    </Box>
  );

  return (
    <Dialog
      open
      fullScreen
      PaperProps={{
        sx: {
          overflow: "hidden",
          bgcolor: "grey.900",
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
          previewUrl={previewUrl}
          onPreviewUrlChange={setPreviewUrl}
          onPreviewUrlSubmit={handlePreviewSubmit}
          onRefresh={handlePreviewRefresh}
          onLanguageChange={handleLanguageChange}
          currentModelZUID={currentModelZUID}
          currentItemZUID={currentItemZUID}
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
            unresolvedPath={unresolvedPath}
            panelMode={panelMode}
            clearSelection={clearSelection}
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
      </Box>
    </Dialog>
  );
};
