import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../shell/store/types";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { UploadThumbnail } from "./UploadThumbnail";
import { dismissFileUploads } from "../../../../../shell/store/media-revamp";
import { Typography, IconButton, Grid, Alert, AlertTitle } from "@mui/material";
import { DnDProvider } from "./DnDProvider";
import { UploadButton } from "./UploadButton";
import CloseIcon from "@mui/icons-material/Close";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";

export const UploadModal: FC = () => {
  const dispatch = useDispatch();
  const uploads = useSelector((state: AppState) => state.mediaRevamp.uploads);
  const filesToUpload = useSelector((state: AppState) =>
    state.mediaRevamp.uploads.filter((upload) => upload.status !== "failed")
  );
  const ids = filesToUpload.length && {
    currentBinId: filesToUpload[0].bin_id,
    currentGroupId: filesToUpload[0].group_id,
  };
  const [loading, setLoading] = useState(false);

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await dispatch(dismissFileUploads());
    } finally {
      setLoading(false);
    }
    if (filesToUpload.length) {
      dispatch(
        mediaManagerApi.util.invalidateTags([
          { type: "GroupData", id: ids.currentGroupId },
          "BinFiles",
        ])
      );
    }
  };

  return (
    <>
      <Dialog
        open={Boolean(uploads.length)}
        fullWidth
        onClose={handleDismiss}
        PaperProps={{
          style: {
            maxWidth: "1120px",
          },
        }}
        sx={{
          "*::-webkit-scrollbar-track-piece": {
            backgroundColor: (theme) => `${theme.palette.grey[100]} !important`,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: (theme) => `${theme.palette.grey[300]} !important`,
          },
        }}
      >
        <IconButton
          onClick={handleDismiss}
          sx={{
            position: "fixed",
            zIndex: 999,
            right: 5,
            top: 0,
          }}
        >
          <CloseIcon sx={{ color: "common.white" }} />
        </IconButton>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={handleDismiss}>
              <ArrowBackRoundedIcon fontSize="small" color="action" />
            </IconButton>
            <Typography variant="h5" color="text.secondary">
              {filesToUpload.length} Files Selected for Upload
            </Typography>
          </Box>
          <UploadButton {...ids} text="Upload More" variant="outlined" />
        </DialogTitle>
        <DialogContent
          sx={{
            mt: 2,
            display: "flex",
            height: "489px",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <UploadErrors />
          <DnDProvider {...ids} sx={{ flexWrap: "wrap" }}>
            <Grid container spacing={3}>
              {filesToUpload.map((file) => {
                return (
                  <Grid
                    item
                    xs={4}
                    key={file.uploadID}
                    sx={{
                      position: "relative",
                      height: "442px",
                    }}
                  >
                    <UploadThumbnail file={file} />
                  </Grid>
                );
              })}
            </Grid>
          </DnDProvider>
        </DialogContent>
        <DialogActions
          sx={{
            pt: 2.5,
            borderTop: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          {/* <Button
            color="inherit"
            variant="text"
            disabled={loading}
            onClick={handleDismiss}
          >
            Close
          </Button> */}
          <Button
            color="primary"
            variant="contained"
            disabled={loading}
            onClick={handleDismiss}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const UploadErrors = () => {
  const uploads = useSelector((state: AppState) => state.mediaRevamp.uploads);
  const failedUploads = uploads.filter((upload) => upload.status === "failed");
  if (failedUploads.length === 0) return null;
  return (
    <Alert severity="error">
      <AlertTitle>
        Unfortunately, we had trouble uploading the {failedUploads.length}{" "}
        files:
      </AlertTitle>
      <>
        {failedUploads.map((file, idx) => {
          return (
            <Box>
              {idx + 1}. {file.filename}
            </Box>
          );
        })}
        <Box sx={{ mt: 2 }}>Please check the file extensions and try again</Box>
      </>
    </Alert>
  );
};
