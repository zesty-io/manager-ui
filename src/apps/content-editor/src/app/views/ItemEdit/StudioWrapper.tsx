import { CloseRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  CircularProgress,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
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
import { ItemEditHeaderActions } from "./components/ItemEditHeader/ItemEditHeaderActions";
import { VersionSelector } from "./components/ItemEditHeader/VersionSelector";
import { LanguageSelector } from "./components/ItemEditHeader/LanguageSelector";
import { ContentInfo } from "./Content/Actions/Widgets/ContentInfo";
import Editor from "../../components/Editor/Editor";
import { FieldError } from "../../components/Editor/FieldError";
import RedirectsDialogContextProvider from "../../../../../seo/src/app/components/RedirectsDialogProvider";
import contentOneLogoOnly from "../../../../../../../public/images/contentOneLogoOnly.webp";
import contentOneLogo from "../../../../../../../public/images/contentOneLogo.webp";
import {
  normalizePath,
  resolveItemByPath,
} from "../../../../../studio/utils/pathResolver";

const drawerWidth = 440;

type StudioWrapperProps = {
  modelZUID: string;
  itemZUID: string;
  initialPreviewPath?: string;
  initialUnresolved?: boolean;
};

type SelectedElement = {
  id: string;
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
  const [filteredFieldKey, setFilteredFieldKey] = useState<string | null>(null);
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
        setFilteredFieldKey(null);
        setUnresolvedPath(false);
        setPanelMode("info");
      } else {
        setUnresolvedPath(true);
        setFilteredFieldKey(null);
      }
    },
    [contentItems, dispatch]
  );

  const updateStudioUrl = useCallback(
    (path: string) => {
      if (!location.pathname.startsWith("/studio")) return;
      const normalized = normalizePath(path || "/");
      history.replace(`/studio?path=${encodeURIComponent(normalized)}`);
    },
    [history, location.pathname]
  );

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

  const selectedFieldKey = selectedElement?.dataset?.weFieldKey;
  const selectedFieldValue = selectedFieldKey
    ? editorItem?.data?.[selectedFieldKey]
    : undefined;
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
      id?: string;
      className?: string;
      style?: Record<string, string>;
      css?: string;
      value?: string;
      html?: string; // NEW: for wysiwyg_advanced
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
    if (selectedElement?.id) {
      postCommandToBridge({
        action: "removeClass",
        id: selectedElement.id,
        className: "studio-selected",
      });
      postCommandToBridge({
        action: "disableEditing",
        id: selectedElement.id,
      });
    }
    setSelectedElement(null);
    setFilteredFieldKey(null);
    setPanelMode("info");
  }, [postCommandToBridge, selectedElement]);

  // Sync selected field value -> iframe for text / textarea / wysiwyg_advanced
  useEffect(() => {
    if (!selectedElement?.id || !selectedFieldKey || !selectedElement.weType) {
      return;
    }

    const weType = selectedElement.weType;

    const nextValue =
      typeof selectedFieldValue === "string"
        ? selectedFieldValue
        : selectedFieldValue == null
        ? ""
        : String(selectedFieldValue);

    if (["text", "textarea"].includes(weType)) {
      postCommandToBridge({
        action: "setText",
        id: selectedElement.id,
        value: nextValue,
      });
    } else if (weType === "wysiwyg_advanced") {
      postCommandToBridge({
        action: "setHtml",
        id: selectedElement.id,
        html: nextValue,
      });
    }
  }, [
    postCommandToBridge,
    selectedElement?.id,
    selectedElement?.weType,
    selectedFieldKey,
    selectedFieldValue,
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
        setFilteredFieldKey(null);
        setPanelMode("info");
        return;
      }

      if (msg.type === "DOM_EVENT") {
        const { eventType, element, value } = msg;
        if (!element) return;

        const id: string | undefined = element.id;
        const dataset: Record<string, string> =
          (element.dataset as Record<string, string>) || {};
        const weType = dataset.weType;
        const itemZuid = dataset.weItemZuid;
        const modelZuid = dataset.weModelZuid;

        switch (eventType) {
          case "click": {
            if (!id) return;

            if (selectedElement?.id && selectedElement.id !== id) {
              postCommandToBridge({
                action: "removeClass",
                id: selectedElement.id,
                className: "studio-selected",
              });
              postCommandToBridge({
                action: "disableEditing",
                id: selectedElement.id,
              });
            }

            setSelectedElement({
              id,
              dataset,
              weType,
              itemZuid,
              modelZuid,
            });
            const fieldKey = dataset.weFieldKey || null;
            setFilteredFieldKey(fieldKey);
            setPanelMode("edit");
            postCommandToBridge({
              action: "addClass",
              id,
              className: "studio-selected",
            });

            // Enable inline editing for text / textarea / wysiwyg_advanced
            if (["text", "textarea", "wysiwyg_advanced"].includes(weType)) {
              postCommandToBridge({
                action: "enableEditing",
                id,
              });
            }

            break;
          }

          case "mouseover": {
            if (!id) return;
            postCommandToBridge({
              action: "addClass",
              id,
              className: "studio-hover",
            });
            break;
          }

          case "mouseout": {
            if (!id) return;
            postCommandToBridge({
              action: "removeClass",
              id,
              className: "studio-hover",
            });
            break;
          }

          case "input": {
            if (!id) return;
            // value comes from bridge:
            // - text/textarea: normalized text
            // - wysiwyg_advanced: innerHTML
            const nextValue: string = typeof value === "string" ? value : "";

            dispatch({
              type: "SET_ITEM_DATA",
              itemZUID: dataset.weItemZuid,
              key: dataset.weFieldKey,
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
  }, [postCommandToBridge, selectedElement, dispatch]);

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
        active={selectedElement?.id || undefined}
        item={editorItem}
        model={editorModel}
        onSave={handleSave}
        itemZUID={selectedItemZUID}
        modelZUID={selectedModelZUID}
        onUpdateFieldErrors={onUpdateFieldErrors}
        fieldErrors={fieldErrors}
        isLoadingItem={isSelectedItemLoading}
        visibleFieldName={filteredFieldKey || undefined}
      />
      {filteredFieldKey ? (
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={() => setFilteredFieldKey(null)}
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
        <Box
          sx={{
            py: 1,
            px: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
            backgroundColor: (theme) => theme.palette.grey[50],
          }}
        >
          <Box
            component="img"
            src={contentOneLogoOnly}
            alt="Content One"
            sx={{ height: 32 }}
          />
          <OutlinedInput
            fullWidth
            size="small"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              try {
                const updatedUrl = new URL(previewUrl);
                setIsNavigating(true);
                iframeRef.current?.setAttribute("src", updatedUrl.toString());
                const normalizedPath = normalizePath(
                  updatedUrl.pathname || "/"
                );
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
            }}
            sx={{
              backgroundColor: (theme) => theme.palette.grey[100],
            }}
          />
          <Box minWidth={96}>
            <LanguageSelector
              modelZUIDOverride={currentModelZUID}
              itemZUIDOverride={currentItemZUID}
              onChange={({ langCode }) => {
                if (!langCode) return;
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
              }}
              disabled={unresolvedPath}
            />
          </Box>
        </Box>
        <Box display="flex" flex="1" minHeight={0} width="100%">
          <Box position="relative" flex="1" minWidth={0}>
            <Box
              flex="1"
              minWidth={0}
              ref={iframeRef}
              component="iframe"
              src={iframeSrc}
              onLoad={() => setIsNavigating(false)}
              sx={{
                border: "none",
                height: "100%",
                width: "100%",
                bgcolor: "grey.900",
              }}
            />
            {isNavigating && (
              <Box
                component="div"
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                }}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
          <Drawer
            variant="permanent"
            anchor="right"
            PaperProps={{
              sx: {
                overflow: "hidden",
                position: "relative",
                width: drawerWidth,
                boxSizing: "border-box",
                borderLeft: (theme) => `1px solid ${theme.palette.border}`,
                backgroundColor: (theme) => theme.palette.grey[50],
              },
            }}
          >
            <Box
              height="100%"
              display="flex"
              flexDirection="column"
              p={3}
              gap={2}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Stack>
                  <Typography variant="subtitle1" fontWeight="600">
                    {headerTitle}
                  </Typography>
                  {!unresolvedPath ? (
                    <Box>
                      <VersionSelector
                        activeVersion={activeVersion}
                        modelZUIDOverride={selectedModelZUID}
                        itemZUIDOverride={selectedItemZUID}
                      />
                    </Box>
                  ) : null}
                </Stack>
                <Stack direction="row" gap={1} alignItems="center">
                  {panelMode === "edit" ? (
                    <IconButton
                      aria-label="Close Studio preview"
                      onClick={clearSelection}
                      size="small"
                    >
                      <CloseRounded />
                    </IconButton>
                  ) : (
                    <Box sx={{ width: 32 }} />
                  )}
                </Stack>
              </Stack>
              <Box flex="1" overflow="auto" pr={1}>
                {unresolvedPath ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    color="text.secondary"
                  >
                    <Typography variant="body2">
                      No CMS item is associated with this path. Editing is
                      disabled.
                    </Typography>
                  </Box>
                ) : panelMode === "edit" ? (
                  renderEditorPanel()
                ) : (
                  renderInfoPanel()
                )}
              </Box>
              <Box mt="auto">
                {panelMode === "edit" ? (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={clearSelection}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <RedirectsDialogContextProvider>
                      <ItemEditHeaderActions
                        saving={isSaving}
                        onSave={handleSave}
                        hasError={hasErrors}
                        isLoadingItem={isSelectedItemLoading}
                        modelZUIDOverride={selectedModelZUID}
                        itemZUIDOverride={selectedItemZUID}
                      />
                    </RedirectsDialogContextProvider>
                  </Stack>
                ) : (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    color="primary"
                    sx={{ mb: 2 }}
                    disabled={unresolvedPath}
                    onClick={() =>
                      history.push(
                        `/content/${currentModelZUID}/${currentItemZUID}`
                      )
                    }
                  >
                    Edit in Zesty Manager
                  </Button>
                )}
                <Box
                  mt={2}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={1}
                >
                  <Box
                    component="img"
                    src={contentOneLogo}
                    alt="Content One"
                    sx={{ height: 24 }}
                  />
                  <Typography
                    variant="body3"
                    color="text.secondary"
                    textAlign="center"
                  >
                    Agentic Studio by Content.One
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Drawer>
        </Box>
      </Box>
    </Dialog>
  );
};
