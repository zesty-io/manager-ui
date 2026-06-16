import {
  Dialog,
  Typography,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Stack,
  Box,
} from "@mui/material";
import { LockOpenRounded, LockRounded } from "@mui/icons-material";
import { fromUnixTime, isValid } from "date-fns";

import { formatLocalized } from "shell/i18n/dates";

type LockedItemProps = {
  itemName: string;
  currentViewerFirstName: string;
  currentViewerLastName: string;
  viewTimestamp: string;
  onCancel: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onUnlock: () => void;
};
export const LockedItem = ({
  itemName,
  currentViewerFirstName,
  currentViewerLastName,
  viewTimestamp,
  onCancel,
  onUnlock,
}: LockedItemProps) => {
  const d = fromUnixTime(Number(viewTimestamp));
  const viewedAt = isValid(d) ? formatLocalized(d, "MMMM do, yyyy h:mm a") : "";
  return (
    <Dialog
      open
      PaperProps={{
        sx: { maxWidth: 540 },
      }}
    >
      <DialogTitle>
        <Stack gap={1.5}>
          <Box
            sx={{
              backgroundColor: "warning.light",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LockRounded color="warning" />
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" display="inline" fontWeight={700}>
                Item Locked:&nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {itemName}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {currentViewerFirstName} {currentViewerLastName} is viewing this
              item since&nbsp;
              {viewedAt}. Unlock this item to ignore this warning and possibly
              overwrite&nbsp;
              {currentViewerFirstName}'s changes.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={onCancel}>
          Go Back
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<LockOpenRounded />}
          onClick={onUnlock}
        >
          Unlock
        </Button>
      </DialogActions>
    </Dialog>
  );
};
