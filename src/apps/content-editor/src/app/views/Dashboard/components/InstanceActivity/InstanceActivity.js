import React, { useEffect, useState } from "react";
import moment from "moment";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./InstanceActivity.less";

export function InstanceActivity(props) {
  let today = moment().unix();
  // Get date from # days ago
  let DaysAgo = days =>
    moment()
      .subtract(days, "days")
      .unix();

  // Loop through updatedAt dates && filter recentedits 30 days ago
  const checkEdits = (total, days) => {
    return total.filter(user => {
      let userLatest = moment(user.updatedAt).unix();
      if (userLatest <= today && userLatest >= DaysAgo(days)) {
        return total;
      }
    });
  };
  const userNumber = checkEdits(props.totalUserEdits, 30);
  const everyoneNumber = checkEdits(props.totalEveryoneEdits, 30);

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
                <h2 className={styles.headline}>{props.userEdits.length}</h2>
                <small className={styles.subheadline}>Edits</small>
              </div>

              <div className={styles.Stat}>
                <h2 className={styles.headline}>
                  {props.userPublishes.length}
                </h2>
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
              You had a total of{" "}
              <strong>
                {props.userEdits.length + props.userPublishes.length}
              </strong>{" "}
              actions this month
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
