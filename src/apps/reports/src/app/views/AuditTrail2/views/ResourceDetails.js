// import { instanceApi } from "../../../../../../shell/services/instance"
import { useMemo } from "react";
import { Typography, Box, Button, Link, Breadcrumbs } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import moment from "moment";
import { useLocation, useHistory } from "react-router-dom";
import { instanceApi } from "../../../../../../../shell/services/instance";
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
  const location = useLocation();
  const history = useHistory();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const { data, isLoading } = instanceApi.useGetAuditsQuery({
    ...(params.get("from") && {
      start_date: moment(params.get("from")).format("L"),
    }),
    ...(params.get("to") && { end_date: moment(params.get("to")).format("L") }),
  });

  const zuid = location.pathname.split("/").pop();

  const resource =
    data?.find((resource) => resource.affectedZUID === zuid) || {};

  const actions =
    data?.filter((resource) => resource.affectedZUID === zuid) || [];

  let filteredActions = actions ? [...actions] : [];

  for (const [key, value] of params.entries()) {
    if (key === "from" || key === "to") {
    } else {
      filteredActions = filteredActions.filter(
        (resource) => String(resource?.[key]) === value
      );
    }
  }

  if (isLoading) return <div>loading...</div>;

  const actionsWithHeaders = [];

  filteredActions.forEach((action) => {
    const formattedDate = moment(action.updatedAt).format("L");
    if (!actionsWithHeaders.includes(formattedDate)) {
      actionsWithHeaders.push(formattedDate);
    }

    actionsWithHeaders.push(action);
  });

  const generateActionMessage = (action) => {
    switch (action.action) {
      case 1:
        return "Created";
      case 2:
        return "Saved";
      case 3:
        return "Deleted";
      case 4:
        return "Published";
      case 5:
        return "Unpublished";
      case 6:
        return `Scheduled to Publish on ${moment(action?.updatedAt).format(
          "MMMM DD [at] hh:mm A"
        )}`;
      default:
        return action.meta.message;
    }
  };

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
            history.push("/reports/activity-log");
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
            history.push("/reports/activity-log/resources");
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
        <ResourceListItem resource={resource} size="large" />
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
        <Box sx={{ overflowY: "scroll", height: "calc(100vh - 299px)" }}>
          <Timeline sx={{ px: 0, py: 0 }}>
            {actionsWithHeaders.map((action, idx) => {
              if (typeof action === "string") {
                return (
                  <Typography sx={{ py: 2 }} variant="h5" fontWeight={600}>
                    {moment().isSame(action, "day")
                      ? "Today"
                      : moment().add(-1, "days").isSame(action, "day")
                      ? "Yesterday"
                      : action}
                  </Typography>
                );
              }
              return (
                <TimelineItem sx={{ "&::before": { flex: "unset" } }}>
                  <TimelineSeparator>
                    {/* <TimelineConnector
                  sx={{ height: 35, display: typeof actionsWithHeaders[idx - 1] !== 'string' ? "block" : "none" }}
                /> */}
                    {typeof actionsWithHeaders[idx - 1] !== "string" && (
                      <TimelineConnector
                        sx={{ height: 35, backgroundColor: "grey.200" }}
                      />
                    )}
                    <TimelineDot
                      sx={{
                        boxShadow: "none",
                        height: 40,
                        width: 40,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          actionBackgroundColorMap?.[action.action],
                        color: actionIconColorMap?.[action.action],
                      }}
                    >
                      <FontAwesomeIcon
                        icon={actionIconMap?.[action.action] || faFileDownload}
                        style={{ fontSize: 16 }}
                      />
                    </TimelineDot>
                  </TimelineSeparator>
                  <TimelineContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography
                      variant="caption"
                      component="div"
                      color="text.secondary"
                    >
                      {moment(action.updatedAt).format("hh:mm A")}
                    </Typography>
                    <Typography variant="body1">
                      {generateActionMessage(action)}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      color="text.secondary"
                    >
                      {`By ${action.firstName} ${action.lastName}`}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        </Box>
      </Box>
    </Box>
  );
};
