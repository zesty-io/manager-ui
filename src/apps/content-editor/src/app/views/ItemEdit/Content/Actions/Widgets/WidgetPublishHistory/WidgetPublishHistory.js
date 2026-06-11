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
import { formatDistanceToNowLocalized } from "shell/i18n-dates";
import styles from "./WidgetPublishHistory.less";
import { isValid } from "date-fns";

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
            fontSize: "16px",
            color: "#10182866",
            borderBottom: 1,
            borderColor: "grey.200",
          }}
          titleTypographyProps={{
            sx: {
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "32px",
              color: "#101828",
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
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "#101828",
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
                          sx={{
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "20px",
                            color: "#101828",
                          }}
                        >{`${firstName} ${lastName}`}</Typography>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: "14px",
                            lineHeight: "20px",
                            color: "#1018288f",
                          }}
                        >
                          {isValid(new Date(log.happenedAt))
                            ? formatDistanceToNowLocalized(
                                new Date(log.happenedAt),
                                {
                                  addSuffix: true,
                                }
                              )
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
