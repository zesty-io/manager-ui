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
import { LoadingButton } from "@mui/lab";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import moment from "moment-timezone";
import { ContentItem } from "../../../../../../shell/services/types";
import { FieldTypeDateTime } from "../../../../../../shell/components/FieldTypeDateTime";
import { DialogContentItem } from "./DialogContentItem";
import pluralizeWord from "../../../../../../utility/pluralizeWord";

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
  const [publishDateTime, setPublishDateTime] = useState(
    moment().minute(0).second(0).add(1, "hours").format("yyyy-MM-DD HH:mm:ss")
  );
  const [publishTimezone, setPublishTimezone] = useState(
    moment.tz.guess() ?? "America/Los_Angeles"
  );

  const isSelectedDatetimePast = moment
    .utc(moment.tz(publishDateTime, publishTimezone))
    .isBefore(moment.utc());

  return (
    <Dialog
      open
      PaperProps={{
        sx: {
          maxWidth: 640,
          width: 640,
        },
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
            <ScheduleRoundedIcon color="warning" />
          </Box>
          <Box>
            <Box mb={1}>
              <Typography variant="h5" fontWeight={700}>
                Schedule Publish of Changes to {items.length}{" "}
                {pluralizeWord("Item", items.length)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              You can always cancel the scheduled publish later if needed
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent data-cy="PublishScheduleModal">
        <>
          <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
            Publish on
          </Typography>
          <FieldTypeDateTime
            disablePast
            showTimezonePicker
            showClearButton={false}
            name="publishDateTime"
            value={publishDateTime}
            selectedTimezone={publishTimezone}
            onChange={(datetime: any) => {
              setPublishDateTime(datetime);
            }}
            onTimezoneChange={(timezone: any) => {
              setPublishTimezone(timezone);
            }}
          />
          {isSelectedDatetimePast && (
            <Alert
              severity="warning"
              icon={<WarningRoundedIcon fontSize="inherit" />}
              sx={{
                mt: 2.5,
              }}
            >
              Since the selected time is a current or past date, this will be
              immediately published.
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
          Cancel
        </Button>

        <LoadingButton
          data-cy="SchedulePublishButton"
          variant="contained"
          loading={loading}
          startIcon={<ScheduleRoundedIcon />}
          onClick={() => {
            if (isSelectedDatetimePast) {
              onConfirm(items);
            } else {
              onConfirm(
                items,
                moment
                  .utc(moment.tz(publishDateTime, publishTimezone))
                  .format("YYYY-MM-DD HH:mm:ss")
              );
            }
          }}
        >
          Schedule Publish ({items.length})
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
