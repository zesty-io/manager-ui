import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Alert,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";

import { File as ZestyMediaFile } from "../../../../../../shell/services/types";
import { fileExtension } from "../../utils/fileUtils";
import { fileUploadStage } from "../../../../../../shell/store/media-revamp";
import { UploadHeaderText } from "../UploadModal";
import { AppState } from "../../../../../../shell/store/types";
import { UploadThumbnail } from "../UploadThumbnail";

type ReplaceFileModalProps = {
  originalFile: ZestyMediaFile;
  onClose: () => void;
};
export const ReplaceFileModal = ({
  onClose,
  originalFile,
}: ReplaceFileModalProps) => {
  const dispatch = useDispatch();
  const [newFile, setNewFile] = useState<File>(null);
  const [showUploadingFileModal, setShowUploadingFileModal] = useState(false);
  const hiddenFileInput = useRef(null);
  const uploads = useSelector((state: AppState) => state.mediaRevamp.uploads);
  const filesToUpload = uploads.filter((upload) => upload.status !== "failed");

  const acceptedExtension =
    fileExtension(originalFile?.url) === "jpg" ||
    fileExtension(originalFile?.url) === "jpeg"
      ? ".jpg, .jpeg"
      : `.${fileExtension(originalFile?.url)}`;

  useEffect(() => {
    if (newFile) {
      dispatch(
        fileUploadStage([
          {
            file: newFile,
            bin_id: originalFile.bin_id,
            group_id: originalFile.group_id,
            replacementFile: true,
          },
        ])
      );
      setShowUploadingFileModal(true);
    }
  }, [newFile]);

  if (showUploadingFileModal) {
    return (
      <Dialog
        open
        onClose={onClose}
        sx={{ "& .MuiPaper-root": { width: 540 } }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <UploadHeaderText uploads={uploads} headerKeyword="Replaced File" />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {!!filesToUpload.length && (
            <UploadThumbnail
              file={filesToUpload[0]}
              action="replace"
              originalFile={originalFile}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="xs">
        <DialogTitle>
          <Box
            component="img"
            src={`${originalFile?.url}?width=120&optimize=high`}
            sx={{
              width: 120,
              height: 120,
              objectFit: "contain",
              borderRadius: 2,
              mb: 1.5,
            }}
          />
          <Typography variant="h5" sx={{ wordBreak: "break-all" }}>
            <Box component="span" fontWeight={700}>
              Replace File:
            </Box>
            &nbsp;
            {originalFile?.filename}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            The original file will be deleted and replaced by it’s new file.
            This action cannot be undone and the file cannot be recovered. The
            file will retain its URL and ZUID.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              hiddenFileInput.current.value = "";
              hiddenFileInput.current.click();
            }}
          >
            Replace
          </Button>
        </DialogActions>
      </Dialog>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={(evt) => {
          setNewFile(evt.target.files[0]);
        }}
        hidden
        accept={acceptedExtension}
        style={{ display: "none" }}
      />
    </>
  );
};
