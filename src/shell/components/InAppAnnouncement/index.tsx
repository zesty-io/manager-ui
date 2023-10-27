import { ThemeProvider } from "@mui/material";
import { theme } from "@zesty-io/material";

import { AnnouncementPopup } from "./AnnouncementPopup";
import { useGetAnnouncementsQuery } from "../../services/announcements";

export const InAppAnnouncement = () => {
  // TODO: Remove the temp zuid
  // const { data: announcements } = useGetAnnouncementsQuery(
  //   "6-90fbdcadfc-4lc0s5"
  // );
  const { data: announcements } = useGetAnnouncementsQuery(
    "6-f8afc7978a-nj3716"
  );

  // TODO: Figure out how to fetch data from the model dataset
  // TODO: Show overlapping start/end dates in descending order
  // TODO: Loop through all announcements that fit within the start/end date
  // FIXME: Unpublished content items are also being provided here as well
  // Instant api url: https://www.zesty.io/-/instant/6-90fbdcadfc-4lc0s5.json
  return (
    <ThemeProvider theme={theme}>
      {announcements?.map((announcement) => (
        <AnnouncementPopup
          key={announcement?.zuid}
          announcementData={announcement}
        />
      ))}
    </ThemeProvider>
  );
};
