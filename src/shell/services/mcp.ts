import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getResponseData, prepareHeaders as prepareAuthHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";
import { AppState } from "../store/types";
import {
  ChatSession,
  GeminiResponse,
  ChatPromptMetadata,
  ChatSessionLog,
} from "./types";

// PVL is on the instance's preview host, whose CORS preflight allows
// `Authorization` only, so it does not get the MCP service's
// `X-Instance-Zuid` header.
const pvlBaseQuery = fetchBaseQuery({ prepareHeaders: prepareAuthHeaders });

export const mcpApi = createApi({
  reducerPath: "mcpApi",
  baseQuery: fetchBaseQuery({
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
      invalidatesTags: (result, error, { chatZuid }) =>
        error ? [] : [{ type: "ChatSessionLog", id: chatZuid }],
    }),
    getChatSessions: builder.query<ChatSession[], void>({
      query: () => {
        return {
          url: `api/chats`,
          method: "GET",
        };
      },
      transformResponse: getResponseData,
      providesTags: ["ChatSessions"],
    }),
    getChatSessionLog: builder.query<ChatSessionLog, { chatZUID: string }>({
      query: ({ chatZUID }) => {
        return {
          url: `api/chats/${chatZUID}?instanceZuid=${instanceZUID}`,
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
          url: `api/chats/${chatZUID}/prompt/${promptZUID}`,
          method: "PATCH",
          body: { approval, instanceZuid: instanceZUID },
        };
      },
    }),
    // WebEngine's PVL endpoint: renders a Parsley source against a content
    // item and returns the HTML. `origin` is the instance's preview host, so
    // the URL bypasses this service's baseUrl. The preview password is read
    // here rather than passed in: mutation args ride along on every action
    // for the request, and the Sentry middleware reports the last one.
    renderParsleyPreview: builder.mutation<
      string,
      { origin: string; parsley: string; itemZUID: string; timeout: number }
    >({
      queryFn: async (
        { origin, parsley, itemZUID, timeout },
        api,
        extraOptions
      ) => {
        const password = (api.getState() as AppState).settings.instance.find(
          (setting: { key: string; value: string }) =>
            setting.key === "preview_lock_password" && setting.value
        )?.value;
        // Studio's bridge paints the result between the canvas's own region
        // markers.
        const query = new URLSearchParams({ studio: "bridge" });
        if (password) query.set("zpw", password);
        const body = new FormData();
        body.append("parsley", parsley);
        body.append("zuid", itemZUID);
        const result = await pvlBaseQuery(
          {
            url: `${origin}/-/pvl/?${query}`,
            method: "POST",
            body,
            timeout,
            responseHandler: "text",
          },
          api,
          extraOptions
        );
        return result.error
          ? { error: result.error }
          : { data: result.data as string };
      },
    }),
  }),
});

export const {
  useGeminiGenerationMutation,
  useGetChatSessionLogQuery,
  useUpdatePromptApprovalStatusMutation,
  useGetChatSessionsQuery,
  useRenderParsleyPreviewMutation,
} = mcpApi;
