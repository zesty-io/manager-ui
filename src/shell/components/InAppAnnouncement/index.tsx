import { useEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import moment from "moment";
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
import { useCookie } from "react-use";

import { useGetAnnouncementsQuery } from "../../services/marketing";

export const InAppAnnouncement = () => {
  const { data: announcements } = useGetAnnouncementsQuery();
  const [readAnnouncementsCookie, updateReadAnnouncementsCookie] = useCookie(
    "READ_ANNOUNCEMENTS_ZUID"
  );
  const cookieOptions = {
    // @ts-ignore
    domain: __CONFIG__.COOKIE_DOMAIN,
    expires: moment().add(1, "year").toDate(),
  };

  useEffect(() => {
    // Initializes and keeps on bumping the read announcements cookie to permanently keep it on the browser
    const parsedAnnouncementZuids = readAnnouncementsCookie
      ? JSON.parse(readAnnouncementsCookie)
      : [];

    updateReadAnnouncementsCookie(
      JSON.stringify(parsedAnnouncementZuids),
      cookieOptions
    );
  }, []);

  const latestAnnouncement = useMemo(() => {
    if (announcements?.length) {
      const latest = [...announcements].sort((a, b) =>
        moment(b.created_at).diff(moment(a.created_at))
      )?.[0];

      if (
        moment().isBetween(
          moment(latest?.start_date_and_time),
          moment(latest?.end_date_and_time)
        )
      ) {
        return latest;
      }
    }
  }, [announcements]);

  const readAnnouncements = useMemo(() => {
    return readAnnouncementsCookie ? JSON.parse(readAnnouncementsCookie) : [];
  }, [readAnnouncementsCookie]);

  const onIgnoreAnnouncement = (zuid: string) => {
    if (!readAnnouncements?.includes(zuid)) {
      updateReadAnnouncementsCookie(
        JSON.stringify([...readAnnouncements, zuid]),
        cookieOptions
      );
    }
  };

  if (
    !latestAnnouncement ||
    readAnnouncements.includes(latestAnnouncement.zuid)
  ) {
    return <></>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open
        onClose={() => onIgnoreAnnouncement(latestAnnouncement?.zuid)}
        maxWidth="md"
        PaperProps={{ sx: { width: 640 } }}
        data-cy="AnnouncementPopup"
      >
        <DialogContent sx={{ p: 0 }}>
          <Stack
            component="a"
            href={latestAnnouncement?.announcement_link}
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
                `${latestAnnouncement?.feature_image?.data[0]?.url}?fit=cover&width=560&height=300` ??
                ""
              }
              maxWidth="100%"
              maxHeight="100%"
            />
          </Stack>
          <Stack gap={1} px={2.5} pb={2.5}>
            <Typography variant="h4" fontWeight={700}>
              {latestAnnouncement?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {latestAnnouncement?.description}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="text"
            color="inherit"
            onClick={() => onIgnoreAnnouncement(latestAnnouncement?.zuid)}
            data-cy="IgnoreAnnouncementButton"
          >
            Ignore
          </Button>
          <Stack direction="row" gap={1}>
            <Button
              variant="outlined"
              startIcon={<OpenInNewRoundedIcon />}
              disabled={!latestAnnouncement?.announcement_link}
              href={latestAnnouncement?.announcement_link}
              target="_blank"
            >
              Read Announcement
            </Button>
            {latestAnnouncement?.cta_type === "play_video" &&
              latestAnnouncement?.video_link && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowRoundedIcon />}
                  href={latestAnnouncement?.video_link}
                  target="_blank"
                >
                  Show Video
                </Button>
              )}
            {latestAnnouncement?.cta_type === "schedule_training" &&
              latestAnnouncement?.training_link && (
                <Button
                  variant="contained"
                  startIcon={<ScheduledRoundedIcon />}
                  href={latestAnnouncement?.training_link}
                  target="_blank"
                >
                  Schedule Training
                </Button>
              )}
          </Stack>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
