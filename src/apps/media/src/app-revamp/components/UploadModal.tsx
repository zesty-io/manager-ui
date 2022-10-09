import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Thumbnail } from "./Thumbnail";
import { StoreFile } from "../../../../../shell/store/media-revamp";

export const UploadModal: FC = () => {
  const dispatch = useDispatch();
  const filesToUpload: StoreFile[] = useSelector(
    (state: any) => state.mediaRevamp.files
  );

  return (
    <>
      <Dialog open={Boolean(filesToUpload?.length)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {filesToUpload.length} Files Selected for Upload
        </DialogTitle>
        <DialogContent sx={{ display: "flex" }}>
          {filesToUpload.map((f) => {
            console.log(f);
            // TODO fix this styling
            return (
              f &&
              f.filename && (
                <Box
                  sx={{
                    height: "204px",
                    pl: "8px",
                    pr: "8px",
                    position: "relative",
                  }}
                >
                  <Thumbnail
                    key={f.uploadID}
                    filename={f.filename || "Uploading..."}
                    // Is this acceptable?
                    src={f.url}
                  />
                </Box>
              )
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="text">
            Cancel
          </Button>
          <Button color="primary" variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
