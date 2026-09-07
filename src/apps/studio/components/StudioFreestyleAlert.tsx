import { CloseRounded, WarningRounded } from "@mui/icons-material";
import { Alert, AlertTitle, Button, IconButton, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

type StudioFreestyleAlertProps = {
  // Layout mode carries the action inside the alert. Content mode leaves it out
  // — there the side panel's own full-width button becomes "Edit in Freestyle".
  showEditAction?: boolean;
  onEditInFreestyle: () => void;
  onDismiss: () => void;
};

export const StudioFreestyleAlert = ({
  showEditAction = false,
  onEditInFreestyle,
  onDismiss,
}: StudioFreestyleAlertProps) => {
  const { t } = useTranslation();
  return (
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
              // The theme's filled Alert only sets contrast text on the message
              // and title, leaving the root dark — so color="inherit" resolves to
              // text.secondary here. Pin white to match the design.
              sx={{ color: "common.white", whiteSpace: "nowrap" }}
            >
              {t("content.studioEditInFreestyle")}
            </Button>
          ) : null}
          <IconButton
            data-cy="StudioFreestyleAlertCloseButton"
            aria-label={t("content.studioFreestyleAlertDismissAriaLabel")}
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
      <AlertTitle sx={{ mb: 0 }}>
        {t("content.studioFreestyleAlertTitle")}
      </AlertTitle>
      {t("content.studioFreestyleAlertBody")}
    </Alert>
  );
};
