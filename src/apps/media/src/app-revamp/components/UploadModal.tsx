import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Thumbnail } from "./Thumbnail";

export const UploadModal: FC = () => {
  const dispatch = useDispatch();
  const filesToUpload: File[] = useSelector(
    (state: any) => state.mediaRevamp.filesToUpload
  );

  return (
    <>
      <Dialog open={Boolean(filesToUpload?.length)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {filesToUpload.length} Files Selected for Upload
        </DialogTitle>
        <DialogContent>
          {filesToUpload.map((f) => (
            <Thumbnail
              filename={f.name}
              src="https://placekitten.com/g/200/200"
            />
          ))}
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
