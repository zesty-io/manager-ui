import { FC, useEffect, useState } from "react";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";

import {
  DialogContent,
  TextField,
  MenuItem,
  Paper,
  Skeleton,
} from "@mui/material";
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
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import {
  ContentItemProps,
  TARGET_OPTIONS,
  TOOL_TIPS,
} from "../../../../../seo/src/app/components/RedirectsDialogProvider/constants";
import { FieldWrapper } from "../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/CreateForm";
import SearchField, {
  ListOption,
} from "../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/SearchField";
import PathField from "../../../../../seo/src/app/components/RedirectsDialogProvider/CreateRedirects/PathField";
import { useTargetListOptions } from "../../../../../seo/src/app/components/RedirectsDialogProvider/useTargetListOptions";

export type ContentRedirectModalProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  options: ContentItemProps[];
  redirect?: ContentItemProps | null;
  newPath?: string;
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
  options,
  redirect,
  newPath,
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
      targetType: "page" as RedirectsTargetType,
      target: target,
      paths: [newPath],
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
        <Typography variant="body2" color="text.secondary" sx={{ mt: "8px" }}>
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
          rowGap="12px"
          py={0}
          px="20px"
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
              {redirect?.path}
              {/* articles/trailblazing-washingtons-beauty-unraveling-the-top-5-hiking-trails */}
            </Typography>
            <Box display="flex" flexDirection="row" width="100%" my={1}>
              <ArrowDownwardIcon color="action" fontSize="small" />
            </Box>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={600}
              noWrap
              mb="20px"
            >
              NEW PATH
            </Typography>
            <Box
              width="100%"
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
              rowGap="20px"
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
                    options={options}
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
                    onChange={(e) => {
                      setTargetPath(e);
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
      <DialogActions sx={{ p: "20px", pl: "20px", pr: "20px", pt: "30px" }}>
        <Button variant="text" color="inherit" onClick={onClose}>
          Don't Create
        </Button>
        <LoadingButton
          data-cy="DeleteContentItemConfirmButton"
          variant="contained"
          color="primary"
          onClick={handleCreateRedirect}
          loading={isRedirectsLoading}
        >
          Create Redirect
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
