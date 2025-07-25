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
    geminiGeneration: builder.mutation<any, any>({
      query: (body) => {
        return {
          url: `ask-gemini`,
          method: "POST",
          body,
        };
      },
    }),
    createScreenshot: builder.mutation<
      {
        url: string;
      },
      string
    >({
      query: (url) => {
        return {
          url: `createScreenshot`,
          method: "GET",
          params: {
            // @ts-ignore
            bucket: `${__CONFIG__.INSTANCE_SCREENSHOTS_BUCKET}`,
            url: url,
            w: 1280,
            h: 720,
          },
        };
      },
    }),
    downloadCsv: builder.query<
      string[],
      {
        modelZUID: string;
      }
    >({
      query: ({ modelZUID }) => {
        return {
          url: `downloadCSV`,
          method: "GET",
          params: {
            instanceZUID,
            modelZUID,
          },
          responseHandler: async (response) =>
            window.location.assign(
              window.URL.createObjectURL(await response.blob())
            ),
          cache: "no-cache",
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useRefreshCacheMutation,
  useAiGenerationMutation,
  useCreateScreenshotMutation,
  useDownloadCsvQuery,
  useLazyDownloadCsvQuery,
  useGeminiGenerationMutation,
} = cloudFunctionsApi;
