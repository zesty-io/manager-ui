import { FC, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";

import { DialogContent, TextField, MenuItem } from "@mui/material";
import { ShuffleVariant } from "@zesty-io/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../shell/store/notifications";
import { useRedirectsDialog } from "../../../../../seo/src/app/components/RedirectsDialogProvider";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  ContentItemProps,
  TARGET_OPTIONS,
  TOOL_TIPS,
} from "../../../../../seo/src/app/components/RedirectsDialogProvider/constants";
import { FieldWrapper } from "../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/CreateForm";
import SearchField from "../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/SearchField";
import PathField from "../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/PathField";
export type ContentRedirectModalProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  currentItem: ContentItemProps | null;
  options: ContentItemProps[];
};

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

export const ContentRedirectModal: FC<ContentRedirectModalProps> = ({
  open,
  onClose,
  loading,
  currentItem,
  options,
}) => {
  const dispatch = useDispatch();
  const [targetInternal, setTargetInternal] = useState<ContentItemProps>(null);
  const [targetPath, setTargetPath] = useState<string>("");
  const [targetType, setTargetType] = useState<RedirectsTargetType>("page");
  const target = targetType === "page" ? targetInternal?.ZUID : targetPath;
  const [invalidTarget, setInvalidTarget] = useState<boolean>(false);

  const {
    openErrorDialog,
    isLoading: isRedirectsLoading,
    createRedirects,
  } = useRedirectsDialog();

  const isLoading = isRedirectsLoading || loading;

  const handleCreateRedirect = async () => {
    const requestData = {
      targetType: targetType as RedirectsTargetType,
      target: target,
      paths: [currentItem?.path],
      code: 301 as RedirectsCodes,
    };

    const changeResponse = await createRedirects(requestData);

    const errorPaths = changeResponse
      ?.filter((item: any) => item?.status === "error")
      .map((item: any) => ({
        error: item?.message,
        path: item?.path,
      }));

    if (!!errorPaths?.length) onClose();

    if (!errorPaths?.length) {
      dispatch(
        notify({
          kind: "success",
          message: `1 Redirect Created`,
        })
      );
    } else {
      const resubmitData = {
        ...requestData,
        errors: errorPaths,
      };

      openErrorDialog(resubmitData);
    }
    onClose();
  };

  const urlValidation = (url: string) => {
    const isValidUrl = validateUrl(url);
    setInvalidTarget(!isValidUrl);
    return isValidUrl;
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            minHeight: "565px",
          },
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            bgcolor: "deepOrange.50",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <ShuffleVariant color="primary" />
        </Box>
        <Typography
          data-cy="RedirectsDeleteDialogHeader"
          variant="inherit"
          fontWeight={700}
          flexGrow={0}
          flexShrink={0}
        >
          Redirect this Content Item
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Once your redirect your content item, it will be unpublished and users
          won't be able to access this content item at its current URL. They'll
          be automatically sent to the destination URL you provide.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }} data-cy="RedirectsDeleteDialog">
        <Box
          width="100%"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          rowGap={1.5}
          py={0}
          px={2.5}
        >
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="space-between"
          >
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={600}
              noWrap
            >
              OLD PATH
            </Typography>
            <Typography variant="body2" color="info.dark">
              {currentItem?.path}
            </Typography>
            <Box display="flex" flexDirection="row" width="100%" my={1}>
              <ArrowDownwardIcon color="action" fontSize="small" />
            </Box>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={600}
              noWrap
              mb={2.5}
            >
              NEW PATH
            </Typography>
            <Box
              width="100%"
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
              rowGap={2.5}
            >
              <FieldWrapper label="Type" tooltip={TOOL_TIPS.targetType}>
                <TextField
                  data-cy="RedirectsTypeSelector"
                  select
                  defaultValue="page"
                  size="small"
                  fullWidth
                  value={targetType}
                  onChange={(e: any) => {
                    setTargetType(e.target.value);
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
              >
                {targetType === "page" ? (
                  <SearchField
                    options={options?.filter(
                      (option) => option?.ZUID !== currentItem?.ZUID
                    )}
                    loading={isLoading}
                    value={targetInternal}
                    defaultValue={targetPath}
                    onChange={setTargetInternal}
                  />
                ) : (
                  <PathField
                    testId="RedirectsExternalFieldPath"
                    placeHolder="Enter URL (e.g. https://www.google.com/)"
                    value={targetPath}
                    onChange={(value) => {
                      setTargetPath(value);
                    }}
                    validation={
                      targetType === "external" ? urlValidation : null
                    }
                  />
                )}
              </FieldWrapper>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 3.75 }}>
        <Button variant="text" color="inherit" onClick={onClose}>
          Don't Create
        </Button>
        <LoadingButton
          data-cy="RedirectContentItemConfirmButton"
          variant="contained"
          color="primary"
          onClick={handleCreateRedirect}
          loading={isRedirectsLoading}
          disabled={isRedirectsLoading || invalidTarget || !target}
        >
          Create Redirect
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
