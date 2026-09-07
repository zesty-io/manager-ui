import { useState } from "react";
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
  List,
} from "@mui/material";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { useTranslation } from "react-i18next";
import { ContentItem } from "../../../../../../shell/services/types";
import { FieldTypeDateTime } from "../../../../../../shell/components/FieldTypeDateTime";
import { DialogContentItem } from "./DialogContentItem";
import { format as fmt } from "date-fns";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";

type SchedulePublishesModalProps = {
  items: ContentItem[];
  onCancel: () => void;
  onConfirm: (items: ContentItem[], publishDateTime?: string) => void;
  loading: boolean;
};
export const SchedulePublishesModal = ({
  onCancel,
  items,
  onConfirm,
  loading,
}: SchedulePublishesModalProps) => {
  const { t } = useTranslation();
  // Start at next top of the hour (local)
  const now = new Date();
  const nextTopOfHour = new Date(now);
  nextTopOfHour.setMinutes(0, 0, 0);
  nextTopOfHour.setHours(nextTopOfHour.getHours() + 1);

  const [publishDateTime, setPublishDateTime] = useState(
    fmt(nextTopOfHour, "yyyy-MM-dd HH:mm:ss")
  );

  const tzGuess =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles";
  const [publishTimezone, setPublishTimezone] = useState(tzGuess);

  // Normalize (strip microseconds if present) and convert to UTC
  const normalizedLocal = String(publishDateTime).replace(/\.\d+$/, "");
  const selectedUtc = zonedTimeToUtc(normalizedLocal, publishTimezone);

  const isSelectedDatetimePast = selectedUtc.getTime() <= Date.now();

  return (
    <Dialog
      open
      PaperProps={{
        sx: { maxWidth: 640, width: 640 },
      }}
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
            <ScheduleRoundedIcon color="warning" />
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" fontWeight={700}>
                {t("content.itemListScheduleTitle", { count: items.length })}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t("content.itemListScheduleSubtitle")}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent data-cy="PublishScheduleModal">
        <>
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            {t("content.itemListSchedulePublishOn")}
          </Typography>
          <FieldTypeDateTime
            disablePast
            showTimezonePicker
            showClearButton={false}
            name="publishDateTime"
            value={publishDateTime}
            selectedTimezone={publishTimezone}
            onChange={(datetime: any) => {
              const normalized = String(datetime).replace(/\.\d+$/, "");
              setPublishDateTime(normalized);
            }}
            onTimezoneChange={(timezone: any) => setPublishTimezone(timezone)}
          />
          {isSelectedDatetimePast && (
            <Alert
              severity="warning"
              icon={<WarningRoundedIcon fontSize="inherit" />}
              sx={{ mt: 2.5 }}
            >
              {t("content.itemListSchedulePastWarning")}
            </Alert>
          )}
          <List disablePadding sx={{ pt: 2.5 }}>
            {items.map((item, index) => (
              <DialogContentItem key={index} item={item} />
            ))}
          </List>
        </>
      </DialogContent>
      <DialogActions>
        <Button
          data-cy="CancelSchedulePublishButton"
          variant="text"
          color="inherit"
          onClick={onCancel}
        >
          {t("common.cancel")}
        </Button>

        <Button
          data-cy="SchedulePublishButton"
          variant="contained"
          loading={loading}
          startIcon={<ScheduleRoundedIcon />}
          onClick={() => {
            if (isSelectedDatetimePast) {
              onConfirm(items);
            } else {
              // Send UTC string without timezone: "YYYY-MM-DD HH:mm:ss"
              const out = formatInTimeZone(
                selectedUtc,
                "UTC",
                "yyyy-MM-dd HH:mm:ss"
              );
              onConfirm(items, out);
            }
          }}
        >
          {t("content.itemListScheduleButton", { count: items.length })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
