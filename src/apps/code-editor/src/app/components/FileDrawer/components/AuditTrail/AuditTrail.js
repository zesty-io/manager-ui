import React from "react";
import moment from "moment";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Notice } from "@zesty-io/core/Notice";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./AuditTrail.less";
export default function AuditTrail(props) {
  return (
    <Card className={styles.AuditTrail}>
      <CardHeader>
        <h1>
          <i className="fas fa-history"></i> AuditTrail™
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
              } ${log.lastName}: ${log.meta.message}`}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <AppLink className={styles.MoreLogs} to={`/audit-trail`}>
          <i className="fas fa-link"></i> View all logs
        </AppLink>
      </CardFooter>
    </Card>
  );
}
