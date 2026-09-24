import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";

export const mcpApi = createApi({
  reducerPath: "mcpApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${__CONFIG__.MCP_DOMAIN}`,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    geminiGeneration: builder.mutation<any, any>({
      query: (body) => {
        return {
          url: `client`,
          method: "POST",
          body,
          headers: {
            "X-Instance-Zuid": instanceZUID,
          },
        };
      },
    }),
    // WebEngine's PVL endpoint: renders a Parsley source against a content
    // item and returns the HTML. `url` is absolute (the instance's preview
    // host), so it bypasses this service's baseUrl.
    renderParsleyPreview: builder.mutation<
      string,
      { url: string; parsley: string; itemZUID: string; timeout: number }
    >({
      query: ({ url, parsley, itemZUID, timeout }) => {
        const body = new FormData();
        body.append("parsley", parsley);
        body.append("zuid", itemZUID);
        return {
          url,
          method: "POST",
          body,
          timeout,
          responseHandler: "text",
        };
      },
    }),
  }),
});

export const { useGeminiGenerationMutation, useRenderParsleyPreviewMutation } =
  mcpApi;
