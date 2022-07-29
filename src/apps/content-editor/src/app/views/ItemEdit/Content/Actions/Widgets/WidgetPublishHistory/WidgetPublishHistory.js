import { memo, useState, useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import PersonIcon from "@mui/icons-material/Person";

import { fetchAuditTrailPublish } from "shell/store/logs";
import cx from "classnames";
import SharedWidgetStyles from "../SharedWidget.less";
import { AppLink } from "@zesty-io/core";

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
        sx={{ m: 2 }}
      >
        <CardHeader
          avatar={<PersonIcon fontSize="small" />}
          title={
            <>
              {" "}
              <span className="audit-title">Publish History </span>
              <small>&nbsp;Activity Log</small>
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
          ) : (
            <>
              <ul className="logs">
                {Array.isArray(logs) && !logs.length && <p>Not published</p>}

                {Array.isArray(logs) &&
                  logs.map((log) => {
                    const { firstName, lastName } = log;
                    return (
                      <li className="log" key={log.ZUID}>
                        <strong>{`${firstName} ${lastName}`}</strong> published{" "}
                        {moment(log.happenedAt).fromNow()}
                      </li>
                    );
                  })}
              </ul>
              <AppLink to={`/reports/activity-log/resources/${props.itemZUID}`}>
                View Logs
              </AppLink>
            </>
          )}
        </CardContent>
      </Card>
    );
  })
);
