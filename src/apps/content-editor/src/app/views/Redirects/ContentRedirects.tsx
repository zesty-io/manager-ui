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

import { memo, useCallback } from "react";
import { useHistory } from "react-router";

import { Stack } from "@mui/material";
import { DeleteRounded } from "@mui/icons-material";

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
  Redirects,
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
import { ContentRedirectModal } from "./ContentRedirectModal";
import { deleteFile } from "../../../../../code-editor/src/store/files";

const REDIRECTED = {
  button: "Stop Redirecting",
  icon: <StopRoundedIcon color="error" />,
  header: "This Content Item is Currently Being Redirected",
  subHeader:
    "This content item is currently set to redirect users to the destination URL below. Stopping the redirect will allow users to access this content at its original URL again once it is published.",
};
const NOT_REDIRECTED = {
  button: "Redirect this Content Item",
  icon: <ShuffleRoundedIcon color="primary" />,
  header: "Redirect this Content Item",
  subHeader:
    "Once your redirect your content item, it will be unpublished and users won't be able to access this content item at its current URL. They'll be automatically sent to the destination URL you provide.",
};

export type ChangeRedirectProps = {
  targetType: RedirectsTargetType;
  target: string;
  path: string;
  code: RedirectsCodes;
};

export type ContentRedirectsProps = {
  itemZUID: string;
  isLoading: boolean;
  options: ContentItemProps[] | [];
  redirects?: Redirects[] | [];
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

const ContentRedirects: FC<ContentRedirectsProps> = ({
  itemZUID,
  isLoading,
  options = [],
  redirects = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRedirected, setIsRedirected] = useState(false);
  const [redirection, setRedirection] = useState<ContentItemProps | null>(null);

  const currentItem = options?.find((option) => option?.ZUID === itemZUID);

  useEffect(() => {
    // if (!!currentItem) {
    //   setIsRedirected(true);
    // }
    console.debug("currentItem", { itemZUID, currentItem, redirects });
    const redirectData = redirects?.find(
      (redirect) => redirect?.path === currentItem?.path
    );

    const redirectTo = options?.find(
      (option) => option?.ZUID === redirectData?.target
    );

    console.debug("currentItem", {
      itemZUID,
      currentItem,
      redirects,
      redirectData,
      options,
    });
    if (!!redirectTo) {
      setRedirection(redirectTo);
      setIsRedirected(true);
    }
  }, [options, itemZUID, redirects]);
  return (
    <>
      {isLoading ? (
        <ContentRedirectsSkeleton />
      ) : (
        <Box
          width={640}
          flexGrow={0}
          // height={BOTTOM_SECTION_HEIGHT}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          <Typography variant="h5" fontWeight={700} color="text.primary">
            {!!isRedirected ? REDIRECTED.header : NOT_REDIRECTED.header}
          </Typography>
          <Typography variant="body2" color="text.secondary" pt="4px" pb="12px">
            {!!isRedirected ? REDIRECTED.subHeader : NOT_REDIRECTED.subHeader}
          </Typography>
          {!!isRedirected && !!currentItem && (
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ width: "100%", py: "6px", px: 1, borderColor: "border" }}
            >
              <ListOption {...currentItem} isListItem={false} />
            </Paper>
          )}
          <Button
            data-cy="RedirectContentItemButton"
            variant="outlined"
            color={!!isRedirected ? "primary" : "error"}
            startIcon={!!isRedirected ? REDIRECTED.icon : NOT_REDIRECTED.icon}
            onClick={() =>
              !!isRedirected ? setIsDeleteModalOpen(true) : setIsOpen(true)
            }
            sx={{ mt: "12px" }}
          >
            {!!isRedirected ? REDIRECTED.button : NOT_REDIRECTED.button}
          </Button>
        </Box>
      )}
      <ContentRedirectModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        options={options}
        loading={isLoading}
        redirect={redirection}
      />
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  // fileZUID: string;
  // fileName: string;
  // status: string;
}

export const ConfirmDeleteModal = (props: ConfirmDeleteModalProps) => {
  // const { open, onClose, fileZUID, fileName, status } = props;
  const { open, onClose } = props;

  const [deleting, setDeleting] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose}>
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "red.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <DeleteRounded color="error" />
        </Box>
        <Stack
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          columnGap={1}
          overflow="hidden"
          textOverflow="ellipsis"
        >
          <Typography
            variant="inherit"
            fontWeight={700}
            flexGrow={0}
            flexShrink={0}
          >
            Stop Redirecting
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Stopping the redirect will allow users to access this content at its
          original URL again once it is published.
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          data-cy="DeleteContentItemConfirmButton"
          variant="contained"
          color="error"
          // onClick={handleDeleteFile}
          loading={deleting}
          startIcon={<StopRoundedIcon />}
        >
          Stop Redirecting
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export const ContentRedirectsSkeleton = () => {
  return (
    <Box display="flex" flexDirection="column" gap={1.75}>
      <Skeleton variant="rounded" height={24} width={422} />
      <Box display="flex" flexDirection="column" gap={1}>
        <Skeleton variant="rounded" height={12} width={600} />
        <Skeleton variant="rounded" height={12} width={600} />
      </Box>
      <Skeleton variant="rounded" height={38} width={224} />
    </Box>
  );
};

export default ContentRedirects;
