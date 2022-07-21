import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZUID from "utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";

// Define a service using a base URL and expected endpoints
export const accountsApi = createApi({
  reducerPath: "accountsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${__CONFIG__.API_ACCOUNTS}/`,
    prepareHeaders,
  }),
  // always use the instanceZUID from the URL
  endpoints: (builder) => ({
    getDomains: builder.query({
      query: () => `instances/${instanceZUID}/domains`,
      transformResponse: (response) =>
        response.data.sort(
          (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
        ),
    }),
    getInstance: builder.query({
      query: () => `instances/${instanceZUID}`,
      transformResponse: getResponseData,
    }),
    getInstances: builder.query({
      query: () => "instances",
      transformResponse: getResponseData,
    }),
    getUsers: builder.query({
      query: () => `instances/${instanceZUID}/users`,
      transformResponse: getResponseData,
    }),
    getUsersRoles: builder.query({
      query: () => `instances/${instanceZUID}/users/roles`,
      transformResponse: getResponseData,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetDomainsQuery,
  useGetInstanceQuery,
  useGetInstancesQuery,
  useGetUsersQuery,
  useGetUsersRolesQuery,
} = accountsApi;
