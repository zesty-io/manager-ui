import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import Typography from "@mui/material/Typography";

type ConfirmDeleteProps = {
  open: boolean;
  onClose: () => void;
  onDelete: (id: string, label: string) => void;
  labelName?: string;
  zuid: string;
};

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  open,
  onClose,
  onDelete,
  labelName = "",
  zuid,
}) => {
  const handleConfirm = () => {
    onDelete(zuid, labelName);
    onClose();
  };

  return (
    <React.Fragment>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
        <DialogContent
          sx={{
            paddingTop: (theme) => theme.spacing(2.5),
          }}
        >
          <Box
            component="span"
            borderRadius="50%"
            p={1}
            bgcolor="red.100"
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="fit-content"
            sx={{
              aspectRatio: 1,
            }}
          >
            <PauseCircleOutlineRoundedIcon fontSize="medium" color="error" />
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-start"
            alignItems="center"
            my={1}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
              flexGrow={0}
              mr={1}
            >
              Deactivate Status:
            </Typography>
            <Typography
              variant="h5"
              fontWeight={400}
              color="text.secondary"
              flexGrow={1}
            >
              {labelName}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Deactivating this status will remove it from all content items that
            currently have it added. You can always reactivate this status in
            the future.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="text" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="error">
            Deactivate Status
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
export default ConfirmDelete;
