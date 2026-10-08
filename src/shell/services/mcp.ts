import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";
import { AppState } from "../store/types";

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
        { getState },
        _extraOptions,
        baseQuery
      ) => {
        const password = (getState() as AppState).settings.instance.find(
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
        const result = await baseQuery({
          url: `${origin}/-/pvl/?${query}`,
          method: "POST",
          body,
          timeout,
          responseHandler: "text",
        });
        return result.error
          ? { error: result.error }
          : { data: result.data as string };
      },
    }),
  }),
});

export const { useGeminiGenerationMutation, useRenderParsleyPreviewMutation } =
  mcpApi;
