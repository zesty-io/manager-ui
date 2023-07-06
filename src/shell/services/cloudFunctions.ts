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
    getAnalyticsPropertyDataByQuery: builder.query<any, any>({
      query: (body) => {
        return {
          url: `getPropertyDataByQuery`,
          method: "POST",
          body,
          params: {
            zuid: instanceZUID,
          },
        };
      },
    }),
    getAnalyticsProperties: builder.query<any, void>({
      query: () => {
        return {
          url: `getPropertyList`,
          method: "GET",
          params: {
            zuid: instanceZUID,
          },
        };
      },
    }),
    getAnalyticsPagePathsByFilter: builder.query<
      string[],
      {
        filter: "popular" | "gainer" | "loser";
        startDate: string;
        endDate: string;
        propertyId: string;
        limit: number;
        order: "asc" | "desc";
      }
    >({
      query: ({ filter, startDate, endDate, propertyId, limit, order }) => {
        return {
          url: `getPagePathByFilter`,
          method: "GET",
          params: {
            q: filter,
            date_start: startDate,
            date_end: endDate,
            property_id: propertyId,
            limit,
            order,
            zuid: instanceZUID,
          },
        };
      },
    }),
    disconnectGoogleAnalytics: builder.mutation<void, void>({
      query: () => {
        return {
          url: `disconnectGoogleAnalytics`,
          method: "DELETE",
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
  useGetAnalyticsPropertiesQuery,
  useGetAnalyticsPropertyDataByQueryQuery,
  useGetAnalyticsPagePathsByFilterQuery,
  useDisconnectGoogleAnalyticsMutation,
} = cloudFunctionsApi;
