import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getResponseData, prepareHeaders as prepareAuthHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";
import {
  ChatSession,
  GeminiResponse,
  ChatPromptMetadata,
  ChatSessionLog,
} from "./types";

export const mcpApi = createApi({
  reducerPath: "mcpApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.MCP_DOMAIN}`,
    prepareHeaders: (headers) => {
      const preparedHeaders = prepareAuthHeaders(headers);
      preparedHeaders.set("X-Instance-Zuid", instanceZUID);

      return preparedHeaders;
    },
  }),
  tagTypes: ["ChatSessions", "ChatSessionLog"],
  endpoints: (builder) => ({
    geminiGeneration: builder.mutation<GeminiResponse, any>({
      query: (body) => {
        return {
          url: `client`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: (result, error, { chatZUID }) => [
        { type: "ChatSessionLog", id: chatZUID },
      ],
    }),
    getAllChatSessions: builder.query<ChatSession[], { userZUID: string }>({
      query: ({ userZUID }) => {
        return {
          url: `chats?instanceZuid=${instanceZUID}&userZuid=${userZUID}`,
          method: "GET",
        };
      },
      transformResponse: getResponseData,
      providesTags: ["ChatSessions"],
    }),
    createNewChatSession: builder.mutation<
      any,
      { userZUID: string; roleZUID: string }
    >({
      query: ({ userZUID, roleZUID }) => {
        return {
          url: `chats`,
          method: "POST",
          body: {
            userZuid: userZUID,
            roleZuid: roleZUID,
            instanceZuid: instanceZUID,
          },
        };
      },
      transformErrorResponse: getResponseData,
      invalidatesTags: ["ChatSessions"],
    }),
    getChatSessionLog: builder.query<
      ChatSessionLog,
      { chatZUID: string; userZUID: string }
    >({
      query: ({ chatZUID, userZUID }) => {
        return {
          url: `chats/${chatZUID}?userZuid=${userZUID}&instanceZuid=${instanceZUID}`,
          method: "GET",
        };
      },
      transformResponse: getResponseData,
      providesTags: (results, error, { chatZUID }) => [
        { type: "ChatSessionLog", id: chatZUID },
      ],
    }),
    updatePromptApprovalStatus: builder.mutation<
      void,
      { chatZUID: string; promptZUID: string; approval: "0" | "1" }
    >({
      query: ({ chatZUID, promptZUID, approval }) => {
        return {
          url: `chats/${chatZUID}/prompt/${promptZUID}`,
          method: "PATCH",
          body: { approval, instanceZuid: instanceZUID },
        };
      },
    }),
  }),
});

export const {
  useGeminiGenerationMutation,
  useGetAllChatSessionsQuery,
  useGetChatSessionLogQuery,
  useCreateNewChatSessionMutation,
  useUpdatePromptApprovalStatusMutation,
} = mcpApi;
