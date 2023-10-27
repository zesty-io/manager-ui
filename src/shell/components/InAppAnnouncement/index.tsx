import { useState, useMemo } from "react";
import { ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import moment from "moment";
import { useLocalStorage } from "react-use";
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

import { useGetAnnouncementsQuery } from "../../services/announcements";

export const InAppAnnouncement = () => {
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);
  const [readAnnouncements, setReadAnnouncements] = useLocalStorage(
    "zesty:readAnnouncements",
    []
  );
  // TODO: Remove the temp zuid
  // const { data: announcements } = useGetAnnouncementsQuery(
  //   "6-90fbdcadfc-4lc0s5"
  // );
  const { data: announcements } = useGetAnnouncementsQuery(
    "6-f8afc7978a-nj3716"
  );

  const unreadAnnouncements = useMemo(() => {
    if (announcements?.length) {
      return announcements
        .filter((announcement) => {
          const isInPublishRange = moment().isBetween(
            moment(announcement?.start_date_and_time),
            moment(announcement?.end_date_and_time)
          );

          return (
            isInPublishRange && !readAnnouncements.includes(announcement?.zuid)
          );
        })
        ?.sort((a, b) => moment(b.created_at).diff(a.created_at));
    }
  }, [announcements]);

  const onIgnoreAnnouncement = (zuid: string) => {
    if (!readAnnouncements.includes(zuid)) {
      setReadAnnouncements([...readAnnouncements, zuid]);
      setActiveAnnouncementIndex(activeAnnouncementIndex + 1);
    }
  };

  const announcementData = unreadAnnouncements
    ? unreadAnnouncements[activeAnnouncementIndex]
    : null;

  // FIXME: Unpublished content items are also being provided here as well
  // Instant api url: https://www.zesty.io/-/instant/6-90fbdcadfc-4lc0s5.json
  return (
    <ThemeProvider theme={theme}>
      {announcementData && (
        <Dialog
          open
          onClose={() => onIgnoreAnnouncement(announcementData?.zuid)}
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
                onClick={() =>
                  window.open(announcementData?.announcement_link, "_blank")
                }
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
            <Button
              variant="text"
              color="inherit"
              onClick={() => onIgnoreAnnouncement(announcementData?.zuid)}
            >
              Ignore
            </Button>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                startIcon={<OpenInNewRoundedIcon />}
                onClick={() =>
                  window.open(announcementData?.announcement_link, "_blank")
                }
              >
                Read Announcement
              </Button>
              {announcementData?.cta_type === "play_video" && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={() =>
                    window.open(announcementData?.video_link, "_blank")
                  }
                >
                  Show Video
                </Button>
              )}
              {announcementData?.cta_type === "schedule_training" && (
                <Button
                  variant="contained"
                  startIcon={<ScheduledRoundedIcon />}
                  onClick={() =>
                    window.open(announcementData?.training_link, "_blank")
                  }
                >
                  Schedule Training
                </Button>
              )}
            </Stack>
          </DialogActions>
        </Dialog>
      )}
    </ThemeProvider>
  );
};
