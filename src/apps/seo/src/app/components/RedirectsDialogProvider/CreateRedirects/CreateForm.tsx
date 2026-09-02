import { useState, FC, useRef, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { DialogContent, TextField, MenuItem } from "@mui/material";
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
  getToolTips,
} from "../constants";
import { CreateFormDefaultValues, useRedirectsDialog } from "..";

import {
  ContentItemWithDirtyAndPublishing,
  Publishing,
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../../shell/services/types";
import { notify } from "../../../../../../../shell/store/notifications";
import SearchField from "./SearchField";
import { AppState } from "shell/store/types";
import { searchItems } from "shell/store/content";
import { validateUrl } from "utility/validateUrl";
import { FieldWrapper } from "./FieldWrapper";

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

const CreateForm: FC<CreateFormProps> = ({
  open,
  onClose,
  defaultValues = null,
  isInternal = false,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
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

  const urlValidation = useCallback(
    (url: string) => {
      const isValid = validateUrl(url);
      setInvalidTarget(!isValid);
      return isValid;
    },
    [setInvalidTarget]
  );

  const isEdit = !!defaultValues?.ZUID;
  const actionType = !!isEdit ? "edit" : "create";

  const {
    openErrorDialog,
    closeCreateForm,
    isLoading: isRedirectsLoading,
    createRedirects,
    updateRedirect,
  } = useRedirectsDialog();

  const contentItems = useSelector((state: AppState) => state.content);
  const contentModels = useSelector((state: AppState) => state.models);
  const languages = useSelector((state: any) => state.languages);

  const options = useMemo(() => {
    return Object.values(contentItems)
      .filter((item) => item?.meta?.ZUID && item?.web?.path)
      .sort((a, b) => {
        const dateA = new Date(a.meta.createdAt).getTime();
        const dateB = new Date(b.meta.createdAt).getTime();
        return dateB - dateA;
      })
      .map((item: ContentItemWithDirtyAndPublishing) => {
        const web = item.web;
        const meta = item.meta;
        const publishing = item.publishing;
        return {
          ZUID: meta?.ZUID,
          label: web?.metaTitle || web?.metaLinkText || web?.path || "",
          langCode:
            languages.find((lang: any) => lang.ID === meta?.langID)?.code ||
            "en-US",
          path: web?.path,
          type: contentModels[meta?.contentModelZUID]?.type || "",
          isPublished: publishing?.isPublished || false,
        };
      });
  }, [contentItems, contentModels, languages]);

  const isDisabled =
    !paths?.map((item) => item?.path?.trim())?.filter(Boolean)?.length ||
    !target ||
    !code ||
    !targetType ||
    invalidTarget;

  const resetForm = () => {
    setPaths([{ id: new Date().getTime() + 1000, path: "" }]);
    setCode(301);
    setTargetType("page");
    setTargetInternal(null);
    setTargetPath("");
  };

  const handleSearch = (term: string) => {
    dispatch(searchItems(term));
  };

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
            ? t("seo.createFormNotifyCreated", {
                count: redirectsPaths?.length,
              })
            : t("seo.createFormNotifySaved", {
                path: redirectsPaths[0],
              }),
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
      maxWidth={false}
      onClose={onClose}
      slotProps={{
        container: {
          sx: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            py: "20px",
          },
        },
        paper: {
          sx: {
            minWidth: "640px",
            minHeight: "680px",
            height: "calc(100vh - 40px)",
            maxHeight: "1240px",
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
              {t(FORM_LABELS[actionType]?.header)}
            </Typography>
            <Typography
              variant="body3"
              fontWeight={600}
              color="text.secondary"
              noWrap
              flexGrow={0}
            >
              {t(FORM_LABELS[actionType]?.subHeader)}
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
            <FieldWrapper
              label={t("seo.createFormIncomingPathLabel")}
              tooltip={t("seo.createFormFilePathOnlyTooltip")}
            >
              <Typography variant="body2" color="text.secondary">
                {t(FORM_LABELS[actionType]?.incomingPath)}
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
                      placeHolder={t("seo.createFormPathPlaceholder")}
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
                  {t("seo.createFormAddPath")}
                </Button>
              </Box>
            )}
          </Box>

          <FieldWrapper
            label={t("seo.createFormHttpCodeLabel")}
            tooltip={getToolTips(t).code}
          >
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
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>
          </FieldWrapper>

          <FieldWrapper
            label={t("seo.createFormTypeLabel")}
            tooltip={getToolTips(t).targetType}
            disabledTooltip={t("seo.createFormValueCannotBeModified")}
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
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>
          </FieldWrapper>
          <FieldWrapper
            label={t("seo.createFormRedirectTargetLabel")}
            tooltip={t("seo.createFormFilePathOnlyTooltip")}
            disabledTooltip={t("seo.createFormValueCannotBeModified")}
            readOnly={isInternal}
          >
            {targetType === "page" ? (
              <SearchField
                options={options}
                value={targetInternal}
                defaultValue={targetPath}
                onChange={setTargetInternal}
                readOnly={isInternal}
                onSearch={handleSearch}
              />
            ) : (
              <PathField
                testId="RedirectsExternalFieldPath"
                placeHolder={t("seo.createFormExternalUrlPlaceholder")}
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
          data-cy="RedirectsFormCancelButton"
          size="medium"
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          {t("common.cancel")}
        </Button>
        <Stack direction="row" justifyContent="space-between" gap="16px">
          {!isEdit && (
            <Button
              data-cy="RedirectsCreateAddAnotherButton"
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              size="medium"
              disabled={isDisabled}
              loading={submitType === "multiple" && isRedirectsLoading}
              onClick={() => handleSubmit("multiple")}
            >
              {t("seo.createFormCreateAnotherRedirect")}
            </Button>
          )}
          <Button
            data-cy="RedirectsCreateButton"
            variant="contained"
            color="primary"
            size="medium"
            disabled={isDisabled}
            loading={submitType === "single" && isRedirectsLoading}
            onClick={() => handleSubmit("single")}
          >
            {isEdit ? t("common.save") : t("seo.createFormCreateRedirect")}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CreateForm;
