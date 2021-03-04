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
          <FontAwesomeIcon icon={faCalendar} /> Total 30 days of instance
          actions
        </CardHeader>
        <CardContent>
          <div className={styles.WrapperActivity}>
            <dl>
              <dt>You</dt>
              <dd className={styles.title}>
                <b>{userNumber.length}</b>
              </dd>
              <dt>Everyone</dt>
              <dd className={styles.title}>
                <b>{everyoneNumber.length}</b>
              </dd>
            </dl>
            {/* <h3>All time</h3>
            <dl>
              <dt>You</dt>
              <dd>20</dd>
              <dt>Everyone</dt>
              <dd>1034</dd>
            </dl> */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
