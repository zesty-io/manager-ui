import { useState, useMemo } from "react";
import { ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";
import moment from "moment";
import { useLocalStorage } from "react-use";

import { AnnouncementPopup } from "./AnnouncementPopup";
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

  const announcementData = unreadAnnouncements
    ? unreadAnnouncements[activeAnnouncementIndex]
    : null;

  // FIXME: Unpublished content items are also being provided here as well
  // Instant api url: https://www.zesty.io/-/instant/6-90fbdcadfc-4lc0s5.json
  return (
    <ThemeProvider theme={theme}>
      {announcementData && (
        <AnnouncementPopup
          announcementData={announcementData}
          onIgnoreAnnouncement={(zuid) => {
            if (!readAnnouncements.includes(zuid)) {
              setReadAnnouncements([...readAnnouncements, zuid]);
              setActiveAnnouncementIndex(activeAnnouncementIndex + 1);
            }
          }}
        />
      )}
    </ThemeProvider>
  );
};
