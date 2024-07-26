import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Announcement } from "./types";

export const marketingApi = createApi({
  reducerPath: "marketingApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.MARKETING_INSTANCE_DOMAIN}`,
  }),
  endpoints: (builder) => ({
    // Get announcements via instant api from the marketing instance
    getAnnouncements: builder.query<Announcement[], void>({
      query: () =>
        // @ts-ignore
        `/-/instant/${__CONFIG__.MARKETING_ANNOUNCEMENT_MODEL_ZUID}.json`,
      transformResponse: (response: { data: any[] }) => {
        // Filter out other languages if exists, this makes sure that announcements don't get repeatedly shown per language
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
                created_at: currVal?.version?.createdAt,
              },
            ];
          }

          return accu;
        }, []);
      },
    }),
  }),
});

export const { useGetAnnouncementsQuery } = marketingApi;
