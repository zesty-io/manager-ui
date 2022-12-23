import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import { uniqBy } from "lodash";

type UnorderedQuery = {
  limit?: number;
  startDate?: string;
  endDate?: string;
  query: string;
};

type OrderedQuery = UnorderedQuery & {
  order?: "created" | "modified" | "name";
  dir: "asc" | "desc";
};

type Query = UnorderedQuery | OrderedQuery;

type SearchResult = {
  data: {
    [key: string]: number | string | null | undefined;
  };
  meta: {
    ZUID: string;
    masterZUID: string;
    contentModelZUID: string;
    sort: number;
    listed: boolean;
    version: number;
    langID: number;
    createdAt: string;
    updatedAt: string;
  };
  web: {
    version: number;
    versionZUID: string;
    metaDescription: string;
    metaTitle: string;
    metaLinkText: string;
    pathPart: string;
    path: string;
    sitemapPriority: number;
    canonicalTagMode: number;
    createdByUserZUID: string;
    createdAt: string;
    updatedAt: string;
  };
};

//Define service using a base URL and expected endpoints
export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.API_INSTANCE_PROTOCOL}${instanceZUID}${__CONFIG__.API_INSTANCE}/search/items`,
    prepareHeaders,
  }),
  tagTypes: ["SearchQuery"],
  endpoints: (builder) => ({
    getSearchResults: builder.query<SearchResult[], Query>({
      query: (options) => {
        const parts = [`?q=${options.query}`];
        // UnorderedQuery
        if (options.limit) parts.push(`limit=${options.limit}`);
        if (options.startDate) parts.push(`startDate=${options.startDate}`);
        if (options.endDate) parts.push(`endDate=${options.endDate}`);
        // OrderedQuery
        if ("order" in options) parts.push(`order=${options.order}`);
        if ("dir" in options) parts.push(`dir=${options.dir}`);

        return parts.join("&");
      },
      transformResponse: getResponseData,
      providesTags: (result, error, { query }) => [
        { type: "SearchQuery", query },
      ],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetSearchResultsQuery } = searchApi;
