import { FC } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";

import { DialogContent } from "@mui/material";
import { Redirects } from "../../../../../../../../shell/services/types";
import { ShuffleVariant } from "@zesty-io/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export type RedirectChangeDialogProps = {
  open: boolean;
  onClose: () => void;
  redirect?: Redirects & { urlPath: string };
  newPath?: string;
};

export const RedirectChangeDialog: FC<RedirectChangeDialogProps> = ({
  open,
  onClose,
  redirect,
  newPath,
}) => {
  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose}>
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
          URL Path Change Detected. Create Redirect from the old path to the new
          path?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: "8px" }}>
          This will be a 301 permanent redirect and will ensure visitors using
          the old path are seamlessly directed to the new path.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }} data-cy="RedirectsDeleteDialog">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          rowGap="12px"
          py={0}
          px="20px"
        >
          <Box
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
              {redirect?.urlPath}
            </Typography>
            <Box display="flex" flexDirection="row" width="100%" my={1}>
              <ArrowDownwardIcon color="action" fontSize="small" />
            </Box>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={600}
              noWrap
            >
              NEW PATH
            </Typography>
            <Typography variant="body2" color="info.dark">
              {newPath}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: "20px" }}>
        <Button variant="text" color="inherit" onClick={onClose}>
          Don't Create
        </Button>
        <LoadingButton
          data-cy="DeleteContentItemConfirmButton"
          variant="contained"
          color="primary"
        >
          Create Redirect
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default RedirectChangeDialog;
