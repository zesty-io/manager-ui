import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Menu, MenuItem, ListItemIcon } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useSelector } from "react-redux";
import { alpha } from "@mui/material/styles";
import { useGetUsageQuery } from "../../../../../shell/services/metrics";

import { MetricCard } from "../../../../../shell/components/MetricsCard";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import { subDays, differenceInCalendarDays, formatISO } from "date-fns";
import { InsightsTable } from "../components/InsightsTable";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { AppState } from "../../../../../shell/store/types";
import { uniqBy } from "lodash";
import { FilterButton } from "../../../../../shell/components/Filters";

const iconStyles = {
  height: "32px",
  borderRadius: "16px",
  padding: 1,
};

const now = new Date();

const dateRanges = [7, 14, 30, 90];

export const InsightsMedia: FC = () => {
  const { t } = useTranslation();
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const instanceCreatedAtDate = useSelector(
    (state: any) => state.instance.createdAt
  );
  const [dateRange, setDateRange] = useState(30);
  const hasPriorData =
    differenceInCalendarDays(now, new Date(instanceCreatedAtDate)) >=
    dateRange * 2;
  const startDate = subDays(now, dateRange);
  const endDate = now;
  const priorStartDate = subDays(now, dateRange * 2);
  const priorEndDate = subDays(now, dateRange);

  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const { data: files, isFetching: isFilesFetching } = useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

  const { data: priorUsage, isFetching: isPriorUsageFetching } =
    useGetUsageQuery([formatISO(priorStartDate), formatISO(priorEndDate)]);
  const { data: usage, isFetching: isUsageFetching } = useGetUsageQuery([
    formatISO(startDate),
    formatISO(endDate),
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
        backgroundColor: "grey.50",
      }}
    >
      <Box
        sx={{
          pt: 4,
          pb: 1.75,
          px: 4,
          backgroundColor: "background.paper",
          borderStyle: "solid",
          borderWidth: "0px",
          borderBottomWidth: "2px",
          borderColor: "border",
        }}
      >
        <Typography variant="h3" fontWeight={700}>
          {t("media.insightsMediaTitle")}
        </Typography>
      </Box>
      <Box sx={{ px: 4, py: 2 }}>
        <FilterButton
          isFilterActive={false}
          buttonText={t("media.insightsMediaDateRangeButton", {
            days: dateRange,
          })}
          onRemoveFilter={() => {}}
          onOpenMenu={(event) => setAnchorEl(event.currentTarget)}
        />
        <Menu open={open} onClose={handleClose} anchorEl={anchorEl}>
          {dateRanges.map((dateRangeItem) => (
            <MenuItem
              key={dateRangeItem}
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
              {t("media.insightsMediaDateRangeMenuItem", {
                days: dateRangeItem,
              })}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Box sx={{ display: "flex", gap: 2, pb: 2, px: 4 }}>
        <MetricCard
          title={t("common.mediaRequests")}
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
          deltaLabel={t("media.insightsMediaDeltaLabel", { days: dateRange })}
          loading={usageFetching}
        />
        <MetricCard
          title={t("media.insightsMediaMediaBandwidth")}
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
          deltaLabel={t("media.insightsMediaDeltaLabel", { days: dateRange })}
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
