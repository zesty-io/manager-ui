import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getResponseData, prepareHeaders } from "./util";
import { Bin } from "./types";

export const mediaStorageApi = createApi({
  reducerPath: "mediaStorageApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.SERVICE_MEDIA_STORAGE}`,
    prepareHeaders,
  }),
  tagTypes: ["BinFiles"],
  endpoints: (builder) => ({
    uploadFileToBin: builder.mutation<
      any,
      {
        userId: string;
        bin: Bin;
        file: any;
      }
    >({
      query: ({ userId, bin, file }) => {
        const formData = new FormData();
        formData.append("file", file?.file);
        formData.append("bin_id", bin?.id);
        formData.append("group_id", bin?.id);
        formData.append("user_id", userId);

        return {
          url: `/upload/${bin?.storage_driver}/${bin?.storage_name}`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: getResponseData,
      invalidatesTags: ["BinFiles"],
    }),
  }),
});

export const { useUploadFileToBinMutation } = mediaStorageApi;
