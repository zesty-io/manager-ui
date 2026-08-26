import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Announcement } from "./types";

export const marketingApi = createApi({
  reducerPath: "marketingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${__CONFIG__.MARKETING_INSTANCE_DOMAIN}`,
  }),
  endpoints: (builder) => ({
    // Get announcements via instant api from the marketing instance
    getAnnouncements: builder.query<Announcement[], void>({
      // #2323: this endpoint is a WebEngine response behind Fastly, and the edge
      // object is evicted by surrogate-key purge on *publish* — not by a TTL, and
      // not by deleting a content item. Measured on 2026-08-26: the gzip variant
      // every browser receives was served as `x-cache: HIT` at `age: 84518`
      // (23.5h) and still climbing, so a deleted announcement keeps rendering
      // long after the origin has dropped it. The response's `cache-control:
      // no-cache` governs client caches only and does not reach the edge object.
      //
      // A unique query param is the only lever the client has: it changes the
      // cache key, so the request misses the edge and reads origin (verified —
      // same URL with `?_=<n>` returns `x-cache: MISS, MISS`, `age: 0`, same
      // body). One origin request per app load, since RTK Query keys this
      // endpoint on its argument and not on the URL.
      //
      // Removable once the platform purges on delete. If it is removed, update
      // `cy.blockAnnouncements()` in cypress/support/commands.js as well — its
      // matcher is globbed to tolerate the param.
      query: () =>
        `/-/instant/${
          __CONFIG__.MARKETING_ANNOUNCEMENT_MODEL_ZUID
        }.json?_=${Date.now()}`,
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
