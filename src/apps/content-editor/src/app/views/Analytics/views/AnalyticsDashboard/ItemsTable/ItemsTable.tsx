import { Box, Button, SvgIcon } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LocalFireDepartmentRounded,
  CloudUploadRounded,
  EditRounded,
  TrendingUpRounded,
  TrendingDownRounded,
} from "@mui/icons-material";
import { DataGridPro, GridRenderCellParams } from "@mui/x-data-grid-pro";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import {
  useGetAnalyticsPropertiesQuery,
  useGetAnalyticsPropertyDataByQueryQuery,
} from "../../../../../../../../../shell/services/analytics";
import { differenceInCalendarDays, format as fmt } from "date-fns";

import {
  findTopDimensions,
  findValuesForDimensions,
  generateDateRangesForReport,
  padArray,
} from "../../../utils";
import { NameCell } from "./NameCell";
import { StatsCell } from "./StatsCell";
import { ViewsCell } from "./ViewsCell";
import { MostPopularWrapper } from "./MostPopularWrapper";
import { GainersLosersWrapper } from "./GainersLosersWrapper";
import { LatestPublishesWrapper } from "./LatestPublishesWrapper";
import { RecentEditsWrapper } from "./RecentEditsWrapper";

// nameKey holds the i18n key; the label is resolved with t() in the component.
const tableTabs = [
  {
    nameKey: "content.analyticsTabMostPopular",
    icon: LocalFireDepartmentRounded,
  },
  { nameKey: "content.analyticsTabGainers", icon: TrendingUpRounded },
  { nameKey: "content.analyticsTabLosers", icon: TrendingDownRounded },
  { nameKey: "content.analyticsTabLatestPublishes", icon: CloudUploadRounded },
  { nameKey: "content.analyticsTabRecentEdits", icon: EditRounded },
];

type Props = {
  propertyId: string;
  startDate: Date;
  endDate: Date;
};

export const ItemsTable = ({ propertyId, startDate, endDate }: Props) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <Box display="flex" gap={1} mb={2}>
        {tableTabs.map((tab, index) => (
          <Button
            key={index}
            variant="outlined"
            color={selectedTab === index ? "primary" : "inherit"}
            sx={{ backgroundColor: "background.paper", height: "28px" }}
            startIcon={
              <SvgIcon
                component={tab.icon}
                color={selectedTab !== index ? "action" : undefined}
                sx={{ height: 18, width: 18 }}
              />
            }
            onClick={() => setSelectedTab(index)}
          >
            {t(tab.nameKey)}
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
          isLosers
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

type ItemsTableContentProps = {
  paths: string[];
  showSkeleton?: boolean;
  isRecentEdits?: boolean;
} & Props;

export const ItemsTableContent = ({
  propertyId,
  startDate,
  endDate,
  paths,
  showSkeleton,
  isRecentEdits,
}: ItemsTableContentProps) => {
  const { t } = useTranslation();
  const columns = useMemo(
    () => [
      {
        field: "path",
        headerName: t("common.name"),
        flex: 1,
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams) => <NameCell {...row} />,
      },
      {
        field: "stats",
        headerName: t("content.analyticsColStats"),
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams) => <StatsCell {...row} />,
      },
      {
        field: "views",
        headerName: t("content.analyticsMetricViews"),
        sortable: false,
        renderCell: ({ row }: GridRenderCellParams) => <ViewsCell {...row} />,
        width: 168,
        headerAlign: "right",
      },
    ],
    [t]
  );
  const { data: propertiesData } = useGetAnalyticsPropertiesQuery();
  const propertyData = propertiesData?.properties?.find(
    (property: any) => property.name === propertyId
  );

  const { data, isFetching } = useGetAnalyticsPropertyDataByQueryQuery(
    {
      property: propertyId,
      requests: [
        {
          dimensions: [{ name: "pagePath" }],
          metrics: [
            { name: "totalUsers" },
            { name: "averageSessionDuration" },
            { name: "screenPageViews" },
          ],
          dateRanges: generateDateRangesForReport(startDate, endDate),
          dimensionFilter: {
            orGroup: {
              expressions: paths?.map((path) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: { matchType: "EXACT", value: path },
                },
              })),
            },
          },
          keepEmptyRows: true,
        },
        {
          dimensions: [{ name: "date" }, { name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }],
          dateRanges: generateDateRangesForReport(startDate, endDate),
          dimensionFilter: {
            orGroup: {
              expressions: paths?.map((path) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: { matchType: "EXACT", value: path },
                },
              })),
            },
          },
          orderBys: [{ dimension: { dimensionName: "date" } }],
        },
        {
          dimensions: [{ name: "pagePath" }, { name: "firstUserSource" }],
          metrics: [{ name: "screenPageViews" }],
          // this request expects string dates
          dateRanges: [
            {
              startDate: fmt(startDate, "yyyy-MM-dd"),
              endDate: fmt(endDate, "yyyy-MM-dd"),
            },
          ],
          dimensionFilter: {
            orGroup: {
              expressions: paths?.map((path) => ({
                filter: {
                  fieldName: "pagePath",
                  stringFilter: { matchType: "EXACT", value: path },
                },
              })),
            },
          },
        },
      ],
    },
    { skip: !paths?.length }
  );

  const [mainReport, screenPageViewsReport, sourceReport] = data?.reports || [];

  const spanDays = differenceInCalendarDays(endDate, startDate) + 1;

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
        spanDays * 2
      )?.slice(spanDays),
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
    <AutoSizer>
      {({ width }: Size) => (
        <DataGridPro
          rows={
            isFetching || showSkeleton
              ? new Array(10).fill(null).map((_, i) => ({ id: i }))
              : rows
          }
          // @ts-expect-error - headerAlign/align typing gap in DataGridPro
          columns={isRecentEdits ? columns.slice(0, 1) : columns}
          hideFooter
          disableColumnMenu
          disableSelectionOnClick
          rowHeight={66}
          style={{ width, height: 781 }}
          sx={{
            ".MuiDataGrid-virtualScrollerContent": {
              backgroundColor: "background.paper",
            },
            ".MuiDataGrid-columnHeader": {
              backgroundColor: "grey.100",
            },
            ".MuiDataGrid-row": {
              cursor: "pointer",

              "& .MuiDataGrid-cell": {
                alignContent: "center",
              },
            },
            // hide empty skeleton rows
            ".MuiDataGrid-row:has(.MuiDataGrid-cell:first-child:empty)": {
              display: "none",
            },
          }}
        />
      )}
    </AutoSizer>
  );
};
