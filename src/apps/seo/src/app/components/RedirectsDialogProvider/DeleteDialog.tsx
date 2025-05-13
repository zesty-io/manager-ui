import { FC } from "react";
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
import { DeleteRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../../shell/store/notifications";
import { DialogContent } from "@mui/material";

import { useDeleteRedirectMutation } from "../../../../../../shell/services/instance";

export type DeleteRedirectsProps = {
  ZUID: string;
  path: string;
};

export type DeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  redirects: DeleteRedirectsProps[];
};

export const DeleteDialog: FC<DeleteDialogProps> = ({
  open,
  onClose,
  redirects,
}) => {
  const [deleteRedirect, { isLoading: isDeleting }] =
    useDeleteRedirectMutation();

  const dispatch = useDispatch();

  const descriptionPart =
    redirects?.length < 2
      ? `Deleting this redirect for these incoming path`
      : `Deleting these ${redirects?.length} redirects for these incoming paths`;

  const handleDeleteRedirects = () => {
    let inProgressCount = redirects?.length;
    redirects?.forEach((redirect) => {
      deleteRedirect({ ZUID: redirect?.ZUID })
        .then((res: any) => {
          inProgressCount--;
        })
        .finally(() => {
          if (inProgressCount === 0) {
            onClose();
            dispatch(
              notify({
                kind: "error",
                message: `${redirects?.length} Redirect${
                  redirects?.length > 1 ? "s" : ""
                } Deleted`,
              })
            );
          }
        });
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
            data-cy="RedirectsDeleteDialogHeader"
            variant="inherit"
            fontWeight={700}
            flexGrow={0}
            flexShrink={0}
          >
            {`Delete ${redirects?.length} Redirect${
              redirects?.length > 1 ? "s" : ""
            }`}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: "8px" }}>
          {`${descriptionPart} will remove it immediately from your site. This action cannot be undone.`}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }} data-cy="RedirectsDeleteDialog">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          rowGap="20px"
          py={0}
          px="20px"
        >
          {redirects?.map((redirect, index) => (
            <Box
              key={redirect?.ZUID}
              display="flex"
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="baseline"
              columnGap="5px"
            >
              <Typography
                variant="body2"
                color="info.dark"
                width="20px"
                flexGrow={0}
                flexShrink={0}
              >
                {`${index + 1}.`}
              </Typography>
              <Typography
                variant="body2"
                color="info.dark"
                flexGrow={1}
                flexShrink={1}
              >
                {redirect?.path}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: "20px" }}>
        <Button variant="text" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          data-cy="DeleteContentItemConfirmButton"
          variant="contained"
          color="error"
          onClick={handleDeleteRedirects}
          loading={isDeleting}
        >
          Delete Redirects ({redirects?.length})
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
