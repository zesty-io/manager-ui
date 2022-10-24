import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { generateThumbnail, getResponseData, prepareHeaders } from "./util";
import { Bin, File, Group, GroupData } from "./types";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";

// Define a service using a base URL and expected endpoints
export const mediaManagerApi = createApi({
  reducerPath: "mediaManagerApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.SERVICE_MEDIA_MANAGER}`,
    prepareHeaders,
  }),
  tagTypes: [
    "Bin",
    "Bins",
    "BinGroups",
    "BinFiles",
    "File",
    "GroupData",
    "Search",
  ],
  endpoints: (builder) => ({
    getBin: builder.query<Bin[], string>({
      query: (binId) => `bin/${binId}`,
      transformResponse: getResponseData,
      providesTags: (result, error, binId) => [{ type: "Bin", id: binId }],
    }),
    getBins: builder.query<Bin[], { instanceId: number; ecoId: number }>({
      async queryFn(
        { instanceId, ecoId },
        _queryApi,
        _extraOptions,
        fetchWithBQ
      ) {
        try {
          const binResponses = (
            await Promise.all([
              fetchWithBQ(`site/${instanceId}/bins`),
              fetchWithBQ(`eco/${ecoId}/bins`),
            ])
          )
            .filter((response) => !response.error)
            .map(
              (response: QueryReturnValue<any, FetchBaseQueryError>) =>
                response.data.data
            )
            .flat();
          return { data: binResponses };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["Bins"],
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
              thumbnail: generateThumbnail(file),
            })) as File[];
          return { data: files.reverse() };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["BinFiles"],
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
      providesTags: ["BinGroups"],
    }),
    getBinFiles: builder.query<File[], string>({
      query: (binId) => `bin/${binId}/files`,
      providesTags: (result, error, binId) => [{ type: "BinFiles", id: binId }],
      transformResponse: (response: { data: File[] }) =>
        response.data
          .map((file) => ({
            ...file,
            thumbnail: generateThumbnail(file),
          }))
          .reverse(),
    }),
    getBinGroups: builder.query<Group[], string>({
      query: (binId) => `bin/${binId}/groups`,
      providesTags: (result, error, binId) => [
        { type: "BinGroups", id: binId },
      ],
      transformResponse: (response: { data: Group[] }) =>
        response.data.sort((a, b) => a.name.localeCompare(b.name)),
    }),
    getGroupData: builder.query<GroupData, string>({
      query: (groupId) => `group/${groupId}`,
      providesTags: (result, error, groupId) => [
        { type: "GroupData", id: groupId },
      ],
      transformResponse: (response: { data: GroupData[] }) => ({
        ...response.data[0],
        files: response.data[0].files
          .map((file) => ({
            ...file,
            thumbnail: generateThumbnail(file),
          }))
          .reverse(),
        groups: response.data[0].groups.sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }),
    }),
    updateBin: builder.mutation<
      Bin,
      {
        id: string;
        body: { name?: string };
      }
    >({
      query: ({ id, body }) => ({
        url: `/bin/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Bin", id: arg.id },
        "Bins",
      ],
    }),
    getFile: builder.query<File, string>({
      query: (id) => `/file/${id}`,
      transformResponse: (res) => getResponseData(res)[0], // HACK this is probably not the best way to do this.
      providesTags: (result, error, id) => [{ type: "File", id }],
    }),
    updateFile: builder.mutation<
      File,
      {
        id: string;
        previousGroupId?: string;
        body: {
          group_id?: string;
          filename?: string;
          title?: string;
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/file/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: any) => res,
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg?.id },
        { type: "GroupData", id: arg.body?.group_id },
        "BinFiles",
        "Search",
        { type: "GroupData", id: arg?.previousGroupId },
      ],
    }),
    updateFileAltText: builder.mutation<
      File,
      {
        id: string;
        body: {
          group_id?: string;
          filename?: string;
          title?: string;
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/file/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: any) => res,
      invalidatesTags: (result, error, arg) => [
        { type: "File", id: arg?.id },
        "Search",
      ],
    }),
    deleteFile: builder.mutation<
      File,
      {
        id: string;
        body: {
          group_id?: string;
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/file/${id}`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "GroupData", id: arg.body?.group_id },
        "BinFiles",
        "Search",
      ],
    }),
    updateGroup: builder.mutation<
      GroupData,
      {
        id: string;
        body: { name: string; group_id: string };
      }
    >({
      query: ({ id, body }) => ({
        url: `/group/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "GroupData", id: arg.id },
        { type: "GroupData", id: arg.body.group_id },
        "BinGroups",
      ],
    }),
    createGroup: builder.mutation<
      GroupData,
      {
        body: { name: string; bin_id: string; group_id: string };
      }
    >({
      query: ({ body }) => ({
        url: `/group`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "GroupData", id: arg.body.group_id },
        "BinGroups",
      ],
    }),
    deleteGroup: builder.mutation<GroupData, { id: string; groupId: string }>({
      query: ({ id }) => ({
        url: `/group/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "GroupData", id: arg.groupId },
        "BinGroups",
        "BinFiles",
      ],
    }),
    searchBinFiles: builder.query<
      File[],
      {
        binIds: string[];
        term: string;
      }
    >({
      query: ({ binIds, term }) =>
        `/search/files?bins=${binIds.join(",")}&term=${term}`,
      transformResponse: (response: { data: File[] }) =>
        response.data
          .map((file) => ({
            ...file,
            thumbnail: generateThumbnail(file),
          }))
          .reverse(),
      providesTags: ["Search"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetFileQuery,
  useGetBinQuery,
  useGetBinsQuery,
  useGetAllBinFilesQuery,
  useGetAllBinGroupsQuery,
  useGetBinFilesQuery,
  useGetBinGroupsQuery,
  useGetGroupDataQuery,
  useUpdateBinMutation,
  useUpdateFileMutation,
  useUpdateFileAltTextMutation,
  useUpdateGroupMutation,
  useCreateGroupMutation,
  useDeleteFileMutation,
  useDeleteGroupMutation,
  useSearchBinFilesQuery,
} = mediaManagerApi;
