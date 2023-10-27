import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Button,
  Box,
} from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ScheduledRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

type AnnouncementPopupProps = {
  announcementData: {};
};
export const AnnouncementPopup = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  // TODO: Remove hard-coded values
  // TODO: Dismiss status should be saved in local storage with a dedicated identifier for each announcement
  return (
    <Dialog
      open={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
      }}
      maxWidth="md"
      PaperProps={{ sx: { width: 640 } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Stack
          m={2.5}
          width={600}
          height={338}
          sx={{ background: "linear-gradient(90deg, #ed4c0b, #fc8238)" }}
          alignItems="center"
          justifyContent="center"
        >
          <Box
            component="img"
            alt="announcement-banner-image"
            src="https://8xbq19z1.media.zestyio.com/calm-meadow.png"
            // src="https://8xbq19z1.media.zestyio.com/jsIcon.svg"
            maxWidth="100%"
            maxHeight="100%"
            sx={{
              cursor: "pointer",
            }}
          />
        </Stack>
        <Stack gap={1} px={2.5} pb={2.5}>
          <Typography variant="h4" fontWeight={700}>
            Hello world!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zesty's new GA4 integration provides a familiar dashboard, per page
            analytics and built in A/B testing. Contact our support to get
            integration instructions.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button variant="text" color="inherit">
          Ignore
        </Button>
        <Stack direction="row" gap={1}>
          <Button variant="outlined" startIcon={<OpenInNewRoundedIcon />}>
            Read Announcement
          </Button>
          <Button variant="contained" startIcon={<PlayArrowRoundedIcon />}>
            Show Video
          </Button>
          <Button variant="contained" startIcon={<ScheduledRoundedIcon />}>
            Schedule Training
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
