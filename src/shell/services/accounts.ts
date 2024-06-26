import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import moment from "moment";

import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import {
  User,
  UserRole,
  Domain,
  Instance,
  Role,
  InstalledApp,
  Comment,
  CommentReply,
  CommentResourceType,
} from "./types";

// Define a service using a base URL and expected endpoints
export const accountsApi = createApi({
  reducerPath: "accountsApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.API_ACCOUNTS}/`,
    prepareHeaders,
  }),
  tagTypes: ["Comments", "CommentThread"],
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
    // Note: scopeTo needs to be null when fetching comments for non-content item field resources
    createComment: builder.mutation<
      any,
      {
        resourceZUID: string;
        scopeTo: string;
        content: string;
      }
    >({
      query: ({ resourceZUID, content, scopeTo }) => ({
        url: "/comments",
        method: "POST",
        body: {
          resourceZUID,
          content,
          instanceZUID,
          scopeTo,
        },
      }),
      invalidatesTags: (_, __, { scopeTo }) => [
        { type: "Comments", id: scopeTo },
      ],
    }),
    createReply: builder.mutation<
      any,
      {
        commentZUID: string;
        resourceZUID: string;
        content: string;
      }
    >({
      query: ({ commentZUID, content }) => ({
        url: `/comments/${commentZUID}/replies`,
        method: "POST",
        body: {
          content,
        },
      }),
      invalidatesTags: (_, __, { resourceZUID, commentZUID }) => [
        { type: "Comments", id: resourceZUID },
        { type: "CommentThread", id: commentZUID },
      ],
    }),
    getCommentByResource: builder.query<
      Comment[],
      { itemZUID: string; resourceZUID: string }
    >({
      query: ({ itemZUID, resourceZUID }) =>
        `/instances/${instanceZUID}/comments?resource=${itemZUID}&scope=${resourceZUID}&showResolved=true`,
      transformResponse: (response: any) =>
        response.data?.sort((a: any, b: any) =>
          moment(b.createdAt).diff(a.createdAt)
        ),
      providesTags: (_, __, { resourceZUID }) => [
        { type: "Comments", id: resourceZUID },
      ],
    }),
    getCommentThread: builder.query<CommentReply[], { commentZUID: string }>({
      query: ({ commentZUID }) =>
        `/comments/${commentZUID}?showReplies=true&showResolved=true`,
      transformResponse: (response: any) => [
        {
          ZUID: response.data?.ZUID,
          commentZUID: null,
          content: response.data?.content,
          createdAt: response.data?.createdAt,
          createdByUserEmail: response.data?.createdByUserEmail,
          createdByUserName: response.data?.createdByUserName,
          createdByUserZUID: response.data?.createdByUserZUID,
          mentions: response.data?.mentions,
          updatedAt: response.data?.updatedAt,
        },
        ...response.data?.replies,
      ],
      providesTags: (_, __, { commentZUID }) => [
        { type: "CommentThread", id: commentZUID },
      ],
    }),
    updateComment: builder.mutation<
      any,
      { resourceZUID: string; commentZUID: string; content: string }
    >({
      query: ({ commentZUID, content }) => ({
        url: `/comments/${commentZUID}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (_, __, { resourceZUID, commentZUID }) => [
        { type: "Comments", id: resourceZUID },
        { type: "CommentThread", id: commentZUID },
      ],
    }),
    updateReply: builder.mutation<
      any,
      { commentZUID: string; parentCommentZUID: string; content: string }
    >({
      query: ({ commentZUID, parentCommentZUID, content }) => ({
        url: `/comments/${parentCommentZUID}/replies/${commentZUID}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (_, __, { parentCommentZUID }) => [
        { type: "CommentThread", id: parentCommentZUID },
      ],
    }),
    deleteComment: builder.mutation<
      any,
      { resourceZUID: string; commentZUID: string }
    >({
      query: ({ commentZUID }) => ({
        url: `/comments/${commentZUID}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { resourceZUID, commentZUID }) => [
        { type: "Comments", id: resourceZUID },
        { type: "CommentThread", id: commentZUID },
      ],
    }),
    deleteReply: builder.mutation<
      any,
      { commentZUID: string; parentCommentZUID: string; resourceZUID: string }
    >({
      query: ({ commentZUID, parentCommentZUID }) => ({
        url: `/comments/${parentCommentZUID}/replies/${commentZUID}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { parentCommentZUID, resourceZUID }) => [
        { type: "Comments", id: resourceZUID },
        { type: "CommentThread", id: parentCommentZUID },
      ],
    }),
    updateCommentStatus: builder.mutation<
      any,
      {
        resourceZUID: string;
        commentZUID: string;
        parentCommentZUID: string;
        isResolved: boolean;
      }
    >({
      query: ({ commentZUID, isResolved }) => ({
        url: `/comments/${commentZUID}?action=${
          isResolved ? "resolve" : "unresolve"
        }`,
        method: "PUT",
      }),
      invalidatesTags: (_, __, { resourceZUID, parentCommentZUID }) => [
        { type: "Comments", id: resourceZUID },
        { type: "CommentThread", id: parentCommentZUID },
      ],
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
  useCreateUserInviteMutation,
  useGetCurrentUserRolesQuery,
  useGetInstalledAppsQuery,
  useCreateCommentMutation,
  useCreateReplyMutation,
  useGetCommentThreadQuery,
  useGetCommentByResourceQuery,
  useUpdateCommentMutation,
  useUpdateReplyMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
  useUpdateCommentStatusMutation,
} = accountsApi;
