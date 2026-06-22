import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
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

const RedirectsImport: FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { redirects } = useRedirectsTable();

  const clearFiles = () => {
    setFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileImport = useCallback(async () => {
    if (!files?.length) return;

    try {
      const file = files[0];
      const importRes = await importCSVFile(file, redirects, dispatch);

      if (importRes.status === "error") {
        dispatch({ type: IMPORT_REDIRECTS, redirects: [] });
        setIsDialogOpen(true);
        return;
      }
      dispatch({ type: IMPORT_REDIRECTS, redirects: importRes.targets });
      clearFiles();
      setIsDialogOpen(false);
    } catch (error) {
      dispatch({ type: IMPORT_REDIRECTS, redirects: [] });
      setIsDialogOpen(true);
    }
  }, [files, redirects, dispatch]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
  };

  const handleRetry = () => {
    clearFiles();
    fileInputRef.current?.click();
  };

  useEffect(() => {
    handleFileImport();
  }, [handleFileImport]);

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
        {t("seo.importCsvXml")}
        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept=".csv,.xml,text/csv,text/xml"
          onChange={handleFileChange}
        />
      </Button>

      <ImportErrorDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onRetry={handleRetry}
        clearFiles={clearFiles}
      />
    </>
  );
};

const ImportErrorDialog: FC<ImportErrorDialogProps> = ({
  open,
  onClose,
  onRetry,
  clearFiles,
}) => {
  const { t } = useTranslation();

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
          >
            {t("seo.importErrorDialogHeader")}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mt="8px">
          <Trans
            i18nKey="seo.importErrorDialogBody"
            components={{
              1: (
                <Link
                  href="https://docs.zesty.io/docs/redirects#mass-redirect"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "info.main",
                    textDecoration: "underline",
                    textDecorationColor: "info.main",
                  }}
                />
              ),
            }}
          />
        </Typography>
      </DialogTitle>
      <DialogActions sx={{ p: "20px" }}>
        <Button variant="text" color="inherit" onClick={handleCancel}>
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="RedirectsImportRetryButton"
          variant="contained"
          color="primary"
          onClick={onRetry}
        >
          {t("seo.tryAgain")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export type ImportErrorDialogProps = {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  clearFiles: () => void;
};

export default RedirectsImport;
