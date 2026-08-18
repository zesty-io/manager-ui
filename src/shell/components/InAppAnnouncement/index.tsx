import { useEffect, useMemo } from "react";
import { addYears, isWithinInterval } from "date-fns";
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
import Cookies from "js-cookie";

import { useGetAnnouncementsQuery } from "../../services/marketing";

const READ_ANNOUNCEMENTS_COOKIE = "READ_ANNOUNCEMENTS_ZUID";

export const InAppAnnouncement = () => {
  const { data: announcements } = useGetAnnouncementsQuery();
  const [readAnnouncementsCookie, updateReadAnnouncementsCookie] = useCookie(
    READ_ANNOUNCEMENTS_COOKIE
  );
  const cookieOptions = {
    domain: CONFIG.COOKIE_DOMAIN,
    expires: addYears(new Date(), 1),
  };

  useEffect(() => {
    // Initializes and keeps on bumping the read announcements cookie to permanently keep it on the browser
    //
    // #1358: this cookie used to be written host-only (domain was undefined via
    // __CONFIG__), so a user can hold both a host-only and a domain-scoped copy.
    // js-cookie's get() returns whichever appears first in document.cookie, which
    // is ordered by creation time — so we cannot rely on reading the right one.
    // Union every copy instead, then collapse to a single domain-scoped cookie.
    //
    // Migration only — removable once every user has loaded the app once after
    // this ships (the legacy cookie's max lifetime is one year from a user's
    // last pre-deploy visit). It is also the only producer of the value written
    // below, so removing it means restoring the plain read it replaced —
    // `const zuids = readAnnouncementsCookie ? JSON.parse(readAnnouncementsCookie) : [];`
    // — as the value passed to updateReadAnnouncementsCookie. Deleting the block
    // on its own writes an empty list over every user's dismissals.
    const mergedAnnouncementZuids = new Set<string>();

    document.cookie
      .split("; ")
      .filter((cookie) => cookie.startsWith(`${READ_ANNOUNCEMENTS_COOKIE}=`))
      .forEach((cookie) => {
        try {
          // Mirrors the lenient decode in js-cookie 2.2.1's reader (the decode()
          // helper in js.cookie.js): a stray "%" is left alone instead of
          // throwing a URIError, so every copy Cookies.get() could have read is
          // a copy this union keeps.
          const zuids = JSON.parse(
            cookie
              .slice(READ_ANNOUNCEMENTS_COOKIE.length + 1)
              .replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent)
          );

          if (Array.isArray(zuids)) {
            zuids.forEach((zuid) => {
              if (typeof zuid === "string") {
                mergedAnnouncementZuids.add(zuid);
              }
            });
          }
        } catch {
          // A malformed copy must not abort the migration or the write below
        }
      });

    Cookies.remove(READ_ANNOUNCEMENTS_COOKIE);

    updateReadAnnouncementsCookie(
      JSON.stringify([...mergedAnnouncementZuids]),
      cookieOptions
    );
  }, []);

  const latestAnnouncement = useMemo(() => {
    if (announcements?.length) {
      const latest = [...announcements].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      const now = new Date();
      const start = new Date(latest?.start_date_and_time);
      const end = new Date(latest?.end_date_and_time);
      if (isWithinInterval(now, { start, end })) return latest;
    }
  }, [announcements]);

  const readAnnouncements = useMemo(() => {
    // Runs during render, before the migration effect — a corrupt cookie must
    // not throw into the ErrorBoundary and take Shell down with it
    try {
      return readAnnouncementsCookie ? JSON.parse(readAnnouncementsCookie) : [];
    } catch {
      return [];
    }
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
              `${latestAnnouncement?.feature_image?.data[0]?.url}?fit=cover&width=1280` ??
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
  );
};
