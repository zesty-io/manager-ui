import { Box, Button, SvgIcon } from "@mui/material";
import { useState } from "react";
import {
  LocalFireDepartmentRounded,
  CloudUploadRounded,
  EditRounded,
} from "@mui/icons-material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { useGetAnalyticsPropertyDataByQueryQuery } from "../../../../../../../../shell/services/cloudFunctions";
import { useGetInstanceSettingsQuery } from "../../../../../../../../shell/services/instance";
import { Moment } from "moment-timezone";
import {
  findTopDimensionsForDateRange,
  findValuesForDimensions,
} from "../../utils";

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

  const { data, isFetching, isError, refetch } =
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
              {
                name: "averageSessionDuration",
              },
              {
                name: "sessions",
              },
              {
                name: "totalUsers",
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
          // page views per source
          {
            dimensions: [
              {
                name: "firstUserSource",
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
            dateRanges: [
              {
                startDate: startDate?.format("YYYY-MM-DD"),
                endDate: endDate?.format("YYYY-MM-DD"),
              },
            ],
          },
          // page session per date
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
            ],
          },
        ],
      },
      {
        skip: !propertyId,
      }
    );

  const [viewsByPathReport, ...rest] = data?.reports || [];
  console.log("viewsByPathReport", viewsByPathReport);
  console.log(
    "testing viewsByPathReport",
    findValuesForDimensions(viewsByPathReport?.rows, ["date_range_0"])
  );

  console.log(
    "testing",
    findTopDimensionsForDateRange(
      viewsByPathReport?.rows,
      "date_range_0",
      10
    )?.map((row) => row[0].value)
  );

  const rows = findTopDimensionsForDateRange(
    viewsByPathReport?.rows,
    "date_range_0",
    10
  )?.map((row, index) => ({
    id: index,
    path: row[0].value,
    views: findValuesForDimensions(
      viewsByPathReport?.rows,
      ["date_range_0", row[0].value],
      0
    )?.[0],
    avgSessionDuration: findValuesForDimensions(
      viewsByPathReport?.rows,
      ["date_range_0", row[0].value],
      1
    )?.[0],
    sessions: findValuesForDimensions(
      viewsByPathReport?.rows,
      ["date_range_0", row[0].value],
      2
    )?.[0],
    users: findValuesForDimensions(
      viewsByPathReport?.rows,
      ["date_range_0", row[0].value],
      3
    )?.[0],
  }));

  console.log("testing rows", rows);

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
        <DataGridPro rows={rows || []} columns={columns} hideFooter />
      </Box>
    </>
  );
};
