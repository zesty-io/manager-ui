import { alpha } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Skeleton,
  Typography,
} from "@mui/material";
import { fetchAuditTrailDrafting } from "shell/store/logs";
import cx from "classnames";
import SharedWidgetStyles from "../SharedWidget.less";
import { AppLink } from "shell/components/AppLink";
import styles from "./WidgetDraftHistory.less";
import { formatDistanceToNow, isValid } from "date-fns";

export default connect((state, props) => {
  return {
    instanceZUID: state.instance.ZUID,
    logs:
      state.logs[props.itemZUID] && state.logs[props.itemZUID].auditTrailDraft
        ? state.logs[props.itemZUID].auditTrailDraft
        : [],
  };
})(function WidgetDraftHistory(props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!props.itemZUID) return;

    setLoading(true);
    props.dispatch(fetchAuditTrailDrafting(props.itemZUID)).finally(() => {
      setLoading(false);
    });
  }, [props.itemZUID]);

  return (
    <Card
      id="WidgetDraftHistory"
      className="pageDetailWidget"
      sx={{ mb: 3, backgroundColor: "transparent" }}
      elevation={0}
    >
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          color: alpha(theme.palette.text.primary, 0.4),
          borderBottom: 1,
          borderColor: "grey.200",
        }}
        titleTypographyProps={{
          sx: {
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "32px",
            color: "text.primary",
          },
        }}
        title="DRAFT HISTORY"
      ></CardHeader>
      <CardContent
        className={cx(
          "setting-field audit-trail-content",
          SharedWidgetStyles.CardListSpace
        )}
        sx={{
          p: 0,
          pt: 2,
          "&:last-child": {
            pb: 0,
          },
        }}
      >
        {loading ? (
          <Stack gap={1.5}>
            {[...Array(4)].map((_, index) => (
              <Stack key={index} direction="row" justifyContent="space-between">
                <Skeleton variant="rounded" width={192} height={20} />
                <Skeleton variant="rounded" width={60} height={20} />
              </Stack>
            ))}
            <Skeleton variant="rounded" width={84} height={20} />
          </Stack>
        ) : props.logs.length ? (
          <>
            <Stack gap={1.5} className="logs">
              {props.logs.map((log) => (
                <Stack
                  className="log"
                  key={log.ZUID}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >{`${log.firstName} ${log.lastName}`}</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: alpha(theme.palette.text.primary, 0.56),
                    }}
                  >
                    {isValid(new Date(log.happenedAt))
                      ? formatDistanceToNow(new Date(log.happenedAt), {
                          addSuffix: true,
                        })
                      : ""}
                  </Typography>
                </Stack>
              ))}
              <AppLink
                className={styles.AppLink}
                to={`/reports/activity-log/resources/${props.itemZUID}`}
              >
                View Activity Log
              </AppLink>
            </Stack>
          </>
        ) : (
          <Typography
            className="noLogs"
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "text.primary",
            }}
          >
            No Activity Log edit logs for this content.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});
