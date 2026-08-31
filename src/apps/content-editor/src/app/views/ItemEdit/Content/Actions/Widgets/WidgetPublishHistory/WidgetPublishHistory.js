import { alpha } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { memo, useState, useEffect } from "react";
import { connect } from "react-redux";

import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";

import { fetchAuditTrailPublish } from "shell/store/logs";
import cx from "classnames";
import SharedWidgetStyles from "../SharedWidget.less";
import { AppLink } from "shell/components/AppLink";
import styles from "./WidgetPublishHistory.less";
import { formatDistanceToNow, isValid } from "date-fns";

export default connect((state) => {
  return {
    logs: state.logs,
    instanceZUID: state.instance.ZUID,
  };
})(
  memo(function WidgetPublishHistory(props) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (!props.itemZUID) return;

      setLoading(true);
      props.dispatch(fetchAuditTrailPublish(props.itemZUID)).finally(() => {
        setLoading(false);
      });
    }, [props.itemZUID]);

    const logs =
      props.logs[props.itemZUID] &&
      props.logs[props.itemZUID].auditTrailPublish;

    return (
      <Card
        id="WidgetPublishHistory"
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
          title="PUBLISH HISTORY"
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
                <Stack
                  key={index}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Skeleton variant="rounded" width={192} height={20} />
                  <Skeleton variant="rounded" width={60} height={20} />
                </Stack>
              ))}
              <Skeleton variant="rounded" width={84} height={20} />
            </Stack>
          ) : (
            <>
              <Stack gap={1.5}>
                {Array.isArray(logs) && !logs.length && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    Not published
                  </Typography>
                )}

                {Array.isArray(logs) &&
                  logs.map((log) => {
                    const { firstName, lastName } = log;
                    return (
                      <Stack
                        key={log.happenedAt}
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: "text.primary",
                          }}
                        >{`${firstName} ${lastName}`}</Typography>
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
                    );
                  })}
                <AppLink
                  className={styles.AppLink}
                  to={`/reports/activity-log/resources/${props.itemZUID}`}
                >
                  View Activity Log
                </AppLink>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    );
  })
);
