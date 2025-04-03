import { memo, useState, useCallback } from "react";
import { useHistory } from "react-router";
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
import { removeRedirect } from "../../../store/redirects";
import { notify } from "../../../../../../shell/store/notifications";
import { DialogContent } from "@mui/material";
import { RedirectTargetCell } from "./RedirectTargetCell";
import { CellWrapper } from "./RedirectTable";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  ZUID: string;
  path: string;
  type: string;
  target: string;
  code: number;
}

export const DeleteDialog = memo(function DeleteDialog(
  props: DeleteDialogProps
) {
  const { open, onClose, ZUID, path, type, target, code } = props;

  const [deleting, setDeleting] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleDeleteFile = () => {
    if (!ZUID) return;

    try {
      setDeleting(true);
      Promise.resolve(dispatch(removeRedirect(ZUID))).then((res: any) => {
        setDeleting(false);
        onClose();
        if (res.status === 200) {
          dispatch(
            notify({
              kind: "error",
              message: `Redirect Delete: ${path}`,
            })
          );
        } else {
          throw new Error(`Redirect Delete failed: ${path}`);
        }
      });
    } catch (err) {
      setDeleting(false);
      onClose();
    }
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
            Delete Redirect:
          </Typography>
          <Typography variant="inherit" fontWeight={600} noWrap flexGrow={0}>
            {`${path}`}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: "8px" }}>
          Deleting this redirect will remove it immediately from your site. This
          cannot be undone.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="text.primary"
          mb="10px"
          fontWeight={700}
        >
          More details
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          sx={{
            border: "1px solid",
            borderColor: "grey.100",
            borderRadius: "8px",
          }}
        >
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            px="16px"
            py="14px"
          >
            <Typography
              variant="body2"
              color="text.primary"
              width="160px"
              flexGrow={0}
              flexShrink={0}
              fontWeight={700}
            >
              HTTP Code
            </Typography>
            <Typography variant="body2" color="text.primary" flexGrow={1}>
              {code}
            </Typography>
          </Box>

          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            px="16px"
            py="14px"
            borderTop="1px solid"
            borderBottom="1px solid"
            borderColor="grey.100"
          >
            <Typography
              variant="body2"
              color="text.primary"
              width="160px"
              flexGrow={0}
              flexShrink={0}
              fontWeight={700}
            >
              Redirect Type
            </Typography>
            <Typography variant="body2" color="text.primary" flexGrow={1}>
              {type === "page"
                ? "Internal"
                : type === "path"
                ? "Wildcard"
                : type}
            </Typography>
          </Box>

          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            px="16px"
            py="14px"
          >
            <Typography
              variant="body2"
              color="text.primary"
              width="160px"
              flexGrow={0}
              flexShrink={0}
              fontWeight={700}
            >
              Redirect Target
            </Typography>
            <Typography
              variant="body2"
              color="info.main"
              flexGrow={1}
              display="flex"
              alignItems="center"
              gap="4px"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              <RedirectTargetCell
                wrapper={CellWrapper}
                target={target}
                targetType={type}
              />
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          data-cy="DeleteContentItemConfirmButton"
          variant="contained"
          color="error"
          onClick={handleDeleteFile}
          loading={deleting}
        >
          Delete Forever
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
});
