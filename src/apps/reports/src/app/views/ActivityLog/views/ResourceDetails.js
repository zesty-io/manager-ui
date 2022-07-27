import { useState, useEffect, useMemo } from "react";
import { Box, Button, Link, Breadcrumbs } from "@mui/material";
import { useParams } from "shell/hooks/useParams";
import moment from "moment";
import { instanceApi } from "shell/services/instance";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useSelector } from "react-redux";
import { ResourceListItem } from "../components/ResourceListItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { ActionsTimeline } from "../components/ActionsTimeline";
import { useHistory } from "react-router";
import { ActionsByUsers } from "../components/ActionsByUsers";
import instanceZUID from "utility/instanceZUID";
import { resolveResourceType } from "utility/resolveResourceType";
import { Filters } from "../components/Filters";

export const ResourceDetails = () => {
  const history = useHistory();
  const [params, setParams] = useParams();
  const [initialized, setInitialized] = useState(false);

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
    // If there are no date parameters set, sets date parameters from when the resource was created
    if (!params.get("from") && !params.get("to")) {
      let fromDate;
      if (contentData) {
        fromDate = moment(contentData?.createdAt);
      } else if (modelData) {
        fromDate = moment(modelData?.createdAt);
      } else if (fileData) {
        fromDate = moment(fileData?.createdAt);
      } else if (settingsData) {
        fromDate = moment(settingsData?.createdAt);
      } else {
        fromDate = moment().add(-6, "days");
      }
      setParams(fromDate.format("YYYY-MM-DD"), "from");
      setParams(moment().add(1, "days").format("YYYY-MM-DD"), "to");
    }
    /*
      Initialized get sets to true after setting date params to then be utilized to determine 
      if API call is ready to be executed
    */
    setInitialized(true);
  }, []);

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

  let filteredActions = actionsByZuid ? [...actionsByZuid] : [];

  for (const [key, value] of params.entries()) {
    if (key === "from" || key === "to") {
    } else {
      filteredActions = filteredActions.filter(
        (action) => String(action?.[key]) === value
      );
    }
  }

  return (
    <Box sx={{ pt: 1.75 }}>
      <Breadcrumbs
        separator={<ChevronRightIcon fontSize="small" />}
        sx={{ px: 3 }}
      >
        <Link
          underline="none"
          variant="caption"
          color="text.secondary"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            history.push({
              pathname: `/reports/activity-log/resources`,
            });
          }}
        >
          Activity Log
        </Link>
        <Link
          underline="none"
          variant="caption"
          color="text.secondary"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            history.push({
              pathname: `/reports/activity-log/resources`,
            });
          }}
        >
          Resources
        </Link>
      </Breadcrumbs>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 1,
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        }}
      >
        <Box sx={{ maxWidth: 640 }}>
          <ResourceListItem
            resource={
              actionsByZuid[0] || {
                affectedZUID: zuid,
                resourceType: resolveResourceType(zuid),
              }
            }
            size="large"
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, px: 2, py: 2.5 }}>
          <Button
            sx={{ height: "max-content" }}
            startIcon={<FontAwesomeIcon icon={faEye} />}
            variant="outlined"
            size="small"
            onClick={() => {
              if (actionsByZuid[0]?.resourceType === "code") {
                history.push(
                  "/code/file/" +
                    actionsByZuid[0]?.meta?.uri.split("/").slice(3).join("/")
                );
              } else {
                history.push(new URL(actionsByZuid[0]?.meta?.url)?.pathname);
              }
            }}
          >
            View
          </Button>
          <Button
            sx={{ height: "max-content" }}
            startIcon={<FontAwesomeIcon icon={faFileDownload} />}
            variant="contained"
            size="small"
            disableElevation
            onClick={() => {
              window.open(
                `https://reports.zesty.io/audit-report.html?instanceZUID=${instanceZUID}&affectedZUID=${zuid}&download=true`,
                "_blank"
              );
            }}
          >
            Export
          </Button>
        </Box>
      </Box>
      <Box sx={{ px: 3, mt: 3 }}>
        <Filters
          actions={actionsByZuid}
          filters={["action", "actionByUserZUID"]}
          showSkeletons={isLoading}
        />
        <Box sx={{ display: "flex", gap: 17 }}>
          <ActionsTimeline
            actions={filteredActions}
            showSkeletons={isLoading}
          />
          <Box sx={{ minWidth: 298, py: 5 }}>
            <ActionsByUsers
              actions={filteredActions}
              showSkeletons={isFetching}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
