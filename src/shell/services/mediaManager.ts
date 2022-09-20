import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { resolveResourceType } from "../../utility/resolveResourceType";
import { Bin, File, Group, GroupData, Publishing } from "./types";
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
    getEcoBins: builder.query<Bin[], number>({
      query: (ecoId) => `eco/${ecoId}/bins`,
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
            .flat()
            .map((file) => ({
              ...file,
              // @ts-expect-error Need to type window object
              thumbnail: `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${file.id}/getimage?w=200&h=200&type=fit`,
            })) as File[];
          return { data: files };
        } catch (error) {
          return { error };
        }
      },
      providesTags: (result, error, binIds) =>
        binIds.map((binId) => ({ type: "BinFiles", id: binId })),
    }),
    getAllBinGroups: builder.query<Group[][], string[]>({
      async queryFn(binIds, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const groupResponses = (await Promise.all(
            (binIds as string[]).map((binId) =>
              fetchWithBQ(`bin/${binId}/groups`)
            )
          )) as QueryReturnValue<any, FetchBaseQueryError>[];
          const groups = groupResponses.map(
            (groupResponse) => groupResponse.data.data
          ) as Group[][];
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
      transformResponse: (response: { data: File[] }) =>
        response.data.map((file) => ({
          ...file,
          // @ts-expect-error Need to type window object
          thumbnail: `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${file.id}/getimage?w=200&h=200&type=fit`,
        })),
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
      transformResponse: (response: { data: GroupData[] }) => ({
        ...response.data[0],

        files: response.data[0].files.map((file) => ({
          ...file,
          // @ts-expect-error Need to type window object
          thumbnail: `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${file.id}/getimage?w=200&h=200&type=fit`,
        })),
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetSiteBinsQuery,
  useGetEcoBinsQuery,
  useGetAllBinFilesQuery,
  useGetAllBinGroupsQuery,
  useGetBinFilesQuery,
  useGetBinGroupsQuery,
  useGetGroupDataQuery,
} = mediaManagerApi;
