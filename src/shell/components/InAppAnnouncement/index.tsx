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

import { useGetAnnouncementsQuery } from "../../services/marketing";

export const InAppAnnouncement = () => {
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);
  const [readAnnouncements, setReadAnnouncements] = useLocalStorage(
    "zesty:readAnnouncements",
    []
  );
  const { data: announcements } = useGetAnnouncementsQuery();

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

  return (
    <ThemeProvider theme={theme}>
      {announcementData && (
        <Dialog
          open
          onClose={() => onIgnoreAnnouncement(announcementData?.zuid)}
          maxWidth="md"
          PaperProps={{ sx: { width: 640 } }}
          data-cy="AnnouncementPopup"
        >
          <DialogContent sx={{ p: 0 }}>
            <Stack
              component="a"
              href={announcementData?.announcement_link}
              target="_blank"
              m={2.5}
              p={2.5}
              width={600}
              height={340}
              sx={{
                background: "linear-gradient(90deg, #EC4A0A 0%, #FD853A 100%)",
              }}
              alignItems="center"
              justifyContent="center"
              boxSizing="border-box"
            >
              <Box
                component="img"
                alt="announcement-banner-image"
                src={
                  `${announcementData?.feature_image?.data[0]?.url}?fit=cover&width=560&height=300` ??
                  ""
                }
                maxWidth="100%"
                maxHeight="100%"
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
              data-cy="IgnoreAnnouncementButton"
            >
              Ignore
            </Button>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                startIcon={<OpenInNewRoundedIcon />}
                disabled={!announcementData?.announcement_link}
                href={announcementData?.announcement_link}
                target="_blank"
              >
                Read Announcement
              </Button>
              {announcementData?.cta_type === "play_video" &&
                announcementData?.video_link && (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowRoundedIcon />}
                    href={announcementData?.video_link}
                    target="_blank"
                  >
                    Show Video
                  </Button>
                )}
              {announcementData?.cta_type === "schedule_training" &&
                announcementData?.training_link && (
                  <Button
                    variant="contained"
                    startIcon={<ScheduledRoundedIcon />}
                    href={announcementData?.training_link}
                    target="_blank"
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
