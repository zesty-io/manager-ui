import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZuid from "utility/instanceZuid";
import { getResponseData, prepareHeaders } from "./util";

// Define a service using a base URL and expected endpoints
export const accountsApi = createApi({
  reducerPath: "accountsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${__CONFIG__.API_ACCOUNTS}/`,
    prepareHeaders
  }),
  // always use the instanceZuid from the URL
  endpoints: builder => ({
    getDomains: builder.query({
      query: () => `instances/${instanceZuid}/domains`,
      transformResponse: response =>
        response.data.sort(
          (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
        )
    }),
    getInstance: builder.query({
      query: () => `instances/${instanceZuid}`,
      transformResponse: getResponseData
    }),
    getInstances: builder.query({
      query: () => "instances",
      transformResponse: getResponseData
    }),
    getUsers: builder.query({
      query: () => `instances/${instanceZuid}/users`,
      transformResponse: getResponseData
    })
  })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetDomainsQuery,
  useGetInstanceQuery,
  useGetInstancesQuery,
  useGetUsersQuery
} = accountsApi;
