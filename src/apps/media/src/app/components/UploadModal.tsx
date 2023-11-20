import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../shell/store/types";
import {
  Dialog,
  Box,
  Button,
  Stack,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { UploadThumbnail } from "./UploadThumbnail";
import {
  Upload,
  dismissFileUploads,
} from "../../../../../shell/store/media-revamp";
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
        fullScreen
        onClose={handleDismiss}
        PaperProps={{
          sx: {
            mx: 10,
            my: 2.5,
            maxHeight: "fill-available",
            maxWidth: 3000,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <UploadHeaderText uploads={uploads} />
          <Stack direction="row" gap={1.5} alignItems="center">
            <UploadButton {...ids} text="Upload More" variant="outlined" />
            <IconButton onClick={handleDismiss} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <DnDProvider
            {...ids}
            sx={{ flexWrap: "wrap" }}
            dropAreaOverrides={{
              width: "100%",
              height: "calc(100% - 134px)",
              ml: -2,
              mt: -2,
            }}
          >
            <UploadErrors />
            <Box
              display="grid"
              sx={{
                width: "100%",
                gap: 3,
                "@media (min-width: 1280px)": {
                  gridTemplateColumns: "repeat(3, 1fr)",
                },
                "@media (min-width: 1780px)": {
                  gridTemplateColumns: "repeat(4, 1fr)",
                },

                "@media (min-width: 2280px)": {
                  gridTemplateColumns: "repeat(5, 1fr)",
                },
              }}
            >
              {filesToUpload.map((file) => {
                return (
                  <Box position="relative" key={file.uploadID}>
                    <UploadThumbnail file={file} />
                  </Box>
                );
              })}
            </Box>
          </DnDProvider>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            borderTop: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
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
    <Alert
      severity="error"
      sx={{
        width: "100%",
        height: "fit-content",
      }}
    >
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

type UploadHeaderTextProps = {
  uploads: Upload[];
};
const UploadHeaderText = ({ uploads }: UploadHeaderTextProps) => {
  const filesUploading = uploads?.filter(
    (upload) => upload.status === "inProgress"
  );
  const filesUploaded = uploads?.filter(
    (upload) => upload.status === "success"
  );
  const filesProcessed = uploads?.filter(
    (upload) => upload.status === "success" || upload.status === "failed"
  );

  if (filesUploading?.length > 0) {
    return (
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box position="relative">
          <CircularProgress
            variant="determinate"
            sx={{
              color: (theme) =>
                theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
            }}
            size={32}
            value={100}
          />
          <CircularProgress
            disableShrink
            variant="determinate"
            value={(filesProcessed?.length / uploads?.length) * 100}
            size={32}
            sx={{
              position: "absolute",
              left: 0,
            }}
          />
        </Box>
        <Typography variant="h5" color="text.primary" fontWeight={700}>
          {filesUploading.length} File{filesUploading.length > 1 && "s"}{" "}
          Uploading
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack direction="row" alignItems="center" gap={1.5}>
      <CheckCircleRoundedIcon color="success" />
      <Typography variant="h5" color="text.primary" fontWeight={700}>
        {filesUploaded.length} File{filesUploaded.length > 1 && "s"} Uploaded
      </Typography>
    </Stack>
  );
};
