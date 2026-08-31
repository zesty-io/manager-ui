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
  }),
});

export const { useGeminiGenerationMutation } = mcpApi;
