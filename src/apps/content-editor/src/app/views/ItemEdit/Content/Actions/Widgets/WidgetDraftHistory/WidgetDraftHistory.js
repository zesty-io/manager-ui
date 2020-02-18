import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import { fetchAuditTrailDrafting } from "shell/store/logs";

export default connect((state, props) => {
  return {
    instanceZUID: state.instance.ZUID,
    logs:
      state.logs[props.itemZUID] && state.logs[props.itemZUID].auditTrailDraft
        ? state.logs[props.itemZUID].auditTrailDraft
        : []
  };
})(function WidgetDraftHistory(props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    props
      .dispatch(fetchAuditTrailDrafting(props.instanceZUID, props.itemZUID))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Card id="WidgetDraftHistory" className="pageDetailWidget">
      <CardHeader>
        <span className="audit-title">
          <FontAwesomeIcon icon={faUserCheck} />
          &nbsp;Drafting History
        </span>
        <small>Audit Trail&trade;</small>
      </CardHeader>
      <CardContent className="setting-field audit-trail-content">
        {loading ? (
          <p>Loading Logs</p>
        ) : props.logs.length ? (
          <ul className="logs">
            {props.logs.map(log => (
              <li className="log" key={log.ZUID}>
                <strong>
                  {log.firstName} {log.lastName}
                </strong>
                &nbsp;
                <span>saved {moment(log.happenedAt).fromNow()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="noLogs">
            No Audit Trail&trade; edit logs for this content.
          </p>
        )}
      </CardContent>
    </Card>
  );
});
