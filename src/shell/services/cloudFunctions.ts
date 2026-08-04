import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareHeaders } from "./util";
import instanceZUID from "../../utility/instanceZUID";
import { IntegrationRequestHeaders } from "./types";

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
    getExternalApi: builder.mutation<
      any,
      { url: string; options: any; signal: AbortSignal }
    >({
      query: ({ url, options = {}, signal = null }) => {
        const encodedURL = encodeURI(url);
        return {
          url: `get-url`,
          method: "POST",
          params: {
            url: encodedURL,
          },
          body: options,
          ...(!!signal && { signal }),
        };
      },
    }),
    sendEmail: builder.mutation<
      // any: response shape isn't documented by the external cloud function; no caller reads it
      any,
      {
        to: string;
        subject: string;
        body: string;
        from?: string;
        template?: string;
      }
    >({
      query: (body) => {
        return {
          url: `sendEmail`,
          method: "POST",
          body,
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
  useGetExternalApiMutation,
  useSendEmailMutation,
} = cloudFunctionsApi;
