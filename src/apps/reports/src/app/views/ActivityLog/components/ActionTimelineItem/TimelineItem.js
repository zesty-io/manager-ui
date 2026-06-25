import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatLocalized } from "shell/i18n/dates";
import { isValid, parse } from "date-fns";
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
import { useGetWorkflowStatusLabelsQuery } from "../../../../../../../../shell/services/instance";

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
  2: "info.main",
  3: "error.dark",
  4: "success.main",
  5: "warning.main",
  6: "grey.500",
};

export const TimelineItem = (props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const {
    data: workflowStatusLabels,
    isLoading: isLoadingWorkflowStatusLabels,
  } = useGetWorkflowStatusLabelsQuery({ showDeleted: true });

  const actionMessage = useMemo(() => {
    if (props.action?.meta?.uri?.includes("labels")) {
      // The labels are formatted in the message as `label1,label2`.
      // This regex captures the labels inside the backticks.
      const match = props.action?.meta?.message?.match(/`([^`]*)`/);
      const labels = match?.[1]
        ? match[1].split(",").map((labelZUID) => {
            const workflowStatus = workflowStatusLabels?.find(
              (label) => label.ZUID === labelZUID
            );

            return `"${workflowStatus?.name || labelZUID}"`;
          })
        : [];

      switch (props.action?.action) {
        case 1:
          return t("reports.actionAddedStatus", { labels: labels.join(", ") });

        case 3:
          return t("reports.actionRemovedStatus", {
            labels: labels.join(", "),
          });

        default:
          return props.action?.meta?.message;
      }
    } else {
      switch (props.action?.action) {
        case 1:
          return t("reports.actionCreated");
        case 2:
          return t("reports.actionModified");
        case 3:
          return t("reports.actionDeleted");
        case 4:
          return t("reports.actionPublished");
        case 5:
          return t("reports.actionUnpublished");
        case 6:
          const [publishAt] = props.action?.meta?.message.split(" ").slice(-1);
          const d = new Date(publishAt || props.action?.happenedAt);
          return isValid(d)
            ? t("reports.actionScheduledPublishOn", {
                date: formatLocalized(d, "MMMM dd 'at' hh:mm a"),
              })
            : t("reports.actionScheduledPublish");
        default:
          return props.action?.meta?.message;
      }
    }
  }, [props.action, t]);

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
            margin: 0,
            padding: 0,
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
      <TimelineContent
        sx={{ overflow: "hidden", paddingTop: 0, marginTop: "-12px" }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {props.showSkeletons ? (
            <Skeleton
              variant="rectangular"
              width={200}
              height={4}
              sx={{ my: 1 }}
            />
          ) : (
            <>
              {isValid(new Date(props.action?.happenedAt))
                ? formatLocalized(new Date(props.action?.happenedAt), "hh:mm a")
                : "—"}
            </>
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
          ) : location.pathname.includes("resources") &&
            props.action?.resourceType !== "schema" ? (
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
              {/*Hide item subtext on resource detail page*/}
              {location.pathname.includes("resources")
                ? t("reports.actionBy")
                : t("reports.actionInBy", {
                    itemSubtext: props.itemSubtext,
                  })}{" "}
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
