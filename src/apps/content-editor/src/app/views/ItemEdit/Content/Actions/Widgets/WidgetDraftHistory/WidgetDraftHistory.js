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
      sx={{ m: 2 }}
      elevation={0}
    >
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          fontSize: "16px",
          color: "#10182866",
          ".MuiCardHeader-avatar": {
            mr: 1,
          },
        }}
        titleTypographyProps={{
          sx: {
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "20px",
            color: "#101828",
          },
        }}
        avatar={<PersonIcon fontSize="inherit" color="inherit" />}
        title="Draft History"
      ></CardHeader>
      <CardContent
        className={cx(
          "setting-field audit-trail-content",
          SharedWidgetStyles.CardListSpace
        )}
        sx={{
          p: 0,
        }}
      >
        {loading ? (
          <p>Loading Logs</p>
        ) : props.logs.length ? (
          <>
            <ul className="logs">
              {props.logs.map((log) => (
                <li className="log" key={log.ZUID}>
                  <strong>
                    {log.firstName} {log.lastName}
                  </strong>
                  &nbsp;
                  <span>modified {moment(log.happenedAt).fromNow()}</span>
                </li>
              ))}
            </ul>
            <AppLink
              className={styles.AppLink}
              to={`/reports/activity-log/resources/${props.itemZUID}`}
            >
              View Logs
            </AppLink>
          </>
        ) : (
          <p className="noLogs">No Activity Log edit logs for this content.</p>
        )}
      </CardContent>
    </Card>
  );
});
