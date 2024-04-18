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
} from "@mui/material";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import moment from "moment-timezone";
import { useDispatch } from "react-redux";

import { ContentItemWithDirtyAndPublishing } from "../../services/types";
import { useGetUsersQuery } from "../../services/accounts";
import { FieldTypeDateTime } from "../FieldTypeDateTime";
import { publish } from "../../store/content";

type SchedulePublishProps = {
  item: ContentItemWithDirtyAndPublishing;
  onClose: () => void;
  onPublishNow: () => void;
  onScheduleSuccess?: () => void;
};
export const SchedulePublish = ({
  onClose,
  item,
  onPublishNow,
  onScheduleSuccess,
}: SchedulePublishProps) => {
  const dispatch = useDispatch();
  const { data: users } = useGetUsersQuery();
  const [publishDateTime, setPublishDateTime] = useState(
    moment().minute(0).second(0).add(1, "hours").format("yyyy-MM-DD HH:mm:ss")
  );
  const [publishTimezone, setPublishTimezone] = useState(moment.tz.guess());
  const [isLoading, setIsLoading] = useState(false);

  const latestChangeCreator = users?.find(
    (user) => user.ZUID === item?.web?.createdByUserZUID
  );

  const isSelectedDatetimePast = moment
    .utc(moment.tz(publishDateTime, publishTimezone))
    .isBefore(moment.utc());

  const handleSchedulePublish = () => {
    setIsLoading(true);

    try {
      dispatch(
        publish(
          item?.meta?.contentModelZUID,
          item?.meta?.ZUID,
          {
            // Used for the api call
            publishAt: moment
              .utc(moment.tz(publishDateTime, publishTimezone))
              .format("YYYY-MM-DD HH:mm:ss"),
            version: item?.meta?.version,
          },
          {
            // Used for the confirmation msg
            localTime: moment
              .utc(moment.tz(publishDateTime, publishTimezone))
              .format("MMMM Do YYYY, [at] h:mm a"),
            localTimezone: publishTimezone,
          }
        )
      );
    } finally {
      onScheduleSuccess?.();
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: 640,
          width: 640,
        },
      }}
    >
      <DialogTitle>
        <Stack gap={1.5}>
          <ScheduleRoundedIcon
            color="warning"
            sx={{
              p: 1,
              borderRadius: "50%",
              backgroundColor: "warning.light",
            }}
          />
          <Box>
            <Box mb={1}>
              <Typography variant="h5" display="inline" fontWeight={700}>
                Schedule Content Item Publish:&nbsp;
              </Typography>
              <Typography variant="h5" display="inline">
                {item?.web?.metaLinkText}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              v{item?.web?.version} saved&nbsp;
              {moment(item?.web?.createdAt).fromNow()} by&nbsp;
              {latestChangeCreator?.firstName} {latestChangeCreator?.lastName}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
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
          onChange={(datetime) => {
            console.log(datetime);
            setPublishDateTime(datetime);
          }}
          onTimezoneChange={(timezone) => {
            setPublishTimezone(timezone);
          }}
        />
        {isSelectedDatetimePast && (
          <Alert
            variant="filled"
            severity="warning"
            icon={<WarningRoundedIcon fontSize="inherit" />}
            sx={{
              mt: 2.5,
              "& .MuiAlert-icon": {
                mr: 1,
              },
            }}
          >
            Since the selected time is a current or past date, this will be
            immediately published.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<ScheduleRoundedIcon />}
          onClick={() => {
            if (isSelectedDatetimePast) {
              onPublishNow();
            } else {
              handleSchedulePublish();
            }
          }}
        >
          Schedule v{item?.web?.version} for Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
