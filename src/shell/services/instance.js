import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import instanceZUID from "utility/instanceZUID";
import { prepareHeaders } from "./util";
import { resolveResourceType } from "utility/resolveResourceType";

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
        return `env/audits?${params}&limit=100000`;
      },
      transformResponse: (response) => {
        return response.data.map((action) => {
          const normalizedAffectedZUID = action.affectedZUID?.startsWith("12")
            ? action.meta?.uri?.split("/")[4]
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
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAuditsQuery } = instanceApi;
