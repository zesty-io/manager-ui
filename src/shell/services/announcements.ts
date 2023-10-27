import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Announcement } from "./types";

export const announcementsApi = createApi({
  reducerPath: "announcementsApi",
  // TODO: Remove the temp baseQuery url after testing
  // baseQuery: fetchBaseQuery({ baseUrl: "https://www.zesty.io/-/instant/" }),
  baseQuery: fetchBaseQuery({
    baseUrl: "https://8xbq19z1-dev.webengine.zesty.io/-/instant/",
  }),
  endpoints: (builder) => ({
    getAnnouncements: builder.query<Announcement[], string>({
      query: (modelZUID) => `${modelZUID}.json`,
      transformResponse: (response: { data: any[] }) => {
        // Filter out other languages if exists
        return response?.data?.reduce((accu, currVal) => {
          if (currVal?.content?.lang_id === "1") {
            const {
              title,
              description,
              feature_image,
              cta_type,
              announcement_link,
              training_link,
              video_link,
              start_date_and_time,
              end_date_and_time,
            } = currVal.content;

            return [
              ...accu,
              {
                zuid: currVal?.meta.zuid,
                title,
                description,
                feature_image,
                cta_type,
                announcement_link,
                training_link,
                video_link,
                start_date_and_time,
                end_date_and_time,
              },
            ];
          }

          return accu;
        }, []);
      },
    }),
  }),
});

export const { useGetAnnouncementsQuery } = announcementsApi;
