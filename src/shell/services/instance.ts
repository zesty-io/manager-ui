import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { resolveResourceType } from "../../utility/resolveResourceType";
import {
  Audit,
  ContentItem,
  ContentModel,
  ContentModelField,
  InstanceSetting,
  Publishing,
  LegacyHeader,
  WebView,
  ContentModelItem,
} from "./types";
import { batchApiRequests } from "../../utility/batchApiRequests";

// Define a service using a base URL and expected endpoints
export const instanceApi = createApi({
  reducerPath: "instanceApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.API_INSTANCE_PROTOCOL}${instanceZUID}${__CONFIG__.API_INSTANCE}`,
    prepareHeaders,
  }),
  tagTypes: [
    "ItemPublishing",
    "ContentModels",
    "ContentModel",
    "ContentModelFields",
    "ContentModelField",
    "WebViews",
    "InstanceSettings",
  ],
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
    getAudits: builder.query<Audit[], any>({
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
      // always refresh audits to avoid invalidating the cache on every request
      keepUnusedDataFor: 0.0001,
    }),
    getContentItem: builder.query<ContentItem, string>({
      query: (ZUID) => `search/items?q=${ZUID}&order=created&dir=DESC&limit=1`,
      transformResponse: (response: { data: any[] }) => response?.data?.[0],
    }),
    getContentModelItems: builder.query<ContentItem[], string>({
      query: (ZUID) => `content/models/${ZUID}/items`,
      transformResponse: getResponseData,
      // Restore cache when content/schema uses rtk query for mutations and can invalidate this
      keepUnusedDataFor: 0.0001,
    }),
    getContentItemPublishings: builder.query<
      ContentModel[],
      { modelZUID: string; itemZUID: string }
    >({
      query: ({ modelZUID, itemZUID }) =>
        `content/models/${modelZUID}/items/${itemZUID}/publishings`,
      transformResponse: getResponseData,
      // Restore cache once content/schema uses rtk query for mutations and can invalidate this
      keepUnusedDataFor: 0.0001,
    }),
    getContentModel: builder.query<ContentModel, string>({
      query: (modelZUID) => `content/models/${modelZUID}`,
      transformResponse: getResponseData,
      providesTags: (result, error, modelZUID) => [
        { type: "ContentModel", id: modelZUID },
      ],
    }),
    getContentModels: builder.query<ContentModel[], void>({
      query: () => `content/models`,
      transformResponse: getResponseData,
      // Restore cache when content/schema uses rtk query for mutations and can invalidate this
      keepUnusedDataFor: 0.0001,
      providesTags: ["ContentModels"],
    }),
    createContentModel: builder.mutation<
      { data: ContentModel },
      Partial<ContentModel>
    >({
      query: (body) => ({
        url: `content/models`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContentModels", "WebViews"],
    }),
    getLangsMapping: builder.query<any, void>({
      query: () => `env/langs/all`,
      transformResponse: getResponseData,
    }),
    createContentModelFromTemplate: builder.mutation<
      any,
      { instance_zuid: string; repository: string; parent_zuid: string }
    >({
      query: (body) => ({
        // @ts-ignore
        url: `${CONFIG.SERVICE_INSTANCE_INSTALLER}/install/model`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ContentModels"],
    }),
    updateContentModel: builder.mutation<
      any,
      // Could also be refactored to use single object param and destructure ZUID if needed
      { ZUID: string; body: Partial<ContentModel> }
    >({
      query: ({ ZUID, body }) => ({
        url: `content/models/${ZUID}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ContentModel", id: arg.ZUID },
        "ContentModels",
      ],
    }),
    deleteContentModel: builder.mutation<
      any,
      // Could also be refactored to use single object param and destructure ZUID if needed
      string
    >({
      query: (ZUID) => ({
        url: `content/models/${ZUID}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContentModels"],
    }),
    getContentModelFields: builder.query<ContentModelField[], string>({
      query: (modelZUID) =>
        `content/models/${modelZUID}/fields?showDeleted=true`,
      transformResponse: (res: { data: ContentModelField[] }) =>
        res.data.sort((a, b) => a.sort - b.sort),
      providesTags: (result, error, modelZUID) => [
        { type: "ContentModelFields", id: modelZUID },
      ],
    }),
    createContentModelField: builder.mutation<
      any,
      {
        modelZUID: string;
        body: Omit<
          ContentModelField,
          "ZUID" | "datatypeOptions" | "createdAt" | "updatedAt" | "deletedAt"
        >;
        skipInvalidation?: boolean;
      }
    >({
      query: ({ modelZUID, body }) => ({
        url: `content/models/${modelZUID}/fields`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => {
        if (!arg.skipInvalidation) {
          return [{ type: "ContentModelFields", id: arg.modelZUID }];
        }

        return [];
      },
    }),
    updateContentModelField: builder.mutation<
      any,
      // Could also be refactored to use single object param and destructure ZUID if needed
      { modelZUID: string; fieldZUID: string; body: ContentModelField }
    >({
      query: ({ modelZUID, fieldZUID, body }) => ({
        url: `content/models/${modelZUID}/fields/${fieldZUID}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ContentModelFields", id: arg.modelZUID },
      ],
    }),
    bulkCreateContentModelField: builder.mutation<
      any,
      { modelZUID: string; fields: Omit<ContentModelField, "ZUID">[] }
    >({
      async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const requests = args.fields.map((field) => ({
            url: `content/models/${args.modelZUID}/fields`,
            method: "POST",
            body: field,
          }));
          const responses = await batchApiRequests(requests, fetchWithBQ);
          return {
            data: {
              success: responses.success,
              error: responses.error,
            },
          };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "ContentModelFields", id: arg.modelZUID },
      ],
    }),
    bulkUpdateContentModelField: builder.mutation<
      any,
      { modelZUID: string; fields: ContentModelField[] }
    >({
      async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const requests = args.fields.map((field) => ({
            url: `content/models/${args.modelZUID}/fields/${field.ZUID}`,
            method: "PUT",
            body: field,
          }));
          const responses = await batchApiRequests(requests, fetchWithBQ);
          return {
            data: {
              success: responses.success,
              error: responses.error,
            },
          };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "ContentModelFields", id: arg.modelZUID },
      ],
    }),
    deleteContentModelField: builder.mutation<
      any,
      // Could also be refactored to use single object param and destructure ZUID if needed
      { modelZUID: string; fieldZUID: string }
    >({
      query: ({ modelZUID, fieldZUID }) => ({
        url: `content/models/${modelZUID}/fields/${fieldZUID}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ContentModelFields", id: arg.modelZUID },
      ],
    }),
    getWebViews: builder.query<WebView[], void>({
      query: () => `/web/views`,
      transformResponse: getResponseData,
      providesTags: ["WebViews"],
    }),
    undeleteContentModelField: builder.mutation<
      any,
      { modelZUID: string; fieldZUID: string }
    >({
      query: ({ modelZUID, fieldZUID }) => ({
        url: `content/models/${modelZUID}/fields/${fieldZUID}?action=undelete`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ContentModelFields", id: arg.modelZUID },
      ],
    }),
    getLegacyHeadTags: builder.query<LegacyHeader[], void>({
      query: () => `/web/headers`,
      transformResponse: getResponseData,
    }),
    getInstanceSettings: builder.query<InstanceSetting[], void>({
      query: () => `/env/settings`,
      transformResponse: getResponseData,
      providesTags: ["InstanceSettings"],
    }),
    updateInstanceSetting: builder.mutation<any, InstanceSetting>({
      query: (body) => ({
        url: `/env/settings/${body.ZUID}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["InstanceSettings"],
    }),
    createContentItem: builder.mutation<
      any,
      { modelZUID: string; body: ContentModelItem }
    >({
      query: ({ modelZUID, body }) => ({
        url: `content/models/${modelZUID}/items`,
        method: "POST",
        body,
      }),
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
  useGetContentModelsQuery,
  useGetContentModelItemsQuery,
  useGetContentItemPublishingsQuery,
  useGetContentModelFieldsQuery,
  useBulkUpdateContentModelFieldMutation,
  useUpdateContentModelMutation,
  useCreateContentModelFieldMutation,
  useUpdateContentModelFieldMutation,
  useCreateContentModelMutation,
  useGetWebViewsQuery,
  useBulkCreateContentModelFieldMutation,
  useDeleteContentModelFieldMutation,
  useUndeleteContentModelFieldMutation,
  useDeleteContentModelMutation,
  useGetLangsMappingQuery,
  useCreateContentModelFromTemplateMutation,
  useGetLegacyHeadTagsQuery,
  useGetInstanceSettingsQuery,
  useUpdateInstanceSettingMutation,
  useCreateContentItemMutation,
} = instanceApi;
