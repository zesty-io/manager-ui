import { memo, useState, useCallback } from "react";
import { useHistory } from "react-router";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";

import { deleteFile } from "../../../../../store/files";

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
import { IconButton } from "@mui/material";

export const Delete = memo(function Delete(props) {
  const { fileZUID, fileName, status } = props;

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteFile = useCallback(() => {
    if (!fileZUID || !status) return;
    setDeleting(true);
    dispatch(deleteFile(fileZUID, status))
      .then((res) => {
        setDeleting(false);
        if (res.status === 200) {
          handleClose();
          history.push("/code");
        }
      })
      .catch((err) => {
        setDeleting(false);
      });
  }, [dispatch, fileZUID, status, history, handleClose]);

  return (
    <>
      {fileName !== "loader" ? (
        <IconButton
          onClick={() => setOpen(true)}
          size="small"
          sx={{ color: "grey.400" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ) : (
        " "
      )}
      <Dialog open={open} fullWidth maxWidth={"xs"} onClose={handleClose}>
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
            <DeleteRounded color="error" />
          </Box>
          <Stack
            mt={1.5}
            display="flex"
            justifyContent="flex-start"
            columnGap={1}
          >
            <Typography variant="inherit" fontWeight={700}>
              Delete File:
            </Typography>
            <Typography variant="inherit" fontWeight={400} noWrap>
              {`${fileName}`}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Deleting a file will remove it and trigger a CDN purge causing A
            production to update immediately.
          </Typography>
        </DialogTitle>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            data-cy="DeleteContentItemConfirmButton"
            variant="contained"
            size="small"
            color="error"
            onClick={handleDeleteFile}
            loading={deleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
