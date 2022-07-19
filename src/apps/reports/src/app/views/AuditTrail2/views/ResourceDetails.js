import { useState, useEffect, useMemo } from "react";
import { Typography, Box, Button, Link, Breadcrumbs } from "@mui/material";
import { useParams } from "utility/useParams";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import moment from "moment";
import { instanceApi } from "shell/services/instance";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ResourceListItem } from "../components/ResourceListItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faExternalLinkAlt,
  faEye,
  faEyeSlash,
  faFileDownload,
  faPencilAlt,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ResourceDetailsFilters } from "../components/ResourceDetailsFilters";
import { ActionsTimeline } from "../components/ActionsTimeline";
import { useHistory } from "react-router";

const actionIconMap = {
  1: faPencilAlt,
  2: faSave,
  3: faTrash,
  4: faEye,
  5: faEyeSlash,
  6: faClock,
};

const actionBackgroundColorMap = {
  1: "deepOrange.100",
  2: "blue.100",
  3: "error.light",
  4: "green.100",
  5: "warning.light",
  6: "grey.100",
};

const actionIconColorMap = {
  1: "primary.main",
  2: "info.light",
  3: "error.dark",
  4: "success.main",
  5: "warning.main",
  6: "grey.500",
};

export const ResourceDetails = () => {
  const history = useHistory();
  const [params, setParams] = useParams();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // If there are no date parameters set, sets date parameters to 1 week
    if (!params.get("from") && !params.get("to")) {
      setParams(moment().add(-7, "days").format("YYYY-MM-DD"), "from");
      setParams(moment().format("YYYY-MM-DD"), "to");
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

  const actionsWithHeaders = [];

  filteredActions.forEach((action) => {
    const formattedDate = moment(action.happenedAt).format("L");
    if (!actionsWithHeaders.includes(formattedDate)) {
      actionsWithHeaders.push(formattedDate);
    }

    actionsWithHeaders.push(action);
  });

  console.log("testing pass", resources, actions[0]);

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
        <ResourceListItem resource={actions[0]} size="large" />
        <Box sx={{ display: "flex", gap: 1.5, px: 2, py: 2.5 }}>
          <Button
            sx={{ height: "max-content" }}
            startIcon={<FontAwesomeIcon icon={faExternalLinkAlt} />}
            variant="outlined"
            size="small"
            onClick={() => {
              const path = new URL(resource.meta.url)?.pathname;
              history.push(path);
            }}
          >
            View
          </Button>
          <Button
            sx={{ height: "max-content" }}
            startIcon={<FontAwesomeIcon icon={faFileDownload} />}
            variant="contained"
            size="small"
          >
            Export
          </Button>
        </Box>
      </Box>
      <Box sx={{ px: 3, mt: 2 }}>
        <ResourceDetailsFilters actions={actions} />
        <ActionsTimeline actions={actionsWithHeaders} />
      </Box>
    </Box>
  );
};
