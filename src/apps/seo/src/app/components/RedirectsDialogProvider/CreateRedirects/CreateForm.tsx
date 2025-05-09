import {
  useState,
  FC,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
  useEffect,
} from "react";
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
import PathInputField from "./PathInputField";
import {
  ContentItemProps,
  HTTP_CODE_OPTIONS,
  TARGET_OPTIONS,
  TOOL_TIPS,
  validateUrl,
} from "../constants";
import { useRedirectsDialog } from "..";
import {
  useGetAllPublishingsQuery,
  useGetLangsQuery,
} from "../../../../../../../shell/services/instance";
import {
  Publishing,
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../../shell/services/types";
import TargetInputField from "./TargetInputField";
import { notify } from "../../../../../../../shell/store/notifications";
import InfoIcon from "@mui/icons-material/Info";

type CreateFormProps = {
  open: boolean;
  onClose: () => void;
};
type PathProps = {
  id: number;
  path: string;
};

export type PublishingsMap = Record<string, Publishing>;

const CreateForm: FC<CreateFormProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const lastPathRef = useRef(null);
  const [paths, setPaths] = useState<PathProps[]>([
    { id: new Date().getTime() + 1000, path: "" },
  ]);
  const [redirectCode, setRedirectCode] = useState<RedirectsCodes>(301);
  const [redirectTarget, setRedirectTarget] = useState<ContentItemProps>(null);
  const [redirectTargetPath, setRedirectTargetPath] = useState<string>("");
  const [redirectType, setRedirectType] = useState<RedirectsTargetType>("page");
  const [submitType, setSubmitType] = useState<"single" | "multiple">("single");
  const targetPath =
    redirectType === "page" ? redirectTarget?.id : redirectTargetPath;
  const [invalidTargetPath, setInvalidTargetPath] = useState<boolean>(false);

  const {
    openErrorDialog,
    closeCreateForm,
    createRedirects,
    isCreatingRedirect,
  } = useRedirectsDialog();

  const { data: publishings, isLoading: isLoadingPublishings } =
    useGetAllPublishingsQuery();
  const { data: languages, isLoading: isLoadingLanguages } = useGetLangsQuery(
    {}
  );

  const isLoading = !!isLoadingPublishings || !!isLoadingLanguages;
  const isDisabled =
    !paths?.map((item) => item?.path?.trim())?.filter(Boolean)?.length ||
    !targetPath ||
    !redirectCode ||
    !redirectType ||
    invalidTargetPath;

  const urlValidation = (url: string) => {
    const isValidUrl = validateUrl(url);
    setInvalidTargetPath(!isValidUrl);
    return isValidUrl;
  };
  const resetForm = () => {
    setPaths([{ id: new Date().getTime() + 1000, path: "" }]);
    setRedirectCode(301);
    setRedirectType("page");
    setRedirectTarget(null);
    setRedirectTargetPath("");
  };

  const publishingMap: PublishingsMap = useMemo(() => {
    if (isLoading) return {};
    return [...publishings]
      ?.sort((a, b) => a.version - b.version)
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
  }, [publishings, languages, isLoading]);

  const handleSubmit = useCallback(
    async (submitType: "multiple" | "single") => {
      setSubmitType(submitType);
      const redirectsPaths: string[] = paths
        ?.map((iPath) => iPath?.path?.trim())
        .filter(Boolean);

      const requestData = {
        targetType: redirectType,
        code: redirectCode,
        target: targetPath,
      };

      const response = await createRedirects({
        ...requestData,
        paths: redirectsPaths,
      });

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
            message: `${redirectsPaths?.length} Redirect${
              redirectsPaths?.length > 1 ? "s" : ""
            } Created`,
          })
        );
      }

      const resubmitData = {
        ...requestData,
        errors: errorPaths,
      };

      if (!!errorPaths?.length) openErrorDialog(resubmitData);
    },
    [paths, redirectType, targetPath, redirectCode]
  );

  useEffect(() => {
    if (redirectType !== "external") setInvalidTargetPath(false);
  }, [redirectType]);

  return (
    <>
      <Dialog
        data-cy="CreateRedirectDialog"
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
                Create Redirect
              </Typography>
              <Typography
                variant="body3"
                fontWeight={600}
                color="text.secondary"
                noWrap
                flexGrow={0}
              >
                Your new redirects will go live immediately after they're
                created.
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
                  Incoming paths are case-insensitive and trailing slashes are
                  automatically handled
                </Typography>

                <Box
                  width="100%"
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
                      <PathInputField
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
                                item.id === path.id
                                  ? { ...item, path: "" }
                                  : item
                              )
                            );
                            if (!!lastPathRef?.current) {
                              lastPathRef.current.focus();
                            }
                          } else {
                            setPaths((prev) =>
                              prev.filter(
                                (prevPath) => prevPath.id !== path?.id
                              )
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

              <Box>
                <Button
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
            </Box>

            <FieldWrapper label="HTTP Code" tooltip={TOOL_TIPS.code}>
              <TextField
                select
                defaultValue={301}
                size="small"
                fullWidth
                value={redirectCode}
                onChange={(e: any) => setRedirectCode(e.target.value)}
              >
                {HTTP_CODE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </FieldWrapper>

            <FieldWrapper label="Type" tooltip={TOOL_TIPS.targetType}>
              <TextField
                select
                defaultValue="page"
                size="small"
                fullWidth
                value={redirectType}
                onChange={(e: any) => setRedirectType(e.target.value)}
              >
                {TARGET_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </FieldWrapper>
            <FieldWrapper label="Redirect Target" tooltip="File Path Only">
              {redirectType === "page" ? (
                <TargetInputField
                  publishings={publishingMap}
                  languages={languages}
                  isLoading={isLoading}
                  value={redirectTarget}
                  onChange={setRedirectTarget}
                />
              ) : (
                <PathInputField
                  placeHolder="Enter URL (e.g. https://www.google.com/)"
                  value={redirectTargetPath}
                  onChange={(e) => {
                    setRedirectTargetPath(e);
                  }}
                  prefix={redirectType === "external" ? "" : "/"}
                  validation={
                    redirectType === "external" ? urlValidation : null
                  }
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
            justifyContent: "space-between",
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
            <LoadingButton
              data-cy="DeleteContentItemConfirmButton"
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              size="medium"
              disabled={isDisabled}
              loading={submitType === "multiple" && isCreatingRedirect}
              onClick={() => handleSubmit("multiple")}
            >
              Create Another Redirect
            </LoadingButton>
            <LoadingButton
              data-cy="RedirectsCreateButton"
              variant="contained"
              color="primary"
              size="medium"
              disabled={isDisabled}
              loading={submitType === "single" && isCreatingRedirect}
              onClick={() => handleSubmit("single")}
            >
              Create Redirect
            </LoadingButton>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

type FieldWrapperProps = {
  label: string;
  tooltip?: string | ReactNode;
  children: ReactNode;
};

export const FieldWrapper: FC<FieldWrapperProps> = ({
  label,
  tooltip,
  children,
}: FieldWrapperProps) => {
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
      {children}
    </Box>
  );
};

export default CreateForm;
