import { memo, useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import PersonIcon from "@mui/icons-material/Person";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { fetchAuditTrailPublish } from "shell/store/logs";
import cx from "classnames";
import SharedWidgetStyles from "../SharedWidget.less";
import { AppLink } from "@zesty-io/core";
import styles from "./WidgetPublishHistory.less";

export default connect((state) => {
  return {
    logs: state.logs,
    instanceZUID: state.instance.ZUID,
  };
})(
  memo(function WidgetPublishHistory(props) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setLoading(true);
      props.dispatch(fetchAuditTrailPublish(props.itemZUID)).finally(() => {
        setLoading(false);
      });
    }, []);

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
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#101828",
              }}
            >
              Loading Logs
            </Typography>
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
                          {moment(log.happenedAt).fromNow()}
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
