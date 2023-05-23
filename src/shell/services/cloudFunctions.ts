import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getResponseData, prepareHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";

//Define service using a base URL and expected endpoints
export const cloudFunctionsApi = createApi({
  reducerPath: "cloudFunctionsApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.CLOUD_FUNCTIONS_DOMAIN}`,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    refreshCache: builder.mutation<void, void>({
      query: () => `fastlyPurge?zuid=${instanceZUID}`,
    }),
    aiGeneration: builder.mutation<any, any>({
      query: (body) => {
        return {
          url: `ai`,
          method: "POST",
          body,
        };
      },
    }),
    getGa4Data: builder.query<any, any>({
      query: (body) => {
        return {
          url: `getGa4Data`,
          method: "POST",
          body,
          params: {
            zuid: instanceZUID,
          },
        };
      },
    }),
    getGa4Properties: builder.query<any, void>({
      query: () => {
        return {
          url: `googleAnalyticsPropertyList`,
          method: "GET",
          params: {
            zuid: instanceZUID,
          },
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useRefreshCacheMutation,
  useAiGenerationMutation,
  useGetGa4DataQuery,
  useGetGa4PropertiesQuery,
} = cloudFunctionsApi;
