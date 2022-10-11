import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { UploadThumbnail } from "./UploadThumbnail";
import { UploadFile } from "../../../../../shell/store/media-revamp";
import { Typography } from "@mui/material";

export const UploadModal: FC = () => {
  const filesToUpload: UploadFile[] = useSelector(
    (state: any) => state.mediaRevamp.temp
  );

  console.log(filesToUpload);

  return (
    <>
      <Dialog open={Boolean(filesToUpload?.length)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h5">
            {filesToUpload.length} Files Selected for Upload
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", height: "60vh", flexWrap: "wrap" }}
        >
          {filesToUpload.map((file, idx) => {
            return (
              <Box
                key={idx}
                sx={{
                  width: "204px",
                  height: "204px",
                  pl: "8px",
                  pr: "8px",
                  position: "relative",
                }}
              >
                <UploadThumbnail file={file} />
              </Box>
            );
          })}
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
