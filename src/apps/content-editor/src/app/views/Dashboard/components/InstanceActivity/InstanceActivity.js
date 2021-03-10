import React, { useEffect, useState } from "react";
import moment from "moment";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./InstanceActivity.less";

export function InstanceActivity(props) {
  const [edits, setEdits] = useState(0);
  const [publishes, setPublishes] = useState(0);

  useEffect(() => {
    const since = moment().subtract(30, "days");
    const userLogs = Object.keys(props.logs)
      .filter(
        logZUID => props.logs[logZUID].actionByUserZUID === props.user.ZUID
      )
      .map(zuid => props.logs[zuid])
      .filter(log => moment(log.createdAt).isSameOrAfter(since));

    const edits = userLogs.filter(log => log.action === 2);
    const publishes = userLogs.filter(log => log.action === 4);

    setEdits(edits.length);
    setPublishes(publishes.length);
  }, [props.user, props.logs]);

  return (
    <>
      <Card>
        <CardHeader>
          <FontAwesomeIcon icon={faCalendar} />
          30 days of your actions
        </CardHeader>
        <CardContent>
          <div className={styles.WrapperActivity}>
            {/* <h1 className={styles.title}>
              {props.firstName} you made &hellip;
            </h1> */}

            <div className={styles.Stats}>
              <div className={styles.Stat}>
                <h2 className={styles.headline}>{edits}</h2>
                <small className={styles.subheadline}>Edits</small>
              </div>

              <div className={styles.Stat}>
                <h2 className={styles.headline}>{publishes}</h2>
                <small className={styles.subheadline}>Publishes</small>
              </div>

              {/* <div className={styles.Stat}>
                <h2 className={styles.headline}>
                  <strong>{userNumber.length}</strong>
                </h2>
                <small className={styles.subheadline}>Total Actions</small>
              </div> */}
            </div>

            <h1 className={styles.title}>
              {props.user.firstName} you had a total of{" "}
              <strong>{edits + publishes}</strong> actions in the last{" "}
              <strong>30 days</strong>
            </h1>

            {/* <p>Edits: {props.userEdits.length}</p>
            <p>Publishes: {props.userPublishes.length}</p>
            <p>Total Actions: {userNumber.length}</p>
            <p>Everyone: {everyoneNumber.length}</p> */}

            {/* <dl>
              <dt>You</dt>
              <dd className={styles.title}>
                <b>{userNumber.length}</b>
              </dd>
              <dt>Everyone</dt>
              <dd className={styles.title}>
                <b>{everyoneNumber.length}</b>
              </dd>
            </dl> */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
