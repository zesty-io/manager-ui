import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { LegacyHeader } from "./types";

export const headTagApi = createApi({
  reducerPath: "headTagApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.API_INSTANCE_PROTOCOL}${instanceZUID}${__CONFIG__.API_INSTANCE}`,
    prepareHeaders,
  }),
  tagTypes: ["LegacyHeadTags"],
  endpoints: (builder) => ({
    getLegacyHeadTags: builder.query<LegacyHeader[], void>({
      query: () => `/web/headers`,
      transformResponse: getResponseData,
      keepUnusedDataFor: 0.0001,
      providesTags: () => [{ type: "LegacyHeadTags" }],
    }),
  }),
});

export const { useGetLegacyHeadTagsQuery } = headTagApi;
