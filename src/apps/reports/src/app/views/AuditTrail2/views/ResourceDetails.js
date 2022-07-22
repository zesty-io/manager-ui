import { useState, useEffect, useMemo } from "react";
import { Box, Button, Link, Breadcrumbs } from "@mui/material";
import { useParams } from "shell/hooks/useParams";
import moment from "moment";
import { instanceApi } from "shell/services/instance";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ResourceListItem } from "../components/ResourceListItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { ResourceDetailsFilters } from "../components/ResourceDetailsFilters";
import { ActionsTimeline } from "../components/ActionsTimeline";
import { useHistory } from "react-router";
import { ActionsByUsers } from "../components/ActionsByUsers";
import instanceZUID from "utility/instanceZUID";
import { getResourceType } from "../../../../../../../utility/getResourceType";

export const ResourceDetails = () => {
  const history = useHistory();
  const [params, setParams] = useParams();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // If there are no date parameters set, sets date parameters to 1 week
    if (!params.get("from") && !params.get("to")) {
      setParams(moment().add(-6, "days").format("YYYY-MM-DD"), "from");
      setParams(moment().add(1, "days").format("YYYY-MM-DD"), "to");
    }
    /*
      Initialized get sets to true after setting date params to then be utilized to determine 
      if API call is ready to be executed
    */
    setInitialized(true);
  }, []);

  const {
    data: resources,
    isLoading,
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

  const zuid = useMemo(
    () => location.pathname.split("/").pop(),
    [location.pathname]
  );

  const actions = useMemo(
    () => resources?.filter((resource) => resource.affectedZUID === zuid) || [],
    [zuid, resources]
  );

  let filteredActions = actions ? [...actions] : [];

  for (const [key, value] of params.entries()) {
    if (key === "from" || key === "to") {
    } else {
      filteredActions = filteredActions.filter(
        (resource) => String(resource?.[key]) === value
      );
    }
  }

  if (isLoading || isUninitialized) return <div>loading...</div>;

  return (
    <Box sx={{ pt: 3 }}>
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
              // Persist date selection
              search: new URLSearchParams({
                ...(params.get("from") && {
                  from: params.get("from"),
                }),
                ...(params.get("to") && {
                  to: params.get("to"),
                }),
              }).toString(),
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
        <ResourceListItem
          resource={
            actions[0] || {
              affectedZUID: zuid,
              resourceType: getResourceType(zuid),
            }
          }
          size="large"
        />
        <Box sx={{ display: "flex", gap: 1.5, px: 2, py: 2.5 }}>
          <Button
            sx={{ height: "max-content" }}
            startIcon={<FontAwesomeIcon icon={faEye} />}
            variant="outlined"
            size="small"
            onClick={() => {
              if (actions[0]?.resourceType === "code") {
                history.push(
                  "/code/file/" +
                    actions[0]?.meta?.uri.split("/").slice(3).join("/")
                );
              } else {
                history.push(new URL(actions[0]?.meta?.url)?.pathname);
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
      <Box sx={{ px: 3, mt: 2 }}>
        <ResourceDetailsFilters actions={actions} />
        <Box sx={{ display: "flex", gap: 17 }}>
          <ActionsTimeline actions={filteredActions} />
          <Box sx={{ minWidth: 298, py: 5 }}>
            <ActionsByUsers actions={filteredActions} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
