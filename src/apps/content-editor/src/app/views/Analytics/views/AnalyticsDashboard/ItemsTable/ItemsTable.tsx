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
import moment, { Moment } from "moment-timezone";
import {
  findTopDimensions,
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
  useGetAuditsQuery,
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
      {selectedTab === 4 && (
        <RecentEditsWrapper
          propertyId={propertyId}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  );
};

const MostPopularWrapper = ({ propertyId, startDate, endDate }: Props) => {
  const { data: pathsData } = useGetAnalyticsPropertyDataByQueryQuery(
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
          limit: "20",
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

  const topPaths = findTopDimensions(
    pathsData?.reports?.[0]?.rows,
    ["date_range_0"],
    20
  )?.map((row, index) => row[0].value);

  const {
    data: items,
    isFetching,
    isUninitialized,
  } = useGetContentItemsQuery(topPaths, {
    skip: !pathsData,
  });

  const sortedItems = topPaths
    ?.map((path) =>
      items?.success?.find((item: ContentItem) => item?.web?.path === path)
    )
    ?.filter((i) => i)
    ?.slice(0, 10);

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      items={sortedItems}
      showSkeleton={isFetching || isUninitialized}
    />
  );
};

const GainersLosersWrapper = ({
  propertyId,
  startDate,
  endDate,
  isLosers,
}: Props & { isLosers: boolean }) => {
  const { data: pagePaths } = useGetAnalyticsPagePathsByFilterQuery(
    {
      filter: isLosers ? "loser" : "gainer",
      propertyId: propertyId?.split("/")?.pop(),
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
      limit: 20,
      order: isLosers ? "asc" : "desc",
    },
    {
      skip: !propertyId,
    }
  );

  const {
    data: items,
    isFetching,
    isUninitialized,
  } = useGetContentItemsQuery(pagePaths, {
    skip: !pagePaths?.length,
  });

  const sortedItems = pagePaths
    ?.map((path: string) =>
      items?.success?.find((item: ContentItem) => path === item?.web?.path)
    )
    ?.filter((i: ContentItem) => i)
    ?.slice(0, 10);

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      items={sortedItems}
      showSkeleton={isFetching || isUninitialized}
    />
  );
};

const LatestPublishesWrapper = ({ propertyId, startDate, endDate }: Props) => {
  const { data: publishings } = useGetAllPublishingsQuery();
  const latestUniqueItemPublishings = uniqBy(publishings, "itemZUID")
    ?.sort(
      (a, b) =>
        new Date(b?.publishAt).getTime() - new Date(a?.publishAt).getTime()
    )
    ?.slice(0, 20)
    ?.map((publishing) => publishing.itemZUID);

  const {
    data: items,
    isFetching,
    isUninitialized,
  } = useGetContentItemsQuery(latestUniqueItemPublishings, {
    skip: !latestUniqueItemPublishings?.length,
  });

  const sortedItems =
    latestUniqueItemPublishings
      ?.map((itemZUID) =>
        items?.success?.find(
          (item: ContentItem) => itemZUID === item?.meta?.ZUID
        )
      )
      ?.filter((i) => i)
      ?.slice(0, 10) || [];

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      items={sortedItems}
      showSkeleton={isFetching || isUninitialized}
    />
  );
};

const RecentEditsWrapper = ({ propertyId, startDate, endDate }: Props) => {
  const { data: auditData } = useGetAuditsQuery({
    start_date: moment().utc().subtract(1, "month").format("YYYY-MM-DD"),
    end_date: moment().utc().format("YYYY-MM-DD"),
  });

  const itemEdits = auditData?.filter(
    (item: any) => item.action === 2 && item.resourceType === "content"
  );

  const itemZUIDs = uniqBy(itemEdits, "affectedZUID")
    ?.slice(0, 20)
    ?.map((item: any) => item.affectedZUID);

  const {
    data: items,
    isFetching,
    isUninitialized,
  } = useGetContentItemsQuery(itemZUIDs, {
    skip: !itemZUIDs?.length,
  });

  const filteredItems = items?.success
    ?.filter((item: ContentItem) => item)
    ?.slice(0, 10);

  return (
    <ItemsTableContent
      propertyId={propertyId}
      startDate={startDate}
      endDate={endDate}
      items={filteredItems}
      showSkeleton={isFetching || isUninitialized}
    />
  );
};

type ItemsTableContentProps = {
  items?: ContentItem[];
  showSkeleton?: boolean;
} & Props;

export const ItemsTableContent = ({
  propertyId,
  startDate,
  endDate,
  items,
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
              expressions: items?.map((item) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: {
                    matchType: "EXACT",
                    value: item?.web?.path,
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
              expressions: items?.map((item) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: {
                    matchType: "EXACT",
                    value: item?.web?.path,
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
              expressions: items?.map((item) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: {
                    matchType: "EXACT",
                    value: item?.web?.path,
                  },
                },
              })),
            },
          },
        },
      ],
    },
    {
      skip: !items?.length,
    }
  );

  const [mainReport, screenPageViewsReport, sourceReport] = data?.reports || [];

  const rows =
    items?.map((item, index) => ({
      id: index,
      users: +(
        findValuesForDimensions(
          mainReport?.rows,
          ["date_range_0", item?.web?.path],
          0
        )?.[0] || 0
      ),
      avgSessionDuration: +(
        findValuesForDimensions(
          mainReport?.rows,
          ["date_range_0", item?.web?.path],
          1
        )?.[0] || 0
      ),
      screenPageViews: +(
        findValuesForDimensions(
          mainReport?.rows,
          ["date_range_0", item?.web?.path],
          2
        )?.[0] || 0
      ),
      priorScreenPageViews: +(
        findValuesForDimensions(
          mainReport?.rows,
          ["date_range_1", item?.web?.path],
          2
        )?.[0] || 0
      ),
      screenPageViewsByDay: padArray(
        findValuesForDimensions(
          screenPageViewsReport?.rows,
          ["date_range_0", item?.web?.path],
          0
        ),
        (endDate.diff(startDate, "days") + 1) * 2
      )?.slice(endDate.diff(startDate, "days") + 1),
      topSource: findTopDimensions(
        sourceReport?.rows,
        [item?.web?.path],
        1
      )?.[0]?.[1]?.value,
      topSourceValue: +(
        findValuesForDimensions(
          sourceReport?.rows,
          [
            item?.web?.path,
            findTopDimensions(
              sourceReport?.rows,
              [item?.web?.path],
              1
            )?.[0]?.[1]?.value,
          ],
          0
        )?.[0] || 0
      ),
      externalLink: `${propertyData?.dataStreams?.[0]?.webStreamData?.defaultUri}${item?.web?.path}`,
      item,
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
