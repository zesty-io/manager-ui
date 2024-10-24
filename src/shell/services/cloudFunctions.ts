import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getResponseData, prepareHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";

//Define service using a base URL and expected endpoints
export const cloudFunctionsApi = createApi({
  reducerPath: "cloudFunctionsApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.CLOUD_FUNCTIONS_DOMAIN}`,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    refreshCache: builder.mutation<void, void>({
      query: () => `fastlyPurge?zuid=${instanceZUID}`,
    }),
    aiGeneration: builder.mutation<any, any>({
      query: (body) => {
        return {
          url: `ai`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useRefreshCacheMutation, useAiGenerationMutation } =
  cloudFunctionsApi;
