import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZUID from "utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";

const normalizeContent = response =>
  response.data.reduce((acc, item) => {
    acc[item.meta.ZUID] = item;
    return acc;
  }, {});

// Define a service using a base URL and expected endpoints
export const instanceApi = createApi({
  reducerPath: "instanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${__CONFIG__.API_INSTANCE_PROTOCOL}${instanceZUID}${__CONFIG__.API_INSTANCE}`,
    prepareHeaders
  }),
  endpoints: builder => ({
    searchContentItems: builder.query({
      // TODO: add notification on error
      query: (
        { query, order, dir, limit } = {
          order: "created",
          dir: "DESC",
          limit: "100"
        }
      ) => `search/items?q=${query}&order=${order}&dir=${dir}&limit=${limit}`,
      transformResponse: normalizeContent
    }),
    getContentItemsByModel: builder.query({
      // TODO: add notification on error
      query: options => {
        options.limit ||= 100;
        options.page ||= 1;
        const params = new URLSearchParams(options).toString();

        return `content/models/${modelZuid}/items?${params}`;
      },
      transformResponse: normalizeContent
    }),
    getContentItem: builder.query({
      query: ({ modelZuid, itemZuid }) =>
        `content/models/${modelZuid}/items/${itemZuid}`,
      transformResponse: getResponseData
    }),
    createContentItem: builder.mutation({
      query: ({ modelZuid, item }) => ({
        url: `content/models/${modelZuid}/items`,
        method: "POST",
        body: item
      })
    }),
    updateContentItem: builder.mutation({
      query: ({ modelZuid, item }) => ({
        url: `content/models/${modelZuid}/items/${item.meta.ZUID}`,
        method: "PUT",
        body: item
      })
    }),
    deleteContentItem: builder.mutation({
      query: ({ modelZuid, item }) => ({
        url: `content/models/${modelZuid}/items/${item.meta.ZUID}`,
        method: "DELETE"
      })
    })
  })
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// export const { } = instanceApi;
