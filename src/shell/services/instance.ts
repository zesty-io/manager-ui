import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { resolveResourceType } from "../../utility/resolveResourceType";
import { Publishing } from "./types";

// Define a service using a base URL and expected endpoints
export const instanceApi = createApi({
  reducerPath: "instanceApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.API_INSTANCE_PROTOCOL}${instanceZUID}${__CONFIG__.API_INSTANCE}`,
    prepareHeaders,
  }),
  tagTypes: ["ItemPublishing"],
  endpoints: (builder) => ({
    getItemPublishings: builder.query<
      Publishing[],
      { modelZUID: string; itemZUID: string }
    >({
      query: ({ modelZUID, itemZUID }) =>
        `content/models/${modelZUID}/items/${itemZUID}/publishings`,
      transformResponse: getResponseData,
      keepUnusedDataFor: 0.0001,
      providesTags: (result, error, id) => [
        { type: "ItemPublishing", id: id.itemZUID },
      ],
    }),
    deleteItemPublishing: builder.mutation<
      any,
      { modelZUID: string; itemZUID: string; publishingZUID: string }
    >({
      query: ({ modelZUID, itemZUID, publishingZUID }) => ({
        url: `content/models/${modelZUID}/items/${itemZUID}/publishings/${publishingZUID}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ItemPublishing", id: id.itemZUID },
      ],
    }),
    getAudits: builder.query({
      query: (options) => {
        const params = new URLSearchParams(options as any).toString();
        return `env/audits?${params}&limit=100000`;
      },
      transformResponse: (response: { data: any[] }) => {
        return response.data.map((action) => {
          const normalizedAffectedZUID = action.affectedZUID?.startsWith("12")
            ? // Obtain model ID via URI or via message for older audit items that to do not have URI field
              action.meta?.uri?.split("/")[4] ||
              action.meta?.message?.split(" ")[5]?.replaceAll("`", "")
            : action.action === 5
            ? action.meta?.uri?.split("/")[6]
            : action.affectedZUID;

          // Sets action number to 6 for scheduled publishes in order differentiate publish types
          const normalizedAction =
            action.action === 4 && action?.meta?.message.includes("scheduled")
              ? 6
              : action.action;
          return {
            ...action,
            resourceType: resolveResourceType(
              normalizedAffectedZUID || action.affectedZUID
            ),
            affectedZUID: normalizedAffectedZUID || action.affectedZUID,
            action: normalizedAction,
          };
        });
      },
    }),
    getContentItem: builder.query<any, string>({
      query: (ZUID) => `search/items?q=${ZUID}&order=created&dir=DESC&limit=1`,
      transformResponse: (response: { data: any[] }) => response?.data?.[0],
    }),
    getContentModel: builder.query<any, string>({
      query: (modelZUID) => `content/models/${modelZUID}`,
      transformResponse: getResponseData,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetAuditsQuery,
  useGetItemPublishingsQuery,
  useDeleteItemPublishingMutation,
  useGetContentItemQuery,
  useGetContentModelQuery,
} = instanceApi;
