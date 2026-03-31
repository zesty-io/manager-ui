import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getResponseData, prepareHeaders as prepareAuthHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";
import { ChatSession, GeminiResponse } from "./types";

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
    }),
    //TODO: Add return types
    getAllChatSessions: builder.query<ChatSession[], { userZUID: string }>({
      query: ({ userZUID }) => {
        return {
          url: `chats?instanceZuid=${instanceZUID}&userZuid=${userZUID}`,
          method: "GET",
        };
      },
      providesTags: ["ChatSessions"],
      transformResponse: getResponseData,
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
      invalidatesTags: ["ChatSessions"],
    }),
    getChatSessionLog: builder.query<
      any,
      { chatZUID: string; userZUID: string }
    >({
      query: ({ chatZUID, userZUID }) => {
        return {
          url: `chats/${chatZUID}?userZuid=${userZUID}&instanceZuid=${instanceZUID}`,
          method: "GET",
        };
      },
      providesTags: (results, error, { chatZUID }) => [
        { type: "ChatSessionLog", id: chatZUID },
      ],
    }),
    addNewChatLogItem: builder.mutation<
      any,
      {
        chatZUID: string;
        body: {
          prompt: string;
          response: {
            data: any;
            message: string;
          };
          metadata: {
            tone: string;
            language: string;
            modelZuid: string;
            itemZuid: string;
            registryKeys: string[];
            refRegistry: string[];
            temperature: number;
          };
          url: string;
          approval: "0";
        };
      }
    >({
      query: ({ chatZUID, body }) => {
        return {
          url: `chats/${chatZUID}/prompt`,
          method: "POST",
          body: {
            ...body,
            instanceZuid: instanceZUID,
          },
        };
      },
      invalidatesTags: (result, error, { chatZUID }) => [
        { type: "ChatSessionLog", id: chatZUID },
      ],
    }),
    updatePromptApprovalStatus: builder.mutation<
      void,
      { chatZUID: string; promptZUID: string; approval: "0" | "1" }
    >({
      query: ({ chatZUID, promptZUID, approval }) => {
        return {
          url: `chats/${chatZUID}/prompts/${promptZUID}`,
          method: "PATCH",
          body: { approval },
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
  useAddNewChatLogItemMutation,
  useUpdatePromptApprovalStatusMutation,
} = mcpApi;
