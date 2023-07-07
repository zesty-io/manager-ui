import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { resolveResourceType } from "../../utility/resolveResourceType";
import {
  Audit,
  ContentModelField,
  InstanceSetting,
  LegacyHeader,
  WebView,
  ContentItem,
  ContentModel,
  Publishing,
  SearchQuery,
  HeadTag,
  Web,
  Meta,
  ContentNavItem,
  Stylesheet,
  Script,
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
    "SearchQuery",
    "Stylesheets",
    "Scripts",
  ],
  endpoints: (builder) => ({
    // https://www.zesty.io/docs/instances/api-reference/content/models/items/publishings/#Get-All-Item-Publishings
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
    // https://www.zesty.io/docs/instances/api-reference/content/items/publishings/#Get-All-Items-Publishings
    getAllPublishings: builder.query<Publishing[], void>({
      query: () => ({
        url: `content/items/publishings`,
        params: {
          limit: 10000,
        },
      }),
      transformResponse: getResponseData,
      // TODO: Remove once all item publishing mutations are using rtk query
      keepUnusedDataFor: 0.0001,
    }),
    // https://www.zesty.io/docs/instances/api-reference/content/models/items/publishings/#Delete-Item-Publishing
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
    // https://www.zesty.io/docs/instances/api-reference/env/audits/#Get-All-Audits
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
    // https://www.zesty.io/docs/instances/api-reference/search/#Search
    getContentItem: builder.query<ContentItem, string>({
      query: (ZUID) => `search/items?q=${ZUID}&order=created&dir=DESC&limit=1`,
      transformResponse: (response: { data: any[] }) => response?.data?.[0],
    }),
    getContentItems: builder.query<any, any[]>({
      async queryFn(args, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const requests = args.map(
            (itemZUID) =>
              `search/items?q=${itemZUID}&order=created&dir=DESC&limit=1`
          );
          const responses = await batchApiRequests(requests, fetchWithBQ);
          return {
            data: {
              success: responses.success?.map(
                (response) => response?.data?.data?.[0]
              ),
              error: responses.error,
            },
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    // https://www.zesty.io/docs/instances/api-reference/content/models/items/#Get-All-Items
    getContentModelItems: builder.query<ContentItem[], string>({
      query: (ZUID) => ({
        url: `content/models/${ZUID}/items`,
        params: {
          limit: 5000,
        },
      }),
      transformResponse: getResponseData,
      // Restore cache when content/schema uses rtk query for mutations and can invalidate this
      keepUnusedDataFor: 0.0001,
    }),
    // https://www.zesty.io/docs/instances/api-reference/content/models/items/publishings/#Get-Item-Publishing
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
    // https://www.zesty.io/docs/instances/api-reference/search/#Search
    searchContent: builder.query<ContentItem[], SearchQuery>({
      query: ({ query, ...rest }) => ({
        url: `search/items`,
        params: {
          q: query,
          ...rest,
        },
      }),
      transformResponse: getResponseData,
      // Makes sure that the query is ran everytime the user searches.
      // Prevents issue where the query no longer hits the endpoint
      // when the case-sensitive value on the query parameter is the same as a previous query
      keepUnusedDataFor: 0.0001,
    }),
    // https://www.zesty.io/docs/instances/api-reference/content/models/#Get-Content-Model
    getContentModel: builder.query<ContentModel, string>({
      query: (modelZUID) => `content/models/${modelZUID}`,
      transformResponse: getResponseData,
      providesTags: (result, error, modelZUID) => [
        { type: "ContentModel", id: modelZUID },
      ],
    }),
    // https://www.zesty.io/docs/instances/api-reference/content/models/#Get-All-Content-Models
    getContentModels: builder.query<ContentModel[], void>({
      query: () => `content/models`,
      transformResponse: getResponseData,
      // Restore cache when content/schema uses rtk query for mutations and can invalidate this
      keepUnusedDataFor: 0.0001,
      providesTags: ["ContentModels"],
    }),
    // https://www.zesty.io/docs/instances/api-reference/content/models/#Create-Content-Model
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
    // https://www.zesty.io/docs/instances/api-reference/env/langs/#Get-Langs
    getLangsMapping: builder.query<any, void>({
      query: () => `env/langs/all`,
      transformResponse: getResponseData,
    }),
    // https://www.zesty.io/docs/instances/api-reference/web/headtags/#Get-HeadTag(s)
    getHeadTags: builder.query<HeadTag[], void>({
      query: () => "/web/headtags",
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
    // https://www.zesty.io/docs/instances/api-reference/content/models/#Update-Content-Model
    updateContentModel: builder.mutation<
      any,
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
    // https://www.zesty.io/docs/instances/api-reference/content/models/#Delete-Content-Model
    deleteContentModel: builder.mutation<any, string>({
      query: (ZUID) => ({
        url: `content/models/${ZUID}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContentModels"],
    }),
    // https://www.zesty.io/docs/instances/api-reference/content/models/#Get-Fields
    getContentModelFields: builder.query<ContentModelField[], string>({
      query: (modelZUID) =>
        `content/models/${modelZUID}/fields?showDeleted=true`,
      transformResponse: (res: { data: ContentModelField[] }) =>
        res.data.sort((a, b) => a.sort - b.sort),
      providesTags: (result, error, modelZUID) => [
        { type: "ContentModelFields", id: modelZUID },
      ],
    }),
    // https://www.zesty.io/docs/instances/api-reference/content/models/fields/#Create-Field
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
    // https://www.zesty.io/docs/instances/api-reference/content/models/fields/#Create-Field
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
    // https://www.zesty.io/docs/instances/api-reference/content/models/fields/#Update-Field
    updateContentModelField: builder.mutation<
      any,
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
    // https://www.zesty.io/docs/instances/api-reference/content/models/fields/#Update-Field
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
    // https://www.zesty.io/docs/instances/api-reference/content/models/fields/#Delete-Field
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
    // https://www.zesty.io/docs/instances/api-reference/content/#Get-View(s)
    getWebViews: builder.query<WebView[], void | { status?: "live" | "dev" }>({
      query: (params) => {
        return {
          url: "web/views",
          params: params || {},
        };
      },
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
    // https://www.zesty.io/docs/instances/api-reference/env/settings/#Get-All-Settings
    getInstanceSettings: builder.query<InstanceSetting[], void>({
      query: () => `/env/settings`,
      transformResponse: getResponseData,
      providesTags: ["InstanceSettings"],
    }),
    // https://www.zesty.io/docs/instances/api-reference/env/settings/#Create-Setting
    createInstanceSettings: builder.mutation<any, any>({
      query: (body) => ({
        url: `/env/settings`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["InstanceSettings"],
    }),
    // https://www.zesty.io/docs/instances/api-reference/env/settings/#Update-Setting
    updateInstanceSetting: builder.mutation<any, InstanceSetting>({
      query: (body) => ({
        url: `/env/settings/${body.ZUID}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["InstanceSettings"],
    }),
    // https://www.zesty.io/docs/instances/api-reference/env/settings/#Create-Item
    createContentItem: builder.mutation<
      any,
      { modelZUID: string; body: { web: Partial<Web>; meta: Partial<Meta> } }
    >({
      query: ({ modelZUID, body }) => ({
        url: `content/models/${modelZUID}/items`,
        method: "POST",
        body,
      }),
    }),
    // https://www.zesty.io/docs/instances/api-reference/env/nav/#Get-Content-Navigation
    getContentNavItems: builder.query<ContentNavItem[], void>({
      query: () => `/env/nav`,
      transformResponse: getResponseData,
    }),
    // https://www.zesty.io/docs/instances/api-reference/web/stylesheets/#Get-Stylesheet(s)
    getStylesheets: builder.query<Stylesheet[], void>({
      query: () => `/web/stylesheets`,
      transformResponse: getResponseData,
      providesTags: ["Stylesheets"],
    }),
    // https://www.zesty.io/docs/instances/api-reference/web/scripts/#Get-Script(s)
    getScripts: builder.query<Script[], void>({
      query: () => `/web/scripts`,
      transformResponse: getResponseData,
      providesTags: ["Scripts"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetAuditsQuery,
  useGetItemPublishingsQuery,
  useGetAllPublishingsQuery,
  useDeleteItemPublishingMutation,
  useGetContentItemQuery,
  useGetContentItemsQuery,
  useGetContentModelQuery,
  useGetContentModelsQuery,
  useGetContentModelItemsQuery,
  useGetContentItemPublishingsQuery,
  useSearchContentQuery,
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
  useGetHeadTagsQuery,
  useCreateContentModelFromTemplateMutation,
  useGetLegacyHeadTagsQuery,
  useGetInstanceSettingsQuery,
  useUpdateInstanceSettingMutation,
  useCreateContentItemMutation,
  useGetContentNavItemsQuery,
  useGetStylesheetsQuery,
  useGetScriptsQuery,
  useCreateInstanceSettingsMutation,
} = instanceApi;
