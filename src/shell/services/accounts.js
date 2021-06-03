import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@rtk-incubator/rtk-query/react";
import instanceZuid from "utility/instanceZuid";

const getResponseData = response => response.data;

// Define a service using a base URL and expected endpoints
export const accountsApi = createApi({
  reducerPath: "accountsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${__CONFIG__.API_ACCOUNTS}/`,
    prepareHeaders: headers => {
      const token = Cookies.get(__CONFIG__.COOKIE_NAME);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  // always use the instanceZuid from the URL
  endpoints: builder => ({
    getDomains: builder.query({
      query: () => `instances/${instanceZuid}/domains`,
      transformResponse: response =>
        response.data.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);

          const epochA = dateA.valueOf();
          const epochB = dateB.valueOf();

          return epochA - epochB;
        })
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
