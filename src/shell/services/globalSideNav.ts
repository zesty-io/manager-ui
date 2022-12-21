import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getResponseData, prepareHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";

// Define a service using a base URL and expected endpoints
export const globalSideNavApi = createApi({
  reducerPath: "globalSideNavApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.CLOUD_FUNCTIONS_DOMAIN}`,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    refreshCache: builder.query<>({
      query: () => `fastlyPurge?zuid=${instanceZUID}`,
      transformResponse: getResponseData,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useRefreshCacheQuery } = instanceApi;
