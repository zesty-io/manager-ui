import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../shell/store/types";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { UploadThumbnail } from "./UploadThumbnail";
import {
  UploadFile,
  StoreFile,
  dismissFileUploads,
} from "../../../../../shell/store/media-revamp";
import { Typography } from "@mui/material";
import { DnDProvider } from "./DnDProvider";
import { UploadButton } from "./UploadButton";
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

  const handleDismiss = () => {
    dispatch(dismissFileUploads());
    if (filesToUpload.length) {
      dispatch(
        mediaManagerApi.util.invalidateTags([
          { type: "GroupData", id: ids.currentGroupId },
          { type: "BinFiles", id: ids.currentBinId },
        ])
      );
    }
  };

  return (
    <>
      <Dialog open={Boolean(uploads.length)} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">
            {filesToUpload.length} Files Selected for Upload
          </Typography>
          <UploadButton {...ids} text="Upload More" />
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            height: "60vh",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <UploadErrors />
          <DnDProvider {...ids} sx={{ flexWrap: "wrap" }}>
            {filesToUpload.map((file) => {
              return (
                <Box
                  key={file.uploadID}
                  sx={{
                    height: "300px",
                    pl: "8px",
                    pr: "8px",
                    position: "relative",
                  }}
                >
                  <UploadThumbnail file={file} />
                </Box>
              );
            })}
          </DnDProvider>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={handleDismiss}>
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={filesToUpload.some(
              (file) => file.status === "inProgress" || file.status === "staged"
            )}
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
    <Box sx={{ backgroundColor: "error" }}>
      <Typography variant="body2">
        Unfortunately, we had trouble uploading the following files:
      </Typography>
      <Typography component="ul" variant="body2">
        {failedUploads.map((file) => {
          return <Box component="li">{file.filename}</Box>;
        })}
      </Typography>
      <Typography variant="body2">Please try again</Typography>
    </Box>
  );
};
