import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { resolveResourceType } from "../../utility/resolveResourceType";
import { Bin, Group, GroupData, Publishing } from "./types";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";

// Define a service using a base URL and expected endpoints
export const mediaManagerApi = createApi({
  reducerPath: "mediaManagerApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.SERVICE_MEDIA_MANAGER}`,
    prepareHeaders,
  }),
  tagTypes: ["BinGroups", "BinFiles", "GroupData"],
  endpoints: (builder) => ({
    getSiteBins: builder.query<Bin[], number>({
      query: (instanceId) => `site/${instanceId}/bins`,
      transformResponse: getResponseData,
    }),
    getAllBinFiles: builder.query<File[], string[]>({
      async queryFn(binIds, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const fileResponses = (await Promise.all(
            (binIds as string[]).map((binId) =>
              fetchWithBQ(`bin/${binId}/files`)
            )
          )) as QueryReturnValue<any, FetchBaseQueryError>[];
          const files = fileResponses
            .map((fileResponse) => fileResponse.data.data)
            .flat() as File[];
          return { data: files };
        } catch (error) {
          return { error };
        }
      },
      providesTags: (result, error, binIds) =>
        binIds.map((binId) => ({ type: "BinFiles", id: binId })),
    }),
    getAllBinGroups: builder.query<Group[], string[]>({
      async queryFn(binIds, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const groupResponses = (await Promise.all(
            (binIds as string[]).map((binId) =>
              fetchWithBQ(`bin/${binId}/groups`)
            )
          )) as QueryReturnValue<any, FetchBaseQueryError>[];
          const groups = groupResponses
            .map((groupResponse) => groupResponse.data.data)
            .flat() as Group[];
          return { data: groups };
        } catch (error) {
          return { error };
        }
      },
      providesTags: (result, error, binIds) =>
        binIds.map((binId) => ({ type: "BinGroups", id: binId })),
    }),
    getBinFiles: builder.query<File[], string>({
      query: (binId) => `bin/${binId}/files`,
      providesTags: (result, error, binId) => [{ type: "BinFiles", id: binId }],
      transformResponse: getResponseData,
    }),
    getBinGroups: builder.query<Group[], string>({
      query: (binId) => `bin/${binId}/groups`,
      providesTags: (result, error, binId) => [
        { type: "BinGroups", id: binId },
      ],
      transformResponse: getResponseData,
    }),
    getGroupData: builder.query<GroupData, string>({
      query: (groupId) => `group/${groupId}`,
      providesTags: (result, error, groupId) => [
        { type: "GroupData", id: groupId },
      ],
      transformResponse: getResponseData,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetSiteBinsQuery,
  useGetAllBinFilesQuery,
  useGetAllBinGroupsQuery,
  useGetBinFilesQuery,
  useGetBinGroupsQuery,
  useGetGroupDataQuery,
} = mediaManagerApi;
