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
// import moment from "moment";
import moment from "moment-timezone";

import { ContentItemWithDirtyAndPublishing } from "../../services/types";
import { useGetUsersQuery } from "../../services/accounts";
import { FieldTypeDateTime } from "../FieldTypeDateTime";

type SchedulePublishProps = {
  item: ContentItemWithDirtyAndPublishing;
  onClose: () => void;
};
export const SchedulePublish = ({ onClose, item }: SchedulePublishProps) => {
  const [publishDateTime, setPublishDateTime] = useState(
    moment().minute(0).second(0).add(1, "hours").format("yyyy-MM-DD HH:mm:ss")
  );
  const [publishTimezone, setPublishTimezone] = useState(moment.tz.guess());
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

  const latestChangeCreator = users?.find(
    (user) => user.ZUID === item?.web?.createdByUserZUID
  );

  // const determineTimeValidity = () => {
  //   const toLocalTime = moment(moment.tz(publishDateTime, publishTimezone))
  // }

  console.log("current time in utc", moment.utc().format());
  console.log(
    "selected time in utc",
    moment.utc(moment.tz(publishDateTime, publishTimezone)).format()
  );

  const isSelectedDatetimePast = moment
    .utc(moment.tz(publishDateTime, publishTimezone))
    .isBefore(moment.utc());
  console.log("is before", isSelectedDatetimePast);

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
        <Button variant="contained" startIcon={<ScheduleRoundedIcon />}>
          Schedule v{item?.web?.version} for Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
