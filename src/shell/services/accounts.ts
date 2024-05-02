import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { User, UserRole, Domain, Instance, Role, InstalledApp } from "./types";

// Define a service using a base URL and expected endpoints
export const accountsApi = createApi({
  reducerPath: "accountsApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.API_ACCOUNTS}/`,
    prepareHeaders,
  }),
  // always use the instanceZUID from the URL
  endpoints: (builder) => ({
    getDomains: builder.query<Domain[], void>({
      query: () => `instances/${instanceZUID}/domains`,
      transformResponse: (response: any) =>
        response.data.sort(
          (a: any, b: any) => +new Date(a.createdAt) - +new Date(b.createdAt)
        ),
    }),
    getInstance: builder.query<Instance, void>({
      query: () => `instances/${instanceZUID}`,
      transformResponse: getResponseData,
    }),
    getInstances: builder.query<Instance[], void>({
      query: () => "instances",
      transformResponse: getResponseData,
    }),
    getUsers: builder.query<User[], void>({
      query: () => `instances/${instanceZUID}/users`,
      transformResponse: getResponseData,
    }),
    getUsersRoles: builder.query<UserRole[], void>({
      query: () => `instances/${instanceZUID}/users/roles`,
      transformResponse: getResponseData,
    }),
    createUserInvite: builder.mutation<
      any,
      { inviteeEmail: string; accessLevel: number }
    >({
      query: ({ inviteeEmail, accessLevel }) => ({
        url: `/invites`,
        method: "POST",
        body: {
          inviteeEmail,
          accessLevel,
          entityZUID: instanceZUID,
        },
      }),
    }),
    getCurrentUserRoles: builder.query<Role[], void>({
      query: () => `/roles`,
      transformResponse: getResponseData,
    }),
    getInstalledApps: builder.query<InstalledApp[], void>({
      query: () => `instances/${instanceZUID}/app-installs`,
      transformResponse: getResponseData,
    }),
    createComment: builder.mutation<
      any,
      { resourceZUID: string; resourceType: string; content: string }
    >({
      query: ({ resourceZUID, resourceType, content }) => ({
        url: "/comments",
        method: "POST",
        body: {
          resourceZUID,
          resourceType,
          content,
          instanceZUID,
        },
      }),
    }),
    // createReply
    // getComment NOTE: Include thread
    // getCommentByResource
    // updateComment
    // deleteComment
    // resolveComment
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
  useCreateUserInviteMutation,
  useGetCurrentUserRolesQuery,
  useGetInstalledAppsQuery,
  useCreateCommentMutation,
} = accountsApi;
