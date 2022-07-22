import { useMemo } from "react";
import { uniqBy } from "lodash";
import { FixedSizeList as List } from "react-window";
import moment from "moment";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { useParams } from "shell/hooks/useParams";
import { useWindowSize } from "react-use";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography } from "@mui/material";
import {
  faClock,
  faEye,
  faEyeSlash,
  faFileDownload,
  faPencilAlt,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

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
      return `Scheduled to Publish on ${moment(action?.happenedAt).format(
        "MMMM DD [at] hh:mm A"
      )}`;
    default:
      return action.meta.message;
  }
};

export const ActionsTimeline = (props) => {
  const { width, height } = useWindowSize();

  const actionsWithHeaders = useMemo(() => {
    let arr = [];
    props.actions.forEach((action) => {
      const formattedDate = moment(action.happenedAt).format("LL");
      if (!arr.includes(formattedDate)) {
        arr.push(formattedDate);
      }

      arr.push(action);
    });
    return arr;
  });

  const Row = ({ index, data, style }) => {
    const action = data[index];

    if (typeof action === "string") {
      return (
        <div style={style}>
          <Typography sx={{ py: 5 }} variant="h5" fontWeight={600}>
            {moment().isSame(action, "day")
              ? "Today"
              : moment().add(-1, "days").isSame(action, "day")
              ? "Yesterday"
              : action}
          </Typography>
        </div>
      );
    }

    return (
      <div style={style}>
        <TimelineItem sx={{ "&::before": { flex: "unset" } }}>
          <TimelineSeparator>
            <TimelineDot
              sx={{
                boxShadow: "none",
                height: 40,
                width: 40,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: actionBackgroundColorMap?.[action.action],
                color: actionIconColorMap?.[action.action],
              }}
            >
              <FontAwesomeIcon
                icon={actionIconMap?.[action.action] || faFileDownload}
                style={{ fontSize: 16 }}
              />
            </TimelineDot>
            {actionsWithHeaders[index + 1] &&
              typeof actionsWithHeaders[index + 1] !== "string" && (
                <TimelineConnector
                  sx={{ height: 35, backgroundColor: "grey.200" }}
                />
              )}
          </TimelineSeparator>
          <TimelineContent>
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
            >
              {moment(action.happenedAt).format("hh:mm A")}
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
      </div>
    );
  };

  return (
    <List
      height={height - 290}
      itemCount={actionsWithHeaders.length}
      itemSize={110}
      width={"100%"}
      itemData={actionsWithHeaders}
    >
      {Row}
    </List>
  );
};
