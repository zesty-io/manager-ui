import React from "react";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faLink } from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Notice } from "@zesty-io/core/Notice";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./AuditTrail.less";

export default function AuditTrail(props) {
  return (
    <Card className={styles.AuditTrail}>
      <CardHeader>
        <h1>
          <FontAwesomeIcon icon={faHistory} /> AuditTrail™
        </h1>
      </CardHeader>

      <CardContent>
        {props.logs.length === 0 && (
          <Notice className={styles.NoLogs}>
            When this file is saved or published you will be able to see logs of
            when and by whom.
          </Notice>
        )}

        <ul>
          {props.logs.map(log => (
            <li key={log.ZUID} className={styles.Log}>
              {`${moment(log.createdAt).format("YYYY-MM-DD")} ${
                log.firstName
              } ${log.lastName}`}
              {log.firstName === "Unknown" && log.lastName === "User"
                ? `(${log.actionByUserZUID})`
                : null}
              {`: ${log.meta.message}`}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <AppLink className={styles.MoreLogs} to={`/audit-trail`}>
          <FontAwesomeIcon icon={faLink} /> View all logs
        </AppLink>
      </CardFooter>
    </Card>
  );
}
