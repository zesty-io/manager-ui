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
import {
  dismissFileUploads,
  fileUploadStage,
} from "../../../../../../shell/store/media-revamp";
import { UploadHeaderText } from "../UploadModal";
import { AppState } from "../../../../../../shell/store/types";
import { UploadThumbnail } from "../UploadThumbnail";
import { mediaManagerApi } from "../../../../../../shell/services/mediaManager";
import { FileTypePreview } from "./FileTypePreview";
import { useGetCurrentUserRolesQuery } from "../../../../../../shell/services/accounts";
import instanceZUID from "../../../../../../utility/instanceZUID";
import { NoPermission } from "../../../../../../shell/components/NoPermission";

type ReplaceFileModalProps = {
  originalFile: ZestyMediaFile;
  onClose: () => void;
  onCancel: () => void;
};
export const ReplaceFileModal = ({
  onClose,
  originalFile,
  onCancel,
}: ReplaceFileModalProps) => {
  const dispatch = useDispatch();
  const [newFile, setNewFile] = useState<File>(null);
  const [showUploadingFileModal, setShowUploadingFileModal] = useState(false);
  const hiddenFileInput = useRef(null);
  const { data: currentUserRoles } = useGetCurrentUserRolesQuery();
  const uploads = useSelector((state: AppState) => state.mediaRevamp.uploads);
  const filesToUpload = uploads.filter((upload) => upload.status !== "failed");

  const canReplaceImage = currentUserRoles
    ?.filter((role) => role.entityZUID === instanceZUID)
    ?.some((role) => ["admin", "owner"].includes(role.name?.toLowerCase()));

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
      setNewFile(null);
    }
  }, [newFile]);

  const handleCloseUploadingFileModal = () => {
    dispatch(dismissFileUploads());

    if (filesToUpload.length) {
      dispatch(
        mediaManagerApi.util.invalidateTags([
          { type: "GroupData", id: originalFile.group_id },
          "BinFiles",
        ])
      );
    }

    onClose();
  };

  if (!canReplaceImage) {
    return (
      <NoPermission
        onClose={onCancel}
        headerTitle="You do not have permission to replace files in this instance."
        headerSubtitle="Contact the instance owner or administrators listed below to upgrade your role to Admin or Owner for the replace file capability."
      />
    );
  }

  if (showUploadingFileModal) {
    return (
      <Dialog
        open
        onClose={handleCloseUploadingFileModal}
        sx={{
          "& .MuiDialogContent-root": {
            width: 540,
            boxSizing: "border-box",
          },
        }}
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
          <UploadHeaderText
            uploads={uploads}
            headerKeyword="Replaced File"
            showCount={false}
          />
          <IconButton onClick={handleCloseUploadingFileModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {!!filesToUpload.length && (
            <Box pt={2.5}>
              <UploadThumbnail
                file={filesToUpload.slice(-1)?.[0]}
                action="replace"
                originalFile={originalFile}
                showRemove={false}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={handleCloseUploadingFileModal}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open onClose={onCancel} maxWidth="xs">
        <DialogTitle>
          <Box
            width={120}
            height={120}
            mb={1.5}
            sx={{
              "& .MuiBox-root": {
                borderRadius: 2,
              },
            }}
          >
            <FileTypePreview
              src={originalFile?.url}
              filename={originalFile?.filename}
              updatedAt={originalFile?.updated_at}
              imageSettings={{
                width: 120,
              }}
            />
          </Box>
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
            The original file will be deleted and replaced by its new file. This
            action cannot be undone and the file cannot be recovered. The file
            will retain its URL and ZUID.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onCancel}>
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
