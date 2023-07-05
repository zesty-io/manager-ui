import { Box, Button, SvgIcon, Skeleton, Typography } from "@mui/material";
import { useState } from "react";
import {
  LocalFireDepartmentRounded,
  CloudUploadRounded,
  EditRounded,
  InboxRounded,
  LanguageRounded,
  SearchRounded,
  Instagram,
  Facebook,
  Twitter,
  YouTube,
  OpenInNewRounded,
} from "@mui/icons-material";
import { DataGridPro, GridRenderCellParams } from "@mui/x-data-grid-pro";
import {
  useGetAnalyticsPropertiesQuery,
  useGetAnalyticsPropertyDataByQueryQuery,
} from "../../../../../../../../shell/services/cloudFunctions";
import {
  useGetContentModelQuery,
  useSearchContentQuery,
} from "../../../../../../../../shell/services/instance";
import moment, { Moment } from "moment-timezone";
import {
  calculatePercentageDifference,
  findTopDimensions,
  findTopDimensionsForDateRange,
  findValuesForDimensions,
} from "../../utils";
import { useGetUsersQuery } from "../../../../../../../../shell/services/accounts";
import { numberFormatter } from "../../../../../../../../utility/numberFormatter";
import { theme } from "@zesty-io/material";
import { Line } from "react-chartjs-2";
import { startCase } from "lodash";
import { useHistory } from "react-router";

const SOURCE_DETAIL_MAP = {
  "(direct)": {
    color: "info.dark",
    bgcolor: "blue.100",
    icon: InboxRounded,
  },
  google: {
    color: "error.dark",
    bgcolor: "red.100",
    icon: SearchRounded,
  },
  bing: {
    color: "error.dark",
    bgcolor: "red.100",
    icon: SearchRounded,
  },
  instagram: {
    color: "#6727BB",
    bgcolor: "#EBE9FE",
    icon: Instagram,
  },
  facebook: {
    color: "#1574EA",
    bgcolor: "#E0F2FE",
    icon: Facebook,
  },
  twitter: {
    color: "#1DA0F0",
    bgcolor: "#E0F2FE",
    icon: Twitter,
  },
  youtube: {
    color: "#FE0000",
    bgcolor: "#FEE4E2",
    icon: YouTube,
  },
} as const;

const NameCell = ({
  path,
  screenPageViews,
  topSource,
  topSourceValue,
  externalLink,
}: {
  path?: string;
  screenPageViews?: number;
  topSource: keyof typeof SOURCE_DETAIL_MAP;
  topSourceValue: number;
  externalLink?: string;
}) => {
  const history = useHistory();
  const { data: item, isFetching } = useSearchContentQuery({
    query: path,
    limit: 1,
  });
  const foundItem = item?.[0]?.web?.path === path ? item?.[0] : null;
  const { data: users } = useGetUsersQuery();
  const foundUser = users?.find(
    (user) => user.ZUID === foundItem?.web?.createdByUserZUID
  );
  const { data: model } = useGetContentModelQuery(
    foundItem?.meta?.contentModelZUID,
    {
      skip: !foundItem?.meta?.contentModelZUID,
    }
  );

  if (isFetching || !path) {
    return <Skeleton width="100%" />;
  } else if (foundItem) {
    return (
      <Box
        display="flex"
        height="40px"
        width="100%"
        alignItems="center"
        gap={1}
        onClick={() =>
          history.push(
            `/content/${foundItem.meta.contentModelZUID}/${foundItem.meta.ZUID}`
          )
        }
      >
        <Box height="40px" width="40px" bgcolor="info.main" borderRadius="4px">
          {Object.values(foundItem.data)?.some(
            (value) => typeof value === "string" && value.startsWith("3-")
          ) && (
            <img
              // @ts-ignore
              src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${Object.values(
                foundItem.data
              )?.find(
                (value) => typeof value === "string" && value.startsWith("3-")
              )}/getimage/?w=${40}&h=${40}&type=fit`}
              alt=""
            />
          )}
        </Box>
        <Box>
          <Box display="flex" gap={0.5} alignItems="center">
            <Typography
              variant="body2"
              fontWeight={600}
              mb={0.25}
              noWrap
              maxWidth="420px"
            >
              {foundItem.web.metaTitle || foundItem.web.metaLinkText}
            </Typography>
            <OpenInNewRounded
              onClick={(e) => {
                e.stopPropagation();
                window.open(externalLink);
              }}
              color="action"
              sx={{
                width: "16px",
                height: "16px",
              }}
            />
          </Box>
          <Box display="flex" gap={1.5}>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {moment(foundItem.meta.createdAt).format("MMM D")}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {foundUser
                ? `${foundUser.firstName} ${foundUser.lastName}`
                : "Unknown User"}
            </Typography>
            <Typography variant="body3" fontWeight={600} color="text.secondary">
              {model?.label}
            </Typography>
            <Box display="flex" alignItems="center">
              <Box
                display="flex"
                alignItems="center"
                gap={0.25}
                px={0.5}
                py={0.25}
                bgcolor={SOURCE_DETAIL_MAP[topSource]?.bgcolor || "yellow.50"}
                sx={{
                  borderRadius: "4px 0 0 4px",
                }}
              >
                <SvgIcon
                  component={
                    SOURCE_DETAIL_MAP[topSource]?.icon || LanguageRounded
                  }
                  sx={{
                    width: "8px",
                    height: "8px",
                    color:
                      SOURCE_DETAIL_MAP[topSource]?.color || "warning.main",
                  }}
                />
                <Typography
                  fontSize="10px"
                  fontWeight={600}
                  lineHeight="12px"
                  color={SOURCE_DETAIL_MAP[topSource]?.color || "warning.main"}
                >
                  {startCase(topSource)}
                </Typography>
              </Box>
              <Box
                px={0.5}
                py={0.25}
                bgcolor={SOURCE_DETAIL_MAP[topSource]?.color || "warning.main"}
                sx={{
                  borderRadius: "0 4px 4px 0",
                }}
              >
                <Typography
                  fontSize="8px"
                  fontWeight={600}
                  lineHeight="12px"
                  color="common.white"
                >
                  {isNaN(Math.floor((topSourceValue / screenPageViews) * 100))
                    ? 0
                    : Math.floor((topSourceValue / screenPageViews) * 100)}
                  %
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  } else {
    return null;
  }
};

const StatsCell = ({
  path,
  users,
  avgSessionDuration,
}: {
  path?: string;
  users: number;
  avgSessionDuration: number;
}) => {
  const history = useHistory();
  const { data: item } = useSearchContentQuery({
    query: path,
    limit: 1,
  });
  const foundItem = item?.[0]?.web?.path === path ? item?.[0] : null;
  if (!path) return <Skeleton width="100%" />;
  return (
    <Box
      onClick={() =>
        history.push(
          `/content/${foundItem.meta.contentModelZUID}/${foundItem.meta.ZUID}`
        )
      }
    >
      <Typography variant="body1" fontSize="12px">
        {numberFormatter.format(users + 400)} users
      </Typography>
      <Typography variant="body1" fontSize="12px">
        {Math.floor(
          moment.duration(avgSessionDuration, "seconds").asMinutes()
        ) +
          ":" +
          moment
            .duration(avgSessionDuration, "seconds")
            .seconds()
            .toString()
            .padStart(2, "0")}{" "}
        avg. time
      </Typography>
    </Box>
  );
};

const ViewsCell = ({
  path,
  totalSessions,
  totalPriorSessions,
  sessionsByDay,
}: {
  path?: string;
  totalSessions: number;
  totalPriorSessions: number;
  sessionsByDay: string[];
}) => {
  const history = useHistory();
  const { data: item } = useSearchContentQuery({
    query: path,
    limit: 1,
  });
  const foundItem = item?.[0]?.web?.path === path ? item?.[0] : null;
  if (!path) return <Skeleton width="100%" />;

  const paddedSessionsByDay = !sessionsByDay.length
    ? [0, 0]
    : sessionsByDay?.map((session) => +session)?.length === 1
    ? [0, +sessionsByDay[0]]
    : sessionsByDay?.map((session) => +session);
  return (
    <Box
      display="flex"
      gap={1.5}
      alignItems="center"
      onClick={() =>
        history.push(
          `/content/${foundItem.meta.contentModelZUID}/${foundItem.meta.ZUID}`
        )
      }
    >
      <Box>
        <Typography variant="body1" textAlign="right">
          {numberFormatter.format(totalSessions)}
        </Typography>
        <Box height="28px" width="73px">
          <Line
            data={{
              labels: paddedSessionsByDay?.map((_, i) => i),
              datasets: [
                {
                  backgroundColor: theme.palette.info.main,
                  borderColor: theme.palette.info.main,
                  pointRadius: 0,
                  data: paddedSessionsByDay,
                  borderWidth: 1,
                  tension: 0.1,
                },
              ],
            }}
            options={{
              layout: {
                padding: {
                  top: 8,
                  bottom: 8,
                  left: 0,
                  right: 0,
                },
              },
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: false,
                },
              },
              scales: {
                x: {
                  display: false,
                },
                y: {
                  display: false,
                  min:
                    Math.min(
                      ...paddedSessionsByDay?.map((session) => +session)
                    ) || -1,
                  max:
                    Math.max(
                      ...paddedSessionsByDay?.map((session) => +session)
                    ) || 1,
                },
              },
            }}
          />
        </Box>
      </Box>
      <Typography
        variant="body3"
        color={
          calculatePercentageDifference(
            totalPriorSessions,
            totalSessions
          ).startsWith("-")
            ? "error.main"
            : "success.main"
        }
        fontWeight={600}
      >
        {calculatePercentageDifference(totalPriorSessions, totalSessions)}
      </Typography>
    </Box>
  );
};

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

export const ItemsTable = ({ propertyId, startDate, endDate }: Props) => {
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

  const paths = findTopDimensionsForDateRange(
    pathsData?.reports?.[0]?.rows,
    "date_range_0",
    10
  )?.map((row, index) => row[0].value);

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
      <Box height="578px">
        <DataGridPro
          rows={
            isFetching
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
