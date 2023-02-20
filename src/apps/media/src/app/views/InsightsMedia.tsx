import { FC, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import { useSelector } from "react-redux";
import { alpha } from "@mui/material/styles";
import { useGetUsageQuery } from "../../../../../shell/services/metrics";

import { MetricCard } from "../../../../../shell/components/MetricsCard";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import moment from "moment";
import { InsightsTable } from "../components/InsightsTable";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { AppState } from "../../../../../shell/store/types";
import { uniqBy } from "lodash";

const iconStyles = {
  height: "32px",
  borderRadius: "16px",
  padding: 1,
};

const date = new Date();

const dateRanges = [7, 14, 30, 90];

export const InsightsMedia: FC = () => {
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const instanceCreatedAtDate = useSelector(
    (state: any) => state.instance.createdAt
  );
  const [dateRange, setDateRange] = useState(30);
  const hasPriorData =
    moment(date).diff(instanceCreatedAtDate, "days") >= dateRange * 2;
  const startDate = moment(date).subtract(dateRange, "days");
  const endDate = moment(date);
  const priorStartDate = moment(date).subtract(dateRange * 2, "days");
  const priorEndDate = moment(date).subtract(dateRange, "days");

  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const { data: files, isFetching: isFilesFetching } = useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

  const { data: priorUsage, isFetching: isPriorUsageFetching } =
    useGetUsageQuery([priorStartDate.format(), priorEndDate.format()]);
  const { data: usage, isFetching: isUsageFetching } = useGetUsageQuery([
    startDate.format(),
    endDate.format(),
  ]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const getDelta = (prior: number, current: number) =>
    (current - prior) / ((current + prior) / 2);

  const usageFetching = isPriorUsageFetching || isUsageFetching;

  const totalMediaThroughput = usage?.MediaConsumption.TotalGBs;
  const totalMediaRequests = usage?.MediaConsumption.TotalRequests;

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ pt: 2, px: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Insights
        </Typography>
        <Button
          endIcon={<ArrowDropDownIcon />}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          variant="outlined"
          size="small"
          color="inherit"
          sx={{
            mt: 2,
          }}
        >
          Last {dateRange} Days
        </Button>
        <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
          {dateRanges.map((dateRangeItem) => (
            <MenuItem
              onClick={() => {
                setDateRange(dateRangeItem);
                handleClose();
              }}
              sx={{
                ...(dateRangeItem === dateRange && {
                  backgroundColor: (theme) =>
                    alpha(
                      theme.palette.primary.main,
                      theme.palette.action.hoverOpacity
                    ),
                }),
              }}
            >
              <ListItemIcon
                sx={{ visibility: dateRangeItem !== dateRange && "hidden" }}
              >
                <CheckIcon color="primary" />
              </ListItemIcon>
              Last {dateRangeItem} days
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Box sx={{ display: "flex", gap: 2, py: 2, px: 3 }}>
        <MetricCard
          title="Media Requests"
          value={totalMediaRequests || 0}
          icon={
            <Box
              sx={{
                ...iconStyles,
                backgroundColor: "blue.50",
              }}
            >
              <SendRoundedIcon
                color="info"
                sx={{
                  width: "16px",
                  height: "16px",
                }}
              />
            </Box>
          }
          delta={
            hasPriorData
              ? getDelta(
                  priorUsage?.MediaConsumption?.TotalRequests,
                  usage?.MediaConsumption?.TotalRequests
                )
              : null
          }
          deltaLabel={`from last ${dateRange} days`}
          loading={usageFetching}
        />
        <MetricCard
          title="Media Bandwidth"
          value={totalMediaThroughput || 0}
          symbol="GB"
          icon={
            <Box
              sx={{
                ...iconStyles,
                backgroundColor: "deepOrange.50",
              }}
            >
              <CloudRoundedIcon
                color="primary"
                sx={{ width: "16px", height: "16px", color: "primary" }}
              />
            </Box>
          }
          delta={
            hasPriorData
              ? getDelta(
                  priorUsage?.MediaConsumption?.TotalGBs,
                  usage?.MediaConsumption?.TotalGBs
                )
              : null
          }
          deltaLabel={`from last ${dateRange} days`}
          loading={usageFetching}
        />
      </Box>
      <InsightsTable
        files={uniqBy(
          usage?.TopMedia?.map((file: any, key: number) => ({
            id: key,
            ...file,
            ...(files?.find((f) => f.url === file.FullPath?.split("?")?.[0]) ||
              {}),
          })),
          "id"
        ).filter((file: any) =>
          files?.find((f) => f.url === file.FullPath?.split("?")?.[0])
        )}
        loading={isFilesFetching || usageFetching || isBinsFetching}
      />
    </Box>
  );
};
