import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Stack,
  Box,
} from "@mui/material";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import moment from "moment";

import { ContentItemWithDirtyAndPublishing } from "../../services/types";
import { useGetUsersQuery } from "../../services/accounts";

type SchedulePublishProps = {
  item: ContentItemWithDirtyAndPublishing;
  onClose: () => void;
};
export const SchedulePublish = ({ onClose, item }: SchedulePublishProps) => {
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();

  const latestChangeCreator = users?.find(
    (user) => user.ZUID === item?.web?.createdByUserZUID
  );

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
                {item?.web?.metaTitle}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              v{item?.web?.version} saved{" "}
              {moment(item?.web?.createdAt).fromNow()} by{" "}
              {latestChangeCreator?.firstName} {latestChangeCreator?.lastName}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>Hello</DialogContent>
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
