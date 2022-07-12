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
      query: () => `env/audits`,
      transformResponse: (response) => {
        // Adds additional resource type property to data set
        return response.data.map((resource) => ({
          ...resource,
          resourceType: getResourceType(resource.affectedZUID),
        }));
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAuditsQuery } = instanceApi;
