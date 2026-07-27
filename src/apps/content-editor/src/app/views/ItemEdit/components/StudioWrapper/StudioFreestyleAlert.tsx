import { CloseRounded, WarningRounded } from "@mui/icons-material";
import { Alert, AlertTitle, Button, IconButton, Stack } from "@mui/material";

type StudioFreestyleAlertProps = {
  // Per design the "Edit in Freestyle" action only appears on the floating
  // layout-mode alert; the content-mode alert in the side panel is dismiss-only.
  showEditAction?: boolean;
  onEditInFreestyle: () => void;
  onDismiss: () => void;
};

export const StudioFreestyleAlert = ({
  showEditAction = false,
  onEditInFreestyle,
  onDismiss,
}: StudioFreestyleAlertProps) => (
  <Alert
    data-cy="StudioFreestyleAlert"
    severity="warning"
    variant="filled"
    icon={<WarningRounded />}
    action={
      <Stack direction="row" alignItems="center">
        {showEditAction ? (
          <Button
            data-cy="StudioFreestyleAlertEditButton"
            size="small"
            color="inherit"
            onClick={onEditInFreestyle}
            sx={{ whiteSpace: "nowrap" }}
          >
            Edit in Freestyle
          </Button>
        ) : null}
        <IconButton
          data-cy="StudioFreestyleAlertCloseButton"
          aria-label="Dismiss Freestyle notice"
          size="small"
          color="inherit"
          onClick={onDismiss}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>
    }
    sx={{
      py: 1,
      px: 1.5,
      borderRadius: 2,
      alignItems: "center",
      "& .MuiAlert-action": {
        alignItems: "center",
        p: 0,
        ml: 2,
      },
    }}
  >
    <AlertTitle sx={{ mb: 0 }}>This layout was created in Freestyle</AlertTitle>
    Editing only available in Freestyle
  </Alert>
);
