import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders as prepareAuthHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";

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
    geminiGeneration: builder.mutation<any, any>({
      query: (body) => {
        return {
          url: `client`,
          method: "POST",
          body,
        };
      },
    }),
    //TODO: Add return types
    getAllChatSessions: builder.query<any, { userZUID: string }>({
      query: ({ userZUID }) => {
        return {
          url: `chats?instanceZuid=${instanceZUID}&userZuid=${userZUID}`,
          method: "GET",
        };
      },
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
            userZUID,
            roleZUID,
            instanceZUID,
          },
        };
      },
      invalidatesTags: ["ChatSessions"],
    }),
    getChatSessionLog: builder.query<any, { chatZUID: string }>({
      query: ({ chatZUID }) => {
        return {
          url: `chats/${chatZUID}`,
          method: "GET",
        };
      },
      providesTags: (results, error, { chatZUID }) => [
        { type: "ChatSessionLog", id: chatZUID },
      ],
    }),
    addNewChatLogItem: builder.mutation<any, { chatZUID: string; body: any }>({
      query: ({ chatZUID, body }) => {
        return {
          url: `chats/${chatZUID}/prompt`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: (result, error, { chatZUID }) => [
        { type: "ChatSessionLog", id: chatZUID },
      ],
    }),
    updatePromptApprovalStatus: builder.mutation<
      void,
      { chatZUID: string; promptZUID: string; approval: 0 | 1 }
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
