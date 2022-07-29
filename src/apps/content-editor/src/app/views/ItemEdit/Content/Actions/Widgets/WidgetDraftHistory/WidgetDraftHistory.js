import { useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import PersonIcon from "@mui/icons-material/Person";
import { Card, CardHeader, CardContent, Link } from "@mui/material";
import { fetchAuditTrailDrafting } from "shell/store/logs";
import cx from "classnames";
import SharedWidgetStyles from "../SharedWidget.less";
import { AppLink } from "@zesty-io/core";

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
    <Card id="WidgetDraftHistory" className="pageDetailWidget" sx={{ m: 2 }}>
      <CardHeader
        avatar={<PersonIcon fontSize="small" />}
        title={
          <>
            {" "}
            <span className="audit-title">Draft History</span>
            <small>&nbsp;Activity Log;</small>
          </>
        }
      ></CardHeader>
      <CardContent
        className={cx(
          "setting-field audit-trail-content",
          SharedWidgetStyles.CardListSpace
        )}
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
            <AppLink to={`/reports/activity-log/resources/${props.itemZUID}`}>
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
