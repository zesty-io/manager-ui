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
import { useLocalStorage } from "react-use";
import moment from "moment";

import { Announcement } from "../../services/types";

type AnnouncementPopupProps = {
  announcementData: Announcement;
};
export const AnnouncementPopup = ({
  announcementData,
}: AnnouncementPopupProps) => {
  const [readAnnouncements, setReadAnnouncements] = useLocalStorage(
    "zesty:readAnnouncements",
    []
  );
  const isInPublishRange = moment().isBetween(
    moment(announcementData?.start_date_and_time),
    moment(announcementData?.end_date_and_time)
  );

  const onIgnoreAnnouncement = () => {
    if (!readAnnouncements.includes(announcementData?.zuid)) {
      setReadAnnouncements([...readAnnouncements, announcementData?.zuid]);
    }
  };

  const onReadAnnouncement = () => {
    window.open(announcementData?.announcement_link, "_blank");
  };

  return (
    <Dialog
      open={
        isInPublishRange && !readAnnouncements.includes(announcementData?.zuid)
      }
      onClose={onIgnoreAnnouncement}
      maxWidth="md"
      PaperProps={{ sx: { width: 640 } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Stack
          m={2.5}
          p={3}
          width={600}
          height={338}
          sx={{ background: "linear-gradient(90deg, #ed4c0b, #fc8238)" }}
          alignItems="center"
          justifyContent="center"
          boxSizing="border-box"
        >
          <Box
            component="img"
            alt="announcement-banner-image"
            src={announcementData?.feature_image?.data[0]?.url ?? ""}
            maxWidth="100%"
            maxHeight="100%"
            sx={{
              cursor: "pointer",
            }}
            onClick={onReadAnnouncement}
          />
        </Stack>
        <Stack gap={1} px={2.5} pb={2.5}>
          <Typography variant="h4" fontWeight={700}>
            {announcementData?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {announcementData?.description}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button variant="text" color="inherit" onClick={onIgnoreAnnouncement}>
          Ignore
        </Button>
        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            startIcon={<OpenInNewRoundedIcon />}
            onClick={onReadAnnouncement}
          >
            Read Announcement
          </Button>
          {announcementData?.cta_type === "play_video" && (
            <Button
              variant="contained"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={() => window.open(announcementData?.video_link, "_blan")}
            >
              Show Video
            </Button>
          )}
          {announcementData?.cta_type === "schedule_training" && (
            <Button
              variant="contained"
              startIcon={<ScheduledRoundedIcon />}
              onClick={() =>
                window.open(announcementData?.training_link, "_blan")
              }
            >
              Schedule Training
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
