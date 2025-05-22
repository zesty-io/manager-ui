import { useState, FC, useRef, useMemo, ReactNode, useEffect } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { DialogContent, TextField, MenuItem, Tooltip } from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import AddIcon from "@mui/icons-material/Add";
import { IconButton } from "@zesty-io/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import PathField from "./PathField";
import {
  ContentItemProps,
  FORM_LABELS,
  HTTP_CODE_OPTIONS,
  TARGET_OPTIONS,
  TOOL_TIPS,
} from "../constants";
import { CreateFormDefaultValues, useRedirectsDialog } from "..";
import {
  useGetAllPublishingsQuery,
  useGetContentModelsQuery,
  useGetLangsQuery,
  useSearchContentQuery,
} from "../../../../../../../shell/services/instance";
import {
  ContentModel,
  Language,
  Publishing,
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../../shell/services/types";
import { notify } from "../../../../../../../shell/store/notifications";
import InfoIcon from "@mui/icons-material/Info";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import SearchField from "./SearchField";

type CreateFormProps = {
  open: boolean;
  onClose: () => void;
  defaultValues?: CreateFormDefaultValues | null;
  isInternal?: boolean;
};
type PathProps = {
  id: number;
  path: string;
};

export type PublishingsMap = Record<string, Publishing>;

export const validateUrl = (url: string) => {
  const validProtocols = ["http://", "https://"];

  const hasValidProtocol = validProtocols.some((protocol) =>
    url.startsWith(protocol)
  );
  if (!hasValidProtocol) return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

const CreateForm: FC<CreateFormProps> = ({
  open,
  onClose,
  defaultValues = null,
  isInternal = false,
}) => {
  const dispatch = useDispatch();
  const lastPathRef = useRef(null);
  const [paths, setPaths] = useState<PathProps[]>([
    { id: new Date().getTime() + 1000, path: "" },
  ]);
  const [code, setCode] = useState<RedirectsCodes>(301);
  const [targetInternal, setTargetInternal] = useState<ContentItemProps>(null);
  const [targetPath, setTargetPath] = useState<string>("");
  const [targetType, setTargetType] = useState<RedirectsTargetType>("page");
  const [submitType, setSubmitType] = useState<"single" | "multiple">("single");
  const target = targetType === "page" ? targetInternal?.ZUID : targetPath;
  const [invalidTarget, setInvalidTarget] = useState<boolean>(false);

  const isEdit = !!defaultValues?.ZUID;
  const actionType = !!isEdit ? "edit" : "create";

  const {
    openErrorDialog,
    closeCreateForm,
    isLoading: isRedirectsLoading,
    createRedirects,
    updateRedirect,
  } = useRedirectsDialog();

  const { data: contentItems, isLoading: isLoadingContentItems } =
    useSearchContentQuery({
      query: "",
      order: "created",
      dir: "desc",
      limit: 10000,
    });

  const { data: publishings, isLoading: isLoadingPublishings } =
    useGetAllPublishingsQuery();
  const { data: languages, isLoading: isLoadingLanguages } = useGetLangsQuery(
    {}
  );
  const { data: models, isLoading: isLoadingModels } =
    useGetContentModelsQuery();

  const isLoading =
    !!isLoadingPublishings ||
    !!isLoadingLanguages ||
    !!isLoadingContentItems ||
    !!isLoadingModels;

  const isDisabled =
    !paths?.map((item) => item?.path?.trim())?.filter(Boolean)?.length ||
    !target ||
    !code ||
    !targetType ||
    invalidTarget;

  const urlValidation = (url: string) => {
    const isValidUrl = validateUrl(url);
    setInvalidTarget(!isValidUrl);
    return isValidUrl;
  };
  const resetForm = () => {
    setPaths([{ id: new Date().getTime() + 1000, path: "" }]);
    setCode(301);
    setTargetType("page");
    setTargetInternal(null);
    setTargetPath("");
  };

  const publishingMap: PublishingsMap = useMemo(() => {
    if (isLoadingPublishings) return {};
    return [...(publishings || [])]
      .sort((a, b) => a.version - b.version)
      .reduce((acc: PublishingsMap, item: Publishing) => {
        const current = acc[item?.itemZUID];
        if (!current) {
          acc[item.itemZUID] = item;
        } else {
          if (current?.version < item?.version) {
            acc[item.itemZUID] = item;
          }
        }

        return acc;
      }, {});
  }, [publishings, isLoadingPublishings]);

  const languageMap = useMemo(() => {
    if (isLoadingLanguages) return {};
    return [...(languages || [])].reduce(
      (acc: Record<string, Language>, item: Language) => {
        acc[item.ID] = item;
        return acc;
      },
      {}
    );
  }, [languages, isLoadingLanguages]);

  const modelsMap = useMemo(() => {
    if (isLoadingModels) return {};
    return [...(models || [])].reduce(
      (acc: Record<string, ContentModel>, item: ContentModel) => {
        acc[item.ZUID] = item;
        return acc;
      },
      {}
    );
  }, [models, isLoadingModels]);

  const options = useMemo(() => {
    if (isLoading) return [];

    const parseContentItems = contentItems
      ?.filter(
        (result) =>
          result?.web?.path !== null &&
          ["templateset", "pageset"].includes(
            modelsMap?.[result?.meta?.contentModelZUID]?.type
          )
      )
      ?.map((item) => {
        const publishData = publishingMap?.[item?.meta?.ZUID];
        const langCode = languageMap?.[item?.meta?.langID]?.code;
        return {
          ZUID: item?.meta?.ZUID,
          label:
            item?.web?.metaTitle || item?.web?.metaLinkText || item?.web?.path,
          path: item?.web?.path,
          publishAt: item?.publishAt || publishData?.publishAt || null,
          langCode: langCode || "en",
          isPublished:
            !!publishData &&
            publishData?.versionZUID === item?.web?.versionZUID,
          type: modelsMap?.[item?.meta?.contentModelZUID]?.type,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
      );
    return parseContentItems as ContentItemProps[];
  }, [contentItems, publishingMap, languageMap, modelsMap, isLoading]);

  const handleSubmit = async (submitType: "multiple" | "single") => {
    setSubmitType(submitType);
    const redirectsPaths: string[] = paths
      ?.map((iPath) => iPath?.path?.trim())
      .filter(Boolean);

    const requestData = {
      targetType: targetType,
      code: code,
      target: target,
    };

    let response = null;

    if (!!isEdit) {
      response = await updateRedirect({
        ...requestData,
        ZUID: defaultValues?.ZUID,
        path: redirectsPaths[0],
      });
    } else {
      response = await createRedirects({
        ...requestData,
        paths: redirectsPaths,
      });
    }

    resetForm();

    const errorPaths = response
      ?.filter((item: any) => item?.status === "error")
      .map((item: any) => ({
        error: item?.message,
        path: item?.path,
      }));

    if (submitType !== "multiple" || !!errorPaths?.length) closeCreateForm();

    if (!errorPaths?.length) {
      dispatch(
        notify({
          kind: "success",
          message: !isEdit
            ? `${redirectsPaths?.length} Redirect${
                redirectsPaths?.length > 1 ? "s" : ""
              } Created`
            : `Redirect Saved: ${redirectsPaths[0]}`,
        })
      );
    } else {
      const resubmitData = {
        ...requestData,
        ...(isEdit ? { ZUID: defaultValues?.ZUID } : {}),
        errors: errorPaths,
      };

      openErrorDialog(resubmitData);
    }
  };

  useEffect(() => {
    if (targetType !== "external") setInvalidTarget(false);
  }, [targetType]);

  useEffect(() => {
    if (!open) return;
    resetForm();
    setPaths([
      {
        id: new Date().getTime() + 1000,
        path: defaultValues?.path || "",
      },
    ]);
    setCode(defaultValues?.code || 301);
    setTargetType(defaultValues?.targetType || "page");
    setTargetInternal(null);
    setTargetPath(defaultValues?.target || "");
  }, [open, defaultValues]);

  return (
    <Dialog
      data-cy="RedirectsCreateDialog"
      open={open}
      fullWidth
      maxWidth={false}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: "640px",
            minHeight: "680px",
            height: "`calc(100vh - 100px)`",
            position: "fixed",
            top: "50px",
            bottom: "50px",
            m: 0,
          },
        },
      }}
    >
      <DialogTitle
        sx={{ p: "20px", borderBottom: "1px solid", borderColor: "grey.100" }}
      >
        <Stack
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          columnGap="12px"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="28px"
            width="28px"
            sx={{ color: "action.active" }}
          >
            <ShuffleIcon
              color="inherit"
              sx={{ width: "28px", height: "28px" }}
            />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            flexGrow={1}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              flexGrow={0}
              flexShrink={0}
            >
              {FORM_LABELS[actionType]?.header}
            </Typography>
            <Typography
              variant="body3"
              fontWeight={600}
              color="text.secondary"
              noWrap
              flexGrow={0}
            >
              {FORM_LABELS[actionType]?.subHeader}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: "20px",
            right: "20px",
            color: "action.active",
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "grey.50" }}>
        <Box
          sx={{
            pt: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            rowGap: "20px",
          }}
        >
          <Box
            width="100%"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              rowGap: "16px",
            }}
          >
            <FieldWrapper label="Incoming Path" tooltip="File Path Only">
              <Typography variant="body2" color="text.secondary">
                {FORM_LABELS[actionType]?.incomingPath}
              </Typography>

              <Box
                width="100%"
                data-cy="RedirectsPathsContainer"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "stretch",
                  rowGap: "4px",
                }}
              >
                {paths.map((path) => (
                  <Stack
                    key={path.id}
                    direction="row"
                    gap="10px"
                    alignItems="center"
                    width="100%"
                  >
                    <PathField
                      testId="RedirectsFieldPath"
                      key={path.id}
                      id={path.id}
                      value={path.path}
                      placeHolder="/Enter URL path to redirect from"
                      inputRef={paths?.length < 2 ? lastPathRef : null}
                      autoFocus
                      prefix="/"
                      onChange={(value: any) => {
                        setPaths((prev) =>
                          prev.map((item) =>
                            item.id === path.id
                              ? { ...item, path: value }
                              : item
                          )
                        );
                      }}
                    />

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        if (paths?.length < 2) {
                          setPaths((prev) =>
                            prev.map((item) =>
                              item.id === path.id ? { ...item, path: "" } : item
                            )
                          );
                          if (!!lastPathRef?.current) {
                            lastPathRef.current.focus();
                          }
                        } else {
                          setPaths((prev) =>
                            prev.filter((prevPath) => prevPath.id !== path?.id)
                          );
                        }
                      }}
                      sx={{
                        color: "action.active",
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Box>
            </FieldWrapper>

            {!isEdit && (
              <Box>
                <Button
                  data-cy="RedirectsFormDialogAddPathButton"
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setPaths((prev) => [
                      ...prev,
                      { id: new Date().getTime() + 1000, path: "" },
                    ]);
                  }}
                >
                  Add Path
                </Button>
              </Box>
            )}
          </Box>

          <FieldWrapper label="HTTP Code" tooltip={TOOL_TIPS.code}>
            <TextField
              data-cy="RedirectsCodeSelector"
              select
              defaultValue={301}
              size="small"
              fullWidth
              value={code}
              onChange={(e: any) => setCode(e.target.value)}
            >
              {HTTP_CODE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </FieldWrapper>

          <FieldWrapper
            label="Type"
            tooltip={TOOL_TIPS.targetType}
            disabledTooltip="This value cannot be modified"
            readOnly={isInternal}
          >
            <TextField
              data-cy="RedirectsTypeSelector"
              select
              defaultValue="page"
              size="small"
              fullWidth
              value={targetType}
              onChange={(e: any) => {
                setTargetPath("");
                setTargetInternal(null);
                setTargetType(e.target.value);
              }}
              slotProps={{
                input: {
                  readOnly: isInternal,
                  disabled: isInternal,
                },
              }}
            >
              {TARGET_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </FieldWrapper>
          <FieldWrapper
            label="Redirect Target"
            tooltip="File Path Only"
            disabledTooltip="This value cannot be modified"
            readOnly={isInternal}
          >
            {targetType === "page" ? (
              <SearchField
                options={options}
                loading={isLoading}
                value={targetInternal}
                defaultValue={targetPath}
                onChange={setTargetInternal}
                readOnly={isInternal}
              />
            ) : (
              <PathField
                testId="RedirectsExternalFieldPath"
                placeHolder="Enter URL (e.g. https://www.google.com/)"
                value={targetPath}
                onChange={(e) => {
                  setTargetPath(e);
                }}
                validation={targetType === "external" ? urlValidation : null}
              />
            )}
          </FieldWrapper>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: "20px",
          borderTop: "1px solid",
          borderColor: "grey.100",
          display: "flex",
          justifyContent: isEdit ? "flex-end" : "space-between",
          alignItems: "center",
        }}
      >
        <Button
          size="medium"
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Stack direction="row" justifyContent="space-between" gap="16px">
          {!isEdit && (
            <LoadingButton
              data-cy="RedirectsCreateAddAnotherButton"
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              size="medium"
              disabled={isDisabled}
              loading={submitType === "multiple" && isRedirectsLoading}
              onClick={() => handleSubmit("multiple")}
            >
              Create Another Redirect
            </LoadingButton>
          )}
          <LoadingButton
            data-cy="RedirectsCreateButton"
            variant="contained"
            color="primary"
            size="medium"
            disabled={isDisabled}
            loading={submitType === "single" && isRedirectsLoading}
            onClick={() => handleSubmit("single")}
          >
            {isEdit ? "Save" : "Create Redirect"}
          </LoadingButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

type FieldWrapperProps = {
  label: string;
  tooltip?: string | ReactNode;
  disabledTooltip?: string | ReactNode;
  readOnly?: boolean;
  children: ReactNode;
};

export const FieldWrapper: FC<FieldWrapperProps> = ({
  label,
  tooltip,
  disabledTooltip,
  readOnly = false,
  children,
}: FieldWrapperProps) => {
  const withDisabledTooltip =
    !!disabledTooltip && readOnly ? (
      <Tooltip
        title={
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <NotInterestedIcon color="error" fontSize="small" />
            {disabledTooltip}
          </Box>
        }
        placement="top"
        followCursor
      >
        <Box width="100%">{children}</Box>
      </Tooltip>
    ) : (
      <>{children}</>
    );

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      rowGap="4px"
    >
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        width="100%"
        gap="8px"
      >
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        {!!tooltip && (
          <Tooltip
            title={tooltip}
            placement="top-start"
            slotProps={{
              popper: {
                style: {
                  width: "fit-content",
                  maxWidth: "600px",
                },
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [-20, -10],
                    },
                  },
                ],
              },
            }}
          >
            <InfoIcon
              sx={{ width: "10px", height: "10px", color: "action.active" }}
            />
          </Tooltip>
        )}
      </Stack>
      {withDisabledTooltip}
    </Box>
  );
};

export default CreateForm;
