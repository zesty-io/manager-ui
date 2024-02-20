import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  Typography,
  Button,
  Box,
  Stack,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  DateField,
  TimeField,
  LocalizationProvider,
} from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import moment from "moment";
import { useParams } from "react-router";

import { ContentItemWithDirtyAndPublishing } from "../views/ItemEdit/components/ItemEditHeader";
import { useGetAuditsQuery } from "../../../../../shell/services/instance";
import { useGetUsersQuery } from "../../../../../shell/services/accounts";

type SchedulePublishDialogProps = {
  contentItem: ContentItemWithDirtyAndPublishing;
  onClose: () => void;
};
export const SchedulePublishDialog = ({
  contentItem,
  onClose,
}: SchedulePublishDialogProps) => {
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const { data: auditData, isLoading: isLoadingAuditData } = useGetAuditsQuery({
    affectedZUID: itemZUID,
    action: 2,
    limit: 1,
  });
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

  const creator = users?.find(
    (user) => user.ZUID === contentItem.web.createdByUserZUID
  );

  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 640,
        },
      }}
    >
      <DialogTitle>
        <Box
          width={40}
          height={40}
          borderRadius={5}
          bgcolor="warning.light"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <ScheduleRoundedIcon color="warning" />
        </Box>
        <Box mt={1.5} mb={1}>
          <Typography variant="h5" fontWeight={700} display="inline">
            Schedule Content Item Publish:
          </Typography>{" "}
          <Typography variant="h5" display="inline">
            {contentItem.web?.metaTitle}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {isLoadingAuditData || isLoadingUsers ? (
            <Skeleton width={250} />
          ) : (
            <>
              v{contentItem.web?.version} saved{" "}
              {moment(
                auditData?.[0]?.happenedAt ?? contentItem.web?.createdAt
              ).fromNow()}{" "}
              by {auditData?.[0]?.firstName ?? creator?.firstName}{" "}
              {auditData?.[0]?.lastName ?? creator?.lastName}
            </>
          )}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack gap={1.5}>
          <Typography variant="body2" fontWeight={600}>
            Publish on
          </Typography>
          <Stack direction="row" gap={0.5}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateField
                name="publishDate"
                required
                sx={{
                  width: 140,
                }}
                InputProps={{
                  startAdornment: (
                    <IconButton size="small">
                      <CalendarTodayRoundedIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <TimeField
                name="publishTime"
                required
                sx={{
                  width: 96,
                }}
              />
            </LocalizationProvider>
            <Select name="publishTimezone" sx={{ flex: 1 }}></Select>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};
