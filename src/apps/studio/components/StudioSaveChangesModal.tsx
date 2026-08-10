import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { useTranslation } from "react-i18next";

export type StudioSaveChangeType = "Content" | "Code" | "Block";

export type StudioSaveChangeVersion = {
  version: number;
  // "draft" renders an info-colored chip (an unpublished/new version),
  // "published" renders a success-colored chip (the live version).
  state: "draft" | "published";
};

export type StudioSaveChange = {
  id: string;
  title: string;
  type: StudioSaveChangeType;
  versions: StudioSaveChangeVersion[];
};

type StudioSaveChangesModalProps = {
  open: boolean;
  changes: StudioSaveChange[];
  isSaving: boolean;
  canSave: boolean;
  canPublish: boolean;
  onCancel: () => void;
  onSaveAll: () => void;
  onSaveAndPublishAll: () => void;
};

export const StudioSaveChangesModal = ({
  open,
  changes,
  isSaving,
  canSave,
  canPublish,
  onCancel,
  onSaveAll,
  onSaveAndPublishAll,
}: StudioSaveChangesModalProps) => {
  const { t } = useTranslation();

  const typeLabels: Record<StudioSaveChangeType, string> = {
    Content: t("content.studioSaveChangeTypeContent"),
    Code: t("content.studioSaveChangeTypeCode"),
    Block: t("content.studioSaveChangeTypeBlock"),
  };

  if (!open) return null;

  return (
    <Dialog
      open
      data-cy="StudioSaveChangesModal"
      PaperProps={{ sx: { width: 640, maxWidth: "90vw", borderRadius: 1.5 } }}
    >
      <DialogTitle component="div" sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          {t("shell.integrationSaveChanges")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("content.studioSaveChangesSubtitle")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Table
          size="small"
          sx={{
            "& td, & th": { borderColor: "divider" },
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 600, width: 96 }}>
                {t("content.studioSaveChangesVersionColumn")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {t("shell.legacySearchSortTitle")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: 140 }}>
                {t("content.studioSaveChangesTypeColumn")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changes.map((change) => (
              <TableRow key={change.id} data-cy="StudioSaveChangeRow">
                <TableCell>
                  <Stack spacing={0.5} alignItems="flex-start">
                    {change.versions.map((version) => (
                      <Chip
                        key={`${version.state}-${version.version}`}
                        size="small"
                        label={`v${version.version}`}
                        color={version.state === "draft" ? "info" : "success"}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{change.title}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={typeLabels[change.type]}
                    variant="filled"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
        <Button
          data-cy="StudioSaveChangesCancelButton"
          color="inherit"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t("common.cancel")}
        </Button>
        <Box display="flex" gap={1}>
          <Button
            data-cy="StudioSaveAllButton"
            variant="contained"
            color="primary"
            startIcon={
              isSaving ? undefined : <SaveRoundedIcon fontSize="small" />
            }
            sx={{ whiteSpace: "nowrap" }}
            onClick={onSaveAll}
            disabled={isSaving || !canSave}
          >
            {isSaving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              t("content.studioSaveAllButton")
            )}
          </Button>
          <Button
            data-cy="StudioSaveAndPublishAllButton"
            variant="contained"
            color="success"
            startIcon={
              isSaving ? undefined : <CloudUploadRoundedIcon fontSize="small" />
            }
            sx={{ whiteSpace: "nowrap" }}
            onClick={onSaveAndPublishAll}
            disabled={isSaving || !canPublish}
          >
            {isSaving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              t("content.studioSaveAndPublishAllButton")
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
