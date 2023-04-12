import { useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import PersonIcon from "@mui/icons-material/Person";
import { Card, CardHeader, CardContent, Link } from "@mui/material";
import { fetchAuditTrailDrafting } from "shell/store/logs";
import cx from "classnames";
import SharedWidgetStyles from "../SharedWidget.less";
import { AppLink } from "@zesty-io/core";
import styles from "./WidgetDraftHistory.less";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
    setLoading(true);
    props.dispatch(fetchAuditTrailDrafting(props.itemZUID)).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <Card
      id="WidgetDraftHistory"
      className="pageDetailWidget"
      sx={{ mx: 2, mb: 3, backgroundColor: "transparent" }}
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
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "#101828",
                    }}
                  >{`${log.firstName} ${log.lastName}`}</Typography>
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
              ))}
              <AppLink
                className={styles.AppLink}
                to={`/reports/activity-log/resources/${props.itemZUID}`}
              >
                View Logs
              </AppLink>
            </Stack>
          </>
        ) : (
          <Typography
            className="noLogs"
            sx={{
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              color: "#101828",
            }}
          >
            No Activity Log edit logs for this content.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});
