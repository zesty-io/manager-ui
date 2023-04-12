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
          title="Publish History"
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
              <AppLink
                className={styles.AppLink}
                to={`/reports/activity-log/resources/${props.itemZUID}`}
              >
                View Logs
              </AppLink>
            </>
          )}
        </CardContent>
      </Card>
    );
  })
);
