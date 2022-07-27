import { useMemo } from "react";
import moment from "moment";
import { default as MuiTimelineItem } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography, Link, Skeleton } from "@mui/material";
import {
  faClock,
  faEye,
  faEyeSlash,
  faFileDownload,
  faPencilAlt,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory, useLocation } from "react-router";

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

export const TimelineItem = (props) => {
  const location = useLocation();
  const history = useHistory();

  const actionMessage = useMemo(() => {
    switch (props.action?.action) {
      case 1:
        return "Created";
      case 2:
        return "Modified";
      case 3:
        return "Deleted";
      case 4:
        return "Published";
      case 5:
        return "Unpublished";
      case 6:
        return `Scheduled to Publish on ${moment(
          props.action?.happenedAt
        ).format("MMMM DD [at] hh:mm A")}`;
      default:
        return props.action?.meta?.message;
    }
  }, [props.action]);

  return (
    <MuiTimelineItem
      sx={{ maxWidth: 720, "&::before": { flex: "unset", padding: 0 } }}
    >
      <TimelineSeparator>
        <TimelineDot
          sx={{
            boxShadow: "none",
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: props.showSkeletons
              ? "unset"
              : actionBackgroundColorMap?.[props.action?.action],
            color: actionIconColorMap?.[props.action?.action],
          }}
        >
          {props.showSkeletons ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <FontAwesomeIcon
              icon={actionIconMap?.[props.action?.action] || faFileDownload}
              style={{ fontSize: 16 }}
            />
          )}
        </TimelineDot>
        {props.renderConnector && (
          <TimelineConnector sx={{ height: 35, backgroundColor: "grey.200" }} />
        )}
      </TimelineSeparator>
      <TimelineContent sx={{ overflow: "hidden" }}>
        <Typography variant="caption" component="div" color="text.secondary">
          {props.showSkeletons ? (
            <Skeleton
              variant="rectangular"
              width={200}
              height={4}
              sx={{ my: 1 }}
            />
          ) : (
            moment(props.action?.happenedAt).format("hh:mm A")
          )}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {props.showSkeletons ? (
            <Skeleton
              variant="rectangular"
              width={555}
              height={16}
              sx={{ mb: 1 }}
            />
          ) : location.pathname.includes("resources") ? (
            actionMessage
          ) : (
            `${actionMessage} ${props.itemName}`
          )}
        </Typography>
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {" "}
          {props.showSkeletons ? (
            <Skeleton variant="rectangular" width={200} height={4} />
          ) : (
            <>
              In {props.itemSubtext} by{" "}
              <Link
                underline="hover"
                href="#"
                onClick={(evt) => {
                  evt.preventDefault();
                  history.push(
                    `/reports/activity-log/users/${props.action?.actionByUserZUID}`
                  );
                }}
              >
                {props.action?.firstName} {props.action?.lastName}
              </Link>
            </>
          )}
        </Typography>
      </TimelineContent>
    </MuiTimelineItem>
  );
};
