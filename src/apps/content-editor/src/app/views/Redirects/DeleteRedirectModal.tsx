import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Stack,
  Button,
  DialogActions,
  Link,
} from "@mui/material";
import { DeleteRounded, Description, HiveRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { useDispatch } from "react-redux";

import { useDomain } from "../../../../../../shell/hooks/use-domain";
import { useDeleteRedirectMutation } from "../../../../../../shell/services/instance";
import { notify } from "../../../../../../shell/store/notifications";
import {
  Redirects,
  RedirectsTargetType,
} from "../../../../../../shell/services/types";

const HTTP_CODE_OPTIONS = {
  301: "301 - Permanent Redirect",
  302: "302 - Temporary Redirect",
} as const;

type DeleteRedirectModalProps = {
  targetPath: string;
  data: Redirects;
  onClose: () => void;
};
export const DeleteRedirectModal = ({
  targetPath,
  data,
  onClose,
}: DeleteRedirectModalProps) => {
  const domain = useDomain();
  const dispatch = useDispatch();
  const [
    deleteRedirect,
    { isLoading: isDeletingRedirect, isSuccess: isRedirectDeleted },
  ] = useDeleteRedirectMutation();

  useEffect(() => {
    if (isRedirectDeleted) {
      onClose();
      dispatch(
        notify({
          message: `Redirect Deleted: ${data.path}`,
          kind: "error",
        })
      );
    }
  }, [isRedirectDeleted]);

  const onHandleDelete = () => {
    deleteRedirect({ ZUID: data.ZUID });
  };

  return (
    <Dialog
      open
      slotProps={{
        paper: {
          sx: {
            maxWidth: 480,
          },
        },
      }}
      onClose={onClose}
    >
      <DialogTitle>
        <Stack gap={1.5}>
          <Box
            sx={{
              backgroundColor: "red.100",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DeleteRounded color="error" />
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" display="inline" fontWeight={700}>
                Delete Redirect:&nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {data.path}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Deleting this redirect will remove it immediately from your site.
              This action cannot be undone.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" fontWeight={700} mb={2.5}>
          More details
        </Typography>
        <Stack width="100%" border={1} borderColor="border" borderRadius={2}>
          <Stack direction="row" height={54} alignItems="center" px={2}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ flexBasis: 160 }}
            >
              HTTP Code
            </Typography>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {HTTP_CODE_OPTIONS[data.code as keyof typeof HTTP_CODE_OPTIONS]}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            height={54}
            alignItems="center"
            borderTop={1}
            borderBottom={1}
            borderColor="border"
            px={2}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ flexBasis: 160 }}
            >
              Redirect Type
            </Typography>
            <RedirectType type={data.targetType} />
          </Stack>
          <Stack direction="row" height={54} alignItems="center" px={2}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ flexBasis: 160 }}
            >
              Redirect Target
            </Typography>
            <Link
              variant="body2"
              href={`${domain}${targetPath}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ flex: 1 }}
            >
              {targetPath}
            </Link>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={isDeletingRedirect}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="error"
          onClick={onHandleDelete}
          loading={isDeletingRedirect}
        >
          Delete Forever
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

const RedirectType = ({ type }: { type: RedirectsTargetType }) => {
  if (type === "path") {
    return (
      <Stack direction="row" alignItems="center" gap={1.5}>
        <HiveRounded fontSize="small" color="action" />
        <Typography variant="body2" sx={{ flex: 1 }}>
          Wildcard
        </Typography>
      </Stack>
    );
  }

  if (type === "page") {
    return (
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Description fontSize="small" color="action" />
        <Typography variant="body2" sx={{ flex: 1 }}>
          Internal
        </Typography>
      </Stack>
    );
  }

  return <></>;
};
