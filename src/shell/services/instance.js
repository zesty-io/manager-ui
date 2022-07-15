import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZUID from "utility/instanceZUID";
import { prepareHeaders } from "./util";
import { getResourceType } from "../../utility/getResourceType";

// Define a service using a base URL and expected endpoints
export const instanceApi = createApi({
  reducerPath: "instanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${__CONFIG__.API_INSTANCE_PROTOCOL}${instanceZUID}${__CONFIG__.API_INSTANCE}`,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getAudits: builder.query({
      query: (options) => {
        const params = new URLSearchParams(options).toString();
        return `env/audits?${params}`;
      },
      transformResponse: (response) => {
        // Adds additional resource type property to data set
        return response.data.map((resource) => {
          const normalizedAffectedZuid = resource.affectedZUID.startsWith("12")
            ? resource.meta.uri.split("/")[4]
            : resource.action === 5
            ? resource.meta.uri.split("/")[6]
            : resource.affectedZUID;

          // Sets new action number to differentiate between publish and scheduled publish
          const normalizedAction =
            resource.action === 4 && resource.meta.message.includes("scheduled")
              ? 9
              : resource.action;
          return {
            ...resource,
            resourceType: getResourceType(normalizedAffectedZuid),
            affectedZUID: normalizedAffectedZuid,
            action: normalizedAction,
          };
        });
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAuditsQuery } = instanceApi;
