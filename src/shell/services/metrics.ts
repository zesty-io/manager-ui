import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import instanceZUID from "../../utility/instanceZUID";
import { getResponseData, prepareHeaders } from "./util";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import { uniqBy } from "lodash";

type MetricsRegion = {
  Name:
    | "Asia"
    | "EU-Central"
    | "EU-East"
    | "EU-West"
    | "SA-East"
    | "US-Central"
    | "US-East"
    | "US-West";
  MBs: number;
  GBs: number;
  TBs: number;
  Requests: number;
};
type TopMedia = {
  FullPath: string;
  FileName: string;
  Requests: number;
  ThroughtputMB: number;
  ThroughtputGB: number;
  ThroughtputTB: number;
};

type SharedMetricsData = {
  Account: {
    Name: string;
    Zuid: string;
    ID: number;
    Domain: string;
    DomainVerified: boolean;
    StorageName: string;
    CdnURL: string;
    CreatedAt: string;
    PlanID: number;
    InitialPlateID: number;
    Links: {
      Account: string;
      AccountRequests: string;
      AccountUsage: string;
    };
  };
  TimePeriod: {
    DateStart: string;
    DateEnd: string;
  };
};
type Usage = SharedMetricsData & {
  MediaConsumption: {
    TotalMBs: number;
    TotalGBs: number;
    TotalTBs: number;
    TotalRequests: number;
    Regions: MetricsRegion[];
  };
  TopMedia: TopMedia[] | null;
};

type TopPath = {
  FullPath: string;
  Host: string;
  Path: string;
  RequestCount: number;
  DataThroughputInMB: number;
  DataThroughputInGB: number;
  DataThroughputInTB: number;
};
type ResponseCode = 200 | 301 | 403 | 404 | 500 | 406 | 503;
type TopRequest = {
  ResponseCode: ResponseCode;
  Description: string;
  TopPaths: TopPath[];
};
type ResponseCodeStats = {
  Code: ResponseCode;
  RequestCount: number;
  DataThroughputInMB: number;
  DataThroughputInGB: number;
  DataThroughputInTB: number;
};
type Requests = SharedMetricsData & {
  Total200Requests: number;
  TotalRequests: number;
  TotalThroughputMB: number;
  TotalThroughputGB: number;
  TotalThroughputTB: number;
  TopRequestByFilePathAndResponseCode: TopRequest[];
  ResponseCodes: ResponseCodeStats[];
};

//Define service using a base URL and expected endpoints
export const metricsApi = createApi({
  reducerPath: "metricsApi",
  baseQuery: fetchBaseQuery({
    // @ts-ignore
    baseUrl: `${__CONFIG__.API_METRICS}/accounts/${instanceZUID}`,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getUsage: builder.query<Usage, [string, string]>({
      query: ([dateStart, dateEnd]) =>
        `usage?dateStart=${dateStart.split("T")[0]}&dateEnd=${
          dateEnd.split("T")[0]
        }`,
    }),
    getRequests: builder.query<Requests, [string, string]>({
      query: ([dateStart, dateEnd]) =>
        `requests?dateStart=${dateStart.split("T")[0]}&dateEnd=${
          dateEnd.split("T")[0]
        }`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUsageQuery, useGetRequestsQuery } = metricsApi;
