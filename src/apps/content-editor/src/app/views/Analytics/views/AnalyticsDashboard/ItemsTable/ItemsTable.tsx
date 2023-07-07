import { Box, Button, SvgIcon } from "@mui/material";
import { useState } from "react";
import {
  LocalFireDepartmentRounded,
  CloudUploadRounded,
  EditRounded,
  TrendingUpRounded,
  TrendingDownRounded,
} from "@mui/icons-material";
import { DataGridPro, GridRenderCellParams } from "@mui/x-data-grid-pro";
import {
  useGetAnalyticsPagePathsByFilterQuery,
  useGetAnalyticsPropertiesQuery,
  useGetAnalyticsPropertyDataByQueryQuery,
} from "../../../../../../../../../shell/services/cloudFunctions";
import { Moment } from "moment-timezone";
import {
  findTopDimensions,
  findTopDimensionsForDateRange,
  findValuesForDimensions,
  generateDateRangesForReport,
  padArray,
} from "../../../utils";
import { NameCell } from "./NameCell";
import { StatsCell } from "./StatsCell";
import { ViewsCell } from "./ViewsCell";
import { uniqBy } from "lodash";
import {
  useGetAllPublishingsQuery,
  useGetContentItemsQuery,
} from "../../../../../../../../../shell/services/instance";
import { ContentItem } from "../../../../../../../../../shell/services/types";

const tableTabs = [
  {
    name: "Most Popular",
    icon: LocalFireDepartmentRounded,
  },
  {
    name: "Gainers",
    icon: TrendingUpRounded,
  },
  {
    name: "Losers",
    icon: TrendingDownRounded,
  },
  {
    name: "Latest Publishes",
    icon: CloudUploadRounded,
  },
  {
    name: "Recent Edits",
    icon: EditRounded,
  },
];

const columns = [
  {
    field: "path",
    headerName: "Name",
    flex: 1,
    sortable: false,
    renderCell: ({ row }: GridRenderCellParams) => <NameCell {...row} />,
  },
  {
    field: "stats",
    headerName: "Stats",
    sortable: false,
    renderCell: ({ row }: GridRenderCellParams) => <StatsCell {...row} />,
  },
  {
    field: "views",
    headerName: "Views",
    sortable: false,
    renderCell: ({ row }: GridRenderCellParams) => <ViewsCell {...row} />,
    width: 168,
    headerAlign: "right",
  },
];

type Props = {
  propertyId: string;
  startDate: Moment;
  endDate: Moment;
};

export const ItemsTable = ({ propertyId, startDate, endDate }: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <Box display="flex" gap={1} mb={2}>
        {tableTabs.map((tab, index) => (
          <Button
            key={index}
            variant="outlined"
            color={selectedTab === index ? "primary" : "inherit"}
            sx={{
              backgroundColor: "background.paper",
              height: "28px",
            }}
            startIcon={
              <SvgIcon
                component={tab.icon}
                color={selectedTab !== index ? "action" : undefined}
              />
            }
            onClick={() => setSelectedTab(index)}
          >
            {tab.name}
          </Button>
        ))}
      </Box>
      {selectedTab === 0 && (
        <MostPopularWrapper
          propertyId={propertyId}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      {selectedTab === 1 && (
        <GainersLosersWrapper
          propertyId={propertyId}
          startDate={startDate}
          endDate={endDate}
          isLosers={false}
        />
      )}
      {selectedTab === 2 && (
        <GainersLosersWrapper
          propertyId={propertyId}
          startDate={startDate}
          endDate={endDate}
          isLosers={true}
        />
      )}
      {selectedTab === 3 && (
        <LatestPublishesWrapper
          propertyId={propertyId}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  );
};

const MostPopularWrapper = ({ propertyId, startDate, endDate }: Props) => {
  const { data: pathsData, isFetching } =
    useGetAnalyticsPropertyDataByQueryQuery(
      {
        property: propertyId,
        requests: [
          {
            dimensions: [
              {
                name: "pagePath",
              },
            ],
            metrics: [
              {
                name: "screenPageViews",
              },
            ],
            dateRanges: generateDateRangesForReport(startDate, endDate),
            limit: "10",
            orderBys: [
              {
                metric: {
                  metricName: "screenPageViews",
                },
                desc: true,
              },
            ],
          },
        ],
      },
      {
        skip: !propertyId,
      }
    );
  const paths =
    findTopDimensionsForDateRange(
      pathsData?.reports?.[0]?.rows,
      "date_range_0",
      10
    )?.map((row, index) => row[0].value) || [];

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      paths={paths}
      showSkeleton={isFetching}
    />
  );
};

const GainersLosersWrapper = ({
  propertyId,
  startDate,
  endDate,
  isLosers,
}: Props & { isLosers: boolean }) => {
  const { data: paths, isFetching } = useGetAnalyticsPagePathsByFilterQuery(
    {
      filter: isLosers ? "loser" : "gainer",
      propertyId: propertyId?.split("/")?.pop(),
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
      limit: 10,
      order: isLosers ? "asc" : "desc",
    },
    {
      skip: !propertyId,
    }
  );

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      paths={paths}
      showSkeleton={isFetching}
    />
  );
};

const LatestPublishesWrapper = ({ propertyId, startDate, endDate }: Props) => {
  const { data: publishings } = useGetAllPublishingsQuery();
  const latestUniqueItemPublishings = uniqBy(publishings, "itemZUID")
    ?.slice(0, 10)
    ?.map((publishing) => publishing.itemZUID);

  const {
    data: items,
    isFetching,
    isUninitialized,
  } = useGetContentItemsQuery(latestUniqueItemPublishings, {
    skip: !latestUniqueItemPublishings?.length,
  });

  const paths =
    items?.success
      ?.map((item: ContentItem) => item?.web?.path)
      ?.filter((path: string) => path) || [];

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      paths={paths}
      showSkeleton={isFetching || isUninitialized}
    />
  );
};

type ItemsTableContentProps = {
  paths: string[];
  showSkeleton?: boolean;
} & Props;

export const ItemsTableContent = ({
  propertyId,
  startDate,
  endDate,
  paths,
  showSkeleton,
}: ItemsTableContentProps) => {
  const { data: propertiesData } = useGetAnalyticsPropertiesQuery();
  const propertyData = propertiesData?.properties?.find(
    (property: any) => property.name === propertyId
  );

  const { data, isFetching } = useGetAnalyticsPropertyDataByQueryQuery(
    {
      property: propertyId,
      requests: [
        {
          dimensions: [
            {
              name: "pagePath",
            },
          ],
          metrics: [
            {
              name: "totalUsers",
            },
            {
              name: "averageSessionDuration",
            },
            {
              name: "screenPageViews",
            },
          ],
          dateRanges: generateDateRangesForReport(startDate, endDate),
          dimensionFilter: {
            orGroup: {
              expressions: paths?.map((path) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: {
                    matchType: "EXACT",
                    value: path,
                  },
                },
              })),
            },
          },
          keepEmptyRows: true,
        },
        {
          dimensions: [
            {
              name: "date",
            },
            {
              name: "pagePath",
            },
          ],
          metrics: [
            {
              name: "screenPageViews",
            },
          ],
          dateRanges: generateDateRangesForReport(startDate, endDate),
          dimensionFilter: {
            orGroup: {
              expressions: paths?.map((path) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: {
                    matchType: "EXACT",
                    value: path,
                  },
                },
              })),
            },
          },
          orderBys: [
            {
              dimension: {
                dimensionName: "date",
              },
            },
          ],
        },
        {
          dimensions: [
            {
              name: "pagePath",
            },
            {
              name: "firstUserSource",
            },
          ],
          metrics: [
            {
              name: "screenPageViews",
            },
          ],
          dateRanges: [
            {
              startDate: startDate?.format("YYYY-MM-DD"),
              endDate: endDate?.format("YYYY-MM-DD"),
            },
          ],
          dimensionFilter: {
            orGroup: {
              expressions: paths?.map((path) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: {
                    matchType: "EXACT",
                    value: path,
                  },
                },
              })),
            },
          },
        },
      ],
    },
    {
      skip: !paths?.length,
    }
  );

  const [mainReport, screenPageViewsReport, sourceReport] = data?.reports || [];

  const rows =
    paths?.map((path, index) => ({
      id: index,
      path,
      users: +(
        findValuesForDimensions(
          mainReport?.rows,
          ["date_range_0", path],
          0
        )?.[0] || 0
      ),
      avgSessionDuration: +(
        findValuesForDimensions(
          mainReport?.rows,
          ["date_range_0", path],
          1
        )?.[0] || 0
      ),
      screenPageViews: +(
        findValuesForDimensions(
          mainReport?.rows,
          ["date_range_0", path],
          2
        )?.[0] || 0
      ),
      priorScreenPageViews: +(
        findValuesForDimensions(
          mainReport?.rows,
          ["date_range_1", path],
          2
        )?.[0] || 0
      ),
      screenPageViewsByDay: padArray(
        findValuesForDimensions(
          screenPageViewsReport?.rows,
          ["date_range_0", path],
          0
        ),
        (endDate.diff(startDate, "days") + 1) * 2
      )?.slice(endDate.diff(startDate, "days") + 1),
      topSource: findTopDimensions(sourceReport?.rows, [path], 1)?.[0]?.[1]
        ?.value,
      topSourceValue: +(
        findValuesForDimensions(
          sourceReport?.rows,
          [
            path,
            findTopDimensions(sourceReport?.rows, [path], 1)?.[0]?.[1]?.value,
          ],
          0
        )?.[0] || 0
      ),
      externalLink: `${propertyData?.dataStreams?.[0]?.webStreamData?.defaultUri}${path}`,
    })) || [];

  return (
    <>
      <Box height="578px">
        <DataGridPro
          rows={
            isFetching || showSkeleton
              ? new Array(10).fill(null).map((x, i) => ({ id: i }))
              : rows
          }
          // @ts-expect-error - missing types for headerAlign and align on DataGridPro
          columns={columns}
          hideFooter
          disableColumnMenu
          sx={{
            ".MuiDataGrid-virtualScrollerContent": {
              backgroundColor: "background.paper",
            },
            ".MuiDataGrid-columnHeader": {
              backgroundColor: "grey.100",
            },
            ".MuiDataGrid-row": {
              cursor: "pointer",
            },
            // Hides all rows that are empty (no data)
            ".MuiDataGrid-row:has(> :first-child:empty)": {
              display: "none",
            },
          }}
        />
      </Box>
    </>
  );
};
