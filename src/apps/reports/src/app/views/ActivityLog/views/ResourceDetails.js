import { useState, useEffect, useMemo } from "react";
import { Box, Button, Stack, SvgIcon, Typography } from "@mui/material";
import { useParams } from "shell/hooks/useParams";
import moment from "moment";
import { instanceApi } from "shell/services/instance";
import { ScheduleRounded, CategoryRounded } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { ResourceListItem } from "../components/ResourceListItem";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import { ActionsTimeline } from "../components/ActionsTimeline";
import { useHistory } from "react-router";
import { ActionsByUsers } from "../components/ActionsByUsers";
import instanceZUID from "utility/instanceZUID";
import { resolveResourceType } from "utility/resolveResourceType";
import { Filters } from "../components/Filters";
import { EmptyState } from "../components/EmptyState";
import { filterByParams } from "utility/filterByParams";
import { resolveUrlFromAudit } from "../../../../../../../utility/resolveResourceUrlFromAudit";
import { CustomBreadcrumbs } from "../../../../../../../shell/components/CustomBreadcrumbs";
import { ResourceHeaderTitle } from "../components/ResourceHeaderTitle";
import { useGetInstanceSettingsQuery } from "../../../../../../../shell/services/instance";

const Crumbs = [
  {
    name: "Activity Log",
    path: "/reports/activity-log/resources",
    icon: ScheduleRounded,
  },
  {
    name: "Resources",
    path: "/reports/activity-log/resources",
    icon: CategoryRounded,
  },
];

export const ResourceDetails = () => {
  const history = useHistory();
  const [params, setParams] = useParams();
  const [initialized, setInitialized] = useState(false);
  const { data: rawInstanceSettings } = useGetInstanceSettingsQuery();

  const zuid = useMemo(
    () => location.pathname.split("/").pop(),
    [location.pathname]
  );

  const contentData = useSelector((state) =>
    Object.values(state.content).find((item) => item.meta.ZUID === zuid)
  );
  const modelData = useSelector((state) =>
    Object.values(state.models).find((item) => item.ZUID === zuid)
  );
  const fileData = useSelector((state) =>
    Object.values(state.files).find((item) => item.ZUID === zuid)
  );

  const settingsData = useSelector((state) =>
    state.settings.instance?.find(
      (instanceSetting) => instanceSetting.ZUID === zuid
    )
  );

  useEffect(() => {
    if (!params.get("from") && !params.get("to")) {
      setDefaultDateParams();
    }
    /*
      Initialized get sets to true after setting date params to then be utilized to determine 
      if API call is ready to be executed
    */
    setInitialized(true);
  }, [location.pathname]);

  // Sets date parameters from when the resource was created
  const setDefaultDateParams = () => {
    let fromDate;
    if (contentData) {
      fromDate = moment(contentData?.meta?.createdAt);
    } else if (modelData) {
      fromDate = moment(modelData?.createdAt);
    } else if (fileData) {
      fromDate = moment(fileData?.createdAt);
    } else if (settingsData) {
      fromDate = moment(settingsData?.createdAt);
    } else {
      fromDate = moment().add(-3, "months");
    }
    setParams(fromDate.format("YYYY-MM-DD"), "from");
    setParams(moment().format("YYYY-MM-DD"), "to");
  };

  const {
    data: actions,
    isLoading,
    isFetching,
    isUninitialized,
  } = instanceApi.useGetAuditsQuery(
    {
      ...(params.get("from") && {
        start_date: moment(params.get("from")).format("L"),
      }),
      ...(params.get("to") && {
        end_date: moment(params.get("to")).format("L"),
      }),
    },
    { skip: !initialized }
  );

  const actionsByZuid = useMemo(
    () => actions?.filter((action) => action.affectedZUID === zuid) || [],
    [zuid, actions]
  );

  const filteredActions = useMemo(
    () => (actionsByZuid?.length ? filterByParams(actionsByZuid, params) : []),
    [actionsByZuid, params]
  );

  return (
    <>
      <Stack
        px={4}
        pt={4}
        pb={2}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Stack gap={0.25}>
          <CustomBreadcrumbs
            items={Crumbs.map((crumb) => ({
              node: (
                <Stack direction="row" gap={0.5}>
                  <SvgIcon
                    component={crumb.icon}
                    color="action"
                    fontSize="small"
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    maxWidth={100}
                  >
                    {crumb.name}
                  </Typography>
                </Stack>
              ),
              onClick: () => {
                history.push(crumb.path);
              },
            }))}
          />

          <ResourceHeaderTitle
            affectedZUID={actionsByZuid[0]?.affectedZUID ?? zuid}
            resourceType={
              actionsByZuid[0]?.resourceType ?? resolveResourceType(zuid)
            }
            updatedAt={actionsByZuid[0]?.updatedAt}
            isLoadingActions={isLoading}
            actionDescription={actionsByZuid[0]?.meta?.message ?? ""}
          />
        </Stack>
        <Stack flexDirection="row" gap={1}>
          <Button
            sx={{ height: "max-content" }}
            startIcon={<OpenInNewIcon />}
            variant="outlined"
            size="small"
            disabled={!actionsByZuid[0] || !actionsByZuid[0]?.meta}
            onClick={() => {
              const category = rawInstanceSettings.find(
                (setting) => setting.ZUID === actionsByZuid[0]?.affectedZUID
              )?.category;

              history.push(resolveUrlFromAudit(actionsByZuid[0], category));
            }}
          >
            Open
          </Button>
          <Button
            sx={{ height: "max-content" }}
            startIcon={<DownloadIcon />}
            variant="contained"
            size="small"
            onClick={() => {
              window.open(
                `https://reports.zesty.io/audit-report.html?instanceZUID=${instanceZUID}&affectedZUID=${zuid}&download=true`,
                "_blank"
              );
            }}
          >
            View Audit Trail Report
          </Button>
        </Stack>
      </Stack>
      <Box sx={{ px: 4, pt: 0.5, backgroundColor: "grey.50" }}>
        <Filters
          actions={actionsByZuid}
          filters={["action", "actionByUserZUID"]}
          showSkeletons={isLoading}
        />
      </Box>
      <Box sx={{ px: 4, height: "100%", backgroundColor: "grey.50" }}>
        {!isLoading && !filteredActions?.length ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <EmptyState
              title="No Logs Found"
              onReset={() => {
                setParams("", "action");
                setParams("", "actionByUserZUID");
                setDefaultDateParams();
              }}
            />
          </Box>
        ) : (
          <Box height="100%" display="flex" justifyContent="space-between">
            <ActionsTimeline
              actions={filteredActions}
              showSkeletons={isLoading}
            />
            <Box sx={{ minWidth: 298, pl: 8 }}>
              <ActionsByUsers
                actions={filteredActions}
                showSkeletons={isFetching}
              />
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};
