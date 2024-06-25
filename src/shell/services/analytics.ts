import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getResponseData, prepareHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";

//Define service using a base URL and expected endpoints
export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.API_ANALYTICS}`,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getAnalyticsPropertyDataByQuery: builder.query<any, any>({
      query: (body) => {
        return {
          url: `ga4/reports`,
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
          url: `ga4/properties`,
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
          url: `ga4/page-paths`,
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
          url: `ga4/auth/disconnect`,
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
  useGetAnalyticsPropertiesQuery,
  useGetAnalyticsPropertyDataByQueryQuery,
  useGetAnalyticsPagePathsByFilterQuery,
  useDisconnectGoogleAnalyticsMutation,
} = analyticsApi;
