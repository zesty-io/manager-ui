import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import { fetchAuditTrailPublish } from "shell/store/logs";

export default connect(state => {
  return {
    logs: state.logs,
    instanceZUID: state.instance.ZUID
  };
})(
  React.memo(function WidgetPublishHistory(props) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setLoading(true);
      props
        .dispatch(fetchAuditTrailPublish(props.instanceZUID, props.itemZUID))
        .finally(() => {
          setLoading(false);
        });
    }, []);

    const logs =
      props.logs[props.itemZUID] &&
      props.logs[props.itemZUID].auditTrailPublish;

    return (
      <Card id="WidgetPublishHistory" className="pageDetailWidget">
        <CardHeader>
          <span className="audit-title">
            <FontAwesomeIcon icon={faUserCheck} />
            &nbsp;Publish History
          </span>
          <small>Audit Trail&trade;</small>
        </CardHeader>
        <CardContent className="setting-field audit-trail-content">
          {loading ? (
            <p>Loading Logs</p>
          ) : (
            <ul className="logs">
              {Array.isArray(logs) &&
                logs.map(log => {
                  const dataformat = new Date(log.happenedAt)
                    .toISOString()
                    .slice(0, 10);
                  const { firstName, lastName } = log;
                  return (
                    <li className="log" key={log.ZUID}>
                      <strong>{`${firstName} ${lastName}`}</strong> published{" "}
                      {moment(log.happenedAt).fromNow()}
                    </li>
                  );
                })}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  })
);
