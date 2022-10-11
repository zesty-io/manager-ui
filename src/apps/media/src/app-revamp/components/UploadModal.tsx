import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { UploadThumbnail } from "./UploadThumbnail";
import { UploadFile, StoreFile } from "../../../../../shell/store/media-revamp";
import { Typography } from "@mui/material";
import { DnDProvider } from "./DnDProvider";
import { files } from "../../../../code-editor/src/store/files";
import { UploadButton } from "./UploadButton";

export const UploadModal: FC = () => {
  const filesToUpload: UploadFile[] = useSelector(
    (state: any) => state.mediaRevamp.temp
  );

  const failedUploads: StoreFile[] = useSelector(
    (state: any) => state.mediaRevamp.failedUploads
  );
  console.log(filesToUpload);
  const ids = filesToUpload.length && {
    currentBinId: filesToUpload[0].bin_id,
    currentGroupId: filesToUpload[0].group_id,
  };

  return (
    <>
      <Dialog
        open={Boolean(filesToUpload?.length || failedUploads?.length)}
        maxWidth="lg"
        fullWidth
      >
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
          <UploadErrors></UploadErrors>
          <DnDProvider {...ids} sx={{ flexWrap: "wrap" }}>
            {filesToUpload.map((file, idx) => {
              return (
                <Box
                  key={idx}
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
          <Button color="secondary" variant="text">
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={filesToUpload.some((file) => file.progress !== 100)}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const UploadErrors = () => {
  const failedUploads: StoreFile[] = useSelector(
    (state: any) => state.mediaRevamp.failedUploads
  );
  console.log({ failedUploads });
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
