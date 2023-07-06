import { Box, Button, SvgIcon } from "@mui/material";
import React, { ComponentType, useMemo, useState } from "react";
import {
  LocalFireDepartmentRounded,
  CloudUploadRounded,
  EditRounded,
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
} from "../../../utils";
import { NameCell } from "./NameCell";
import { StatsCell } from "./StatsCell";
import { ViewsCell } from "./ViewsCell";
import { uniqBy } from "lodash";
import {
  useGetAllPublishingsQuery,
  useGetContentItemsQuery,
} from "../../../../../../../../../shell/services/instance";

const tableTabs = [
  {
    name: "Most Popular",
    icon: LocalFireDepartmentRounded,
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
  dateRange0Label: string;
  dateRange1Label: string;
};

export const ItemsTable2 = ({ propertyId, startDate, endDate }: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: propertiesData } = useGetAnalyticsPropertiesQuery();
  const propertyData = propertiesData?.properties?.find(
    (property: any) => property.name === propertyId
  );

  // Replace with new api that returns paths
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
          dateRanges: [
            {
              startDate: startDate?.format("YYYY-MM-DD"),
              endDate: endDate?.format("YYYY-MM-DD"),
            },
            {
              startDate: startDate
                ?.clone()
                ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                ?.format("YYYY-MM-DD"),
              endDate: startDate?.format("YYYY-MM-DD"),
            },
          ],
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
  // const { data: paths2 } = useGetAnalyticsPagePathsByFilterQuery({
  //   filter: 'popular',
  //   propertyId: propertyId?.split('/')?.pop(),
  //   startDate: startDate?.format("YYYY-MM-DD"),
  //   endDate: endDate?.format("YYYY-MM-DD"),
  //   limit: 10,
  //   order: 'desc',
  // }, {
  //   skip: !propertyId,
  // })

  const paths = findTopDimensionsForDateRange(
    pathsData?.reports?.[0]?.rows,
    "date_range_0",
    10
  )?.map((row, index) => row[0].value);

  // console.log('testing paths', paths, paths2);

  const { data, isFetching, isUninitialized } =
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
                name: "totalUsers",
              },
              {
                name: "averageSessionDuration",
              },
              {
                name: "screenPageViews",
              },
            ],
            dateRanges: [
              {
                startDate: startDate?.format("YYYY-MM-DD"),
                endDate: endDate?.format("YYYY-MM-DD"),
              },
              {
                startDate: startDate
                  ?.clone()
                  ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                  ?.format("YYYY-MM-DD"),
                endDate: startDate?.format("YYYY-MM-DD"),
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
                name: "sessions",
              },
            ],
            dateRanges: [
              {
                startDate: startDate?.format("YYYY-MM-DD"),
                endDate: endDate?.format("YYYY-MM-DD"),
              },
              {
                startDate: startDate
                  ?.clone()
                  ?.subtract(endDate.diff(startDate, "days") || 1, "days")
                  ?.format("YYYY-MM-DD"),
                endDate: startDate?.format("YYYY-MM-DD"),
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
        skip: !paths,
      }
    );

  const [mainReport, sessionReport, sourceReport] = data?.reports || [];

  const rows = findTopDimensionsForDateRange(
    mainReport?.rows,
    "date_range_0",
    10
  )?.map((row, index) => ({
    id: index,
    path: row[0].value,
    users: +findValuesForDimensions(
      mainReport?.rows,
      ["date_range_0", row[0].value],
      0
    )?.[0],
    avgSessionDuration: +findValuesForDimensions(
      mainReport?.rows,
      ["date_range_0", row[0].value],
      1
    )?.[0],
    screenPageViews: +findValuesForDimensions(
      mainReport?.rows,
      ["date_range_0", row[0].value],
      2
    )?.[0],
    sessionsByDay: findValuesForDimensions(
      sessionReport?.rows,
      ["date_range_0", row[0].value],
      0
    )?.slice(endDate.diff(startDate, "days")),
    totalSessions: findValuesForDimensions(
      sessionReport?.rows,
      ["date_range_0", row[0].value],
      0
    )
      ?.slice(endDate.diff(startDate, "days"))
      ?.reduce((acc, curr) => acc + +curr, 0),
    totalPriorSessions: findValuesForDimensions(
      sessionReport?.rows,
      ["date_range_1", row[0].value],
      0
    )
      ?.slice(0, endDate.diff(startDate, "days") + 1)
      ?.reduce((acc, curr) => acc + +curr, 0),
    views: +findValuesForDimensions(
      mainReport?.rows,
      ["date_range_0", row[0].value],
      2
    )?.[0],
    topSource: findTopDimensions(
      sourceReport?.rows,
      [row[0].value],
      1
    )?.[0]?.[1]?.value,
    topSourceValue: +findValuesForDimensions(
      sourceReport?.rows,
      [
        row[0].value,
        findTopDimensions(sourceReport?.rows, [row[0].value], 1)?.[0]?.[1]
          ?.value,
      ],
      0
    )?.[0],
    externalLink: `${propertyData?.dataStreams?.[0]?.webStreamData?.defaultUri}${row[0].value}`,
  }));

  const orderedRows = rows
    ? paths?.map((path) => rows?.find((row) => row.path === path))
    : [];

  return (
    <>
      <Box height="578px">
        <DataGridPro
          rows={
            isFetching || isUninitialized
              ? new Array(10).fill(null).map((x, i) => ({ id: i }))
              : orderedRows
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

export const LatestPublishesWrapper = ({ children, ...props }: any) => {
  const { data: publishings } = useGetAllPublishingsQuery();
  const latestUniqueItemPublishings = uniqBy(publishings, "itemZUID")
    ?.slice(0, 10)
    ?.map((publishing) => publishing.itemZUID);

  const { data: items } = useGetContentItemsQuery(latestUniqueItemPublishings, {
    skip: !latestUniqueItemPublishings,
  });

  console.log("testing items", items);

  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { items, ...props })
      )}
    </div>
  );
};

export const MostPopularWrapper = ({ children, ...props }: any) => {
  const { data: publishings } = useGetAllPublishingsQuery();
  const latestUniqueItemPublishings = uniqBy(publishings, "itemZUID")
    ?.slice(0, 10)
    ?.map((publishing) => publishing.itemZUID);

  const { data: items } = useGetContentItemsQuery(latestUniqueItemPublishings, {
    skip: !latestUniqueItemPublishings,
  });

  console.log("testing items", items);

  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { items, ...props })
      )}
    </div>
  );
};

const Runner = (props: any) => {
  console.log("run", props);
  return <div>run</div>;
};

const Test = withLatestPublishesPaths(Runner);
export const ItemsTable = ({ propertyId }: Props) => {
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
      {/* @ts-ignore */}
      {selectedTab === 1 && (
        <LatestPublishesWrapper>
          <Runner />
        </LatestPublishesWrapper>
      )}
    </>
  );
};
