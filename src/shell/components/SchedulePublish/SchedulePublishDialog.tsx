import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Stack,
  Box,
  Alert,
} from "@mui/material";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

import { FieldTypeDateTime } from "../FieldTypeDateTime";

export type SchedulePublishDialogProps = {
  itemName: string;
  currentVersion: number;
  scheduledLocalText: string;
  creatorName: string;
  savedAgo: string;
  tzLabel: string;
  publishDateTime: string;
  publishTimezone: string;
  isLoading: boolean;
  isSelectedDatetimePast: boolean;
  isAlreadyScheduled: boolean;
  onClose: () => void;
  onPublishNow: () => void;
  onSchedule: () => void;
  onUnschedule: () => void;
  onDateTimeChange: (datetime: any) => void;
  onTimezoneChange: (timezone: any) => void;
};

export const SchedulePublishDialog = ({
  itemName,
  currentVersion,
  scheduledLocalText,
  creatorName,
  savedAgo,
  tzLabel,
  publishDateTime,
  publishTimezone,
  isLoading,
  isSelectedDatetimePast,
  isAlreadyScheduled,
  onClose,
  onPublishNow,
  onSchedule,
  onUnschedule,
  onDateTimeChange,
  onTimezoneChange,
}: SchedulePublishDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      data-cy="SchedulePublishModal"
      open
      onClose={onClose}
      PaperProps={{ sx: { maxWidth: 640, width: 640 } }}
    >
      <DialogTitle>
        <Stack gap={1.5}>
          <Box
            sx={{
              backgroundColor: "warning.light",
              borderRadius: "100%",
              width: 40,
              height: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isAlreadyScheduled ? (
              <CalendarTodayRoundedIcon color="warning" />
            ) : (
              <ScheduleRoundedIcon color="warning" />
            )}
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" display="inline" fontWeight={700}>
                {isAlreadyScheduled
                  ? t("shell.schedulePublishTitleUnschedule")
                  : t("shell.schedulePublishTitleSchedule")}
                {":"}
                &nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {itemName}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {isAlreadyScheduled
                ? t("shell.schedulePublishScheduledInfo", {
                    version: currentVersion,
                    date: scheduledLocalText,
                    timezone: tzLabel,
                  })
                : t("shell.schedulePublishSavedInfo", {
                    version: currentVersion,
                    distance: savedAgo,
                    name: creatorName,
                  })}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent data-cy="PublishScheduleModal">
        {isAlreadyScheduled ? (
          <Alert severity="info" icon={<InfoRoundedIcon />}>
            {t("shell.schedulePublishUnscheduleInfo")}
          </Alert>
        ) : (
          <>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
              {t("shell.schedulePublishOnLabel")}
            </Typography>
            <FieldTypeDateTime
              disablePast
              showTimezonePicker
              showClearButton={false}
              name="publishDateTime"
              value={publishDateTime}
              selectedTimezone={publishTimezone}
              onChange={onDateTimeChange}
              onTimezoneChange={onTimezoneChange}
            />
            {isSelectedDatetimePast && (
              <Alert
                severity="warning"
                icon={<WarningRoundedIcon fontSize="inherit" />}
                sx={{ mt: 2.5 }}
              >
                {t("shell.schedulePublishPastWarning")}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          data-cy="CancelSchedulePublishButton"
          variant="text"
          color="inherit"
          onClick={onClose}
          disabled={isLoading}
        >
          {t("common.cancel")}
        </Button>

        {isAlreadyScheduled ? (
          <Button
            data-cy="UnschedulePublishButton"
            variant="contained"
            color="warning"
            startIcon={<CalendarTodayRoundedIcon />}
            onClick={onUnschedule}
            loading={isLoading}
          >
            {t("shell.schedulePublishUnscheduleButton")}
          </Button>
        ) : (
          <Button
            data-cy="SchedulePublishButton"
            variant="contained"
            startIcon={<ScheduleRoundedIcon />}
            onClick={isSelectedDatetimePast ? onPublishNow : onSchedule}
            loading={isLoading}
          >
            {t("shell.schedulePublishButton")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
