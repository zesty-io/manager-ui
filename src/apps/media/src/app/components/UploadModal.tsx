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
import { theme } from "@zesty-io/material";

import { UploadThumbnail } from "./UploadThumbnail";
import {
  Upload,
  dismissFileUploads,
} from "../../../../../shell/store/media-revamp";
import { DnDProvider } from "./DnDProvider";
import { UploadButton } from "./UploadButton";
import CloseIcon from "@mui/icons-material/Close";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import pluralizeWord from "../../../../../utility/pluralizeWord";

export const UploadModal: FC = () => {
  const dispatch = useDispatch();
  const uploads = useSelector((state: AppState) =>
    state.mediaRevamp.uploads.filter((upload) => !upload.replacementFile)
  );
  const filesToUpload = useSelector((state: AppState) =>
    state.mediaRevamp.uploads.filter(
      (upload) => upload.status !== "failed" && !upload.replacementFile
    )
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
          component="div"
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
                gridTemplateRows: "max-content",
                gridTemplateColumns: "repeat(3, 1fr)",
                [theme.breakpoints.up(1780)]: {
                  gridTemplateColumns: "repeat(4, 1fr)",
                },
                [theme.breakpoints.up(2280)]: {
                  gridTemplateColumns: "repeat(5, 1fr)",
                },
              }}
            >
              {filesToUpload.map((file) => {
                return (
                  <Box position="relative" key={file.uploadID} maxHeight={438}>
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
  headerKeyword?: string;
  showCount?: boolean;
};
export const UploadHeaderText = ({
  uploads,
  headerKeyword = "File",
  showCount = true,
}: UploadHeaderTextProps) => {
  const filesUploading = uploads?.filter(
    (upload) => upload.status === "inProgress"
  );
  const filesUploaded = uploads?.filter(
    (upload) => upload.status === "success"
  );
  const filesProcessed = uploads?.filter(
    (upload) => upload.status === "success" || upload.status === "failed"
  );

  return (
    <Stack direction="row" alignItems="center" gap={1} alignSelf="flex-start">
      {filesUploading?.length > 0 ? (
        <Box position="relative" height={32}>
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
            variant="determinate"
            value={(filesProcessed?.length / uploads?.length) * 100}
            size={32}
            sx={{
              position: "absolute",
              left: 0,
            }}
          />
        </Box>
      ) : (
        <CheckCircleRoundedIcon color="success" sx={{ p: 0.5 }} />
      )}
      <Typography variant="h5" color="text.primary" fontWeight={700}>
        {showCount ? (
          filesUploading?.length > 0 ? (
            filesUploading.length
          ) : (
            filesUploaded.length
          )
        ) : (
          <></>
        )}{" "}
        {filesUploading?.length > 0
          ? pluralizeWord(headerKeyword, filesUploading.length)
          : pluralizeWord(headerKeyword, filesUploaded.length)}{" "}
        {filesUploading?.length > 0 ? "Uploading" : "Uploaded"}
      </Typography>
    </Stack>
  );
};
