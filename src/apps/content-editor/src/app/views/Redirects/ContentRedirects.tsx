import { FC, useEffect, useState } from "react";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { DeleteRounded } from "@mui/icons-material";

import { Paper, Skeleton } from "@mui/material";
import {
  Redirects,
  RedirectsCodes,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../shell/store/notifications";
import LoadingButton from "@mui/lab/LoadingButton";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import { ContentItemProps } from "../../../../../seo/src/app/components/RedirectsDialogProvider/constants";
import { ContentRedirectModal } from "./ContentRedirectModal";
import { useDeleteRedirectMutation } from "../../../../../../shell/services/instance";
import DescriptionIcon from "@mui/icons-material/Description";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

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

const RedirectItem = ({
  ZUID,
  targetType,
  path,
  target,
  langCode,
  label,
  isLoading = false,
}: {
  ZUID: string;
  targetType: RedirectsTargetType;
  path: string;
  target: string;
  langCode: string;
  label: string;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return <Skeleton variant="rounded" height={52} width="100%" />;
  }
  return (
    <>
      {targetType !== "page" ? (
        <Typography variant="body2">{target}</Typography>
      ) : (
        <Box
          key={ZUID}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          flexGrow={1}
          columnGap="12px"
          sx={{
            pl: "8px",
            width: "100%",
            height: "52px",
          }}
        >
          {targetType === "page" ? (
            <DescriptionIcon fontSize="small" color="action" />
          ) : (
            <FormatListBulletedIcon fontSize="small" color="action" />
          )}
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="stretch"
            flexGrow={1}
            sx={{
              overflow: "hidden",
              position: "relative",
              boxSizing: "border-box",
            }}
          >
            <Typography
              variant="body2"
              color="text.primary"
              noWrap
              textOverflow="ellipsis"
              overflow="hidden"
              fontWeight={500}
              px="2px"
            >
              {`(${langCode}) ${label?.trim()}`}
            </Typography>
            <Typography
              variant="body2"
              color="info.dark"
              noWrap
              textOverflow="ellipsis"
              maxWidth="100%"
              overflow="hidden"
              px="2px"
            >
              {target}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
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
  const [redirection, setRedirection] = useState<Redirects | null>(null);
  const [redirectOption, setRedirectOption] = useState<ContentItemProps | null>(
    null
  );
  const currentItem = options?.find((option) => option?.ZUID === itemZUID);

  useEffect(() => {
    const redirectData = redirects?.find(
      (redirect) => redirect?.path === currentItem?.path
    );

    const redirectsTo = options?.find(
      (option) => option?.ZUID === redirectData?.target
    );

    if (!!redirectData) {
      setRedirectOption(redirectsTo);
      setRedirection(redirectData);
      setIsRedirected(true);
    } else {
      setRedirectOption(null);
      setRedirection(null);
      setIsRedirected(false);
    }
  }, [options, itemZUID, redirects, currentItem]);
  return (
    <>
      {isLoading ? (
        <ContentRedirectsSkeleton />
      ) : (
        <Box
          width={640}
          flexGrow={0}
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
              sx={{
                width: "100%",

                py: "6px",
                px: 1,
                borderColor: "border",
              }}
            >
              <RedirectItem
                ZUID={redirection?.ZUID}
                targetType={redirection?.targetType}
                path={redirection?.path}
                target={
                  redirection?.targetType !== "page"
                    ? redirection?.target
                    : options?.find(
                        (option) => option?.ZUID === redirection?.target
                      )?.path
                }
                langCode={
                  redirection?.targetType !== "page"
                    ? ""
                    : options?.find(
                        (option) => option?.ZUID === redirection?.target
                      )?.langCode
                }
                label={
                  redirection?.targetType !== "page"
                    ? ""
                    : options?.find(
                        (option) => option?.ZUID === redirection?.target
                      )?.label
                }
                isLoading={isLoading}
              />
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
      {isOpen && (
        <ContentRedirectModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          options={options}
          loading={isLoading}
          currentItem={currentItem}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          itemZUID={redirection?.ZUID}
        />
      )}
    </>
  );
};

type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  itemZUID: string;
};

export const ConfirmDeleteModal = (props: ConfirmDeleteModalProps) => {
  const { open, onClose, itemZUID } = props;
  const dispatch = useDispatch();

  const [deleteRedirect, { isLoading: isDeleting }] =
    useDeleteRedirectMutation();

  const handleDeleteRedirects = () => {
    Promise.resolve(deleteRedirect({ ZUID: itemZUID }))
      .then((res) => {
        onClose();
      })
      .catch(() => {
        dispatch(
          notify({
            kind: "error",
            message: `Error deleting redirect`,
          })
        );
      })
      .finally(() => {
        dispatch(
          notify({
            kind: "error",
            message: `1 Redirect Deleted`,
          })
        );
      });
  };

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
          onClick={handleDeleteRedirects}
          loading={isDeleting}
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
