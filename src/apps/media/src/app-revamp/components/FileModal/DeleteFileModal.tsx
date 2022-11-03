import { FC, useEffect, useState, Dispatch } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  DialogActions,
  IconButton,
  Button,
  Box,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

interface Props {
  onClose?: () => void;
  onDeleteFile?: () => any;
  filename?: string;
  fileCount?: number;
}

export const DeleteFileModal: FC<Props> = ({
  onClose,
  onDeleteFile,
  filename,
  fileCount,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog open={true} fullWidth maxWidth={"xs"}>
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
          }}
        >
          <DeleteRoundedIcon sx={{ color: "red.600" }} />
        </Box>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {fileCount > 1 ? `Delete ${fileCount} Files?` : "Delete File"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {fileCount > 1
            ? "You will not be able to recover these files."
            : `${filename} will be deleted forever`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => onClose()}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          aria-label="Delete Button"
          onClick={() => {
            onDeleteFile();
            onClose();
          }}
        >
          {fileCount > 1 ? `Delete (${fileCount})` : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFileModal;
