import { FC, useEffect, useRef, useState } from "react";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import Button from "@mui/material/Button";
import { importCSVFile, IMPORT_REDIRECTS } from "../../../store/imports";
import { useRedirectsTable } from "../RedirectsTable/RedirectsTableContextProvider";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  Box,
  Stack,
  Typography,
  DialogActions,
  Link,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LoadingButton from "@mui/lab/LoadingButton";

const RedirectsImport: FC = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { redirects } = useRedirectsTable();

  const clearFiles = () => {
    setFiles(null);
    fileInputRef.current!.value = "";
  };

  const importFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsLoading(true);
    const file = files[0];
    const importRes = await importCSVFile(file, redirects, dispatch);

    if (importRes.status === "error") {
      dispatch({
        type: IMPORT_REDIRECTS,
        redirects: [],
      });

      setIsOpen(true);
    } else {
      setTimeout(() => {
        dispatch({
          type: IMPORT_REDIRECTS,
          redirects: importRes?.targets,
        });
      }, 250);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    importFiles(files);
  }, [files]);

  return (
    <>
      <Button
        component="label"
        role={undefined}
        variant="outlined"
        color="inherit"
        tabIndex={-1}
        size="small"
        startIcon={<FileUploadRoundedIcon color="action" />}
      >
        Import CSV/XML
        <input
          ref={fileInputRef}
          hidden
          type="file"
          onChange={(event) => setFiles(event.target.files)}
        />
      </Button>

      <ImportErrorDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onRetry={() => importFiles(files)}
        clearFiles={clearFiles}
        isLoading={isLoading}
      />
    </>
  );
};

export type ImportErrorDialogProps = {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  clearFiles: () => void;
  isLoading: boolean;
};

export const ImportErrorDialog: FC<ImportErrorDialogProps> = ({
  open,
  onClose,
  onRetry,
  clearFiles,
  isLoading,
}) => {
  const handleCancel = () => {
    clearFiles();
    onClose();
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={handleCancel}>
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "red.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <WarningAmberIcon color="error" />
        </Box>
        <Stack
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          alignItems="center"
          columnGap={1}
          overflow="hidden"
          textOverflow="ellipsis"
        >
          <Typography
            data-cy="RedirectsImportErrorDialogHeader"
            variant="inherit"
            fontWeight={700}
            flexGrow={0}
            flexShrink={0}
          >
            File Import Failed
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mt="8px">
          The file format or structure doesn't match what we expected. Please
          check your CSV or XML file and refer to our&nbsp;
          <Link
            href="https://docs.zesty.io/docs/redirects#mass-redirect"
            target="_blank"
            sx={{
              color: "info.main",
              textDecoration: "underline",
              textDecorationColor: "info.main",
            }}
          >
            import guide
          </Link>
          &nbsp;in our docs for the correct format.
        </Typography>
      </DialogTitle>
      <DialogActions sx={{ p: "20px" }}>
        <Button variant="text" color="inherit" onClick={handleCancel}>
          Cancel
        </Button>
        <LoadingButton
          data-cy="RedirectsImportRetryButton"
          variant="contained"
          color="primary"
          onClick={onRetry}
          loading={isLoading}
        >
          Try Again
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default RedirectsImport;
