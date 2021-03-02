import React, { useEffect, useState } from "react";

import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./InstanceActivity.less";

export function InstanceActivity({
  totalUserEdits,
  totalEveryoneEdits
} = props) {
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
        console.log(total, days);
        console.log(total.length);
        return total;
      }
    });
  };
  const userNumber = checkEdits(totalUserEdits, 30);
  const everyoneNumber = checkEdits(totalEveryoneEdits, 30);

  return (
    <>
      <Card>
        <CardHeader>Instance Activity</CardHeader>
        <CardContent>
          <div className={styles.WrapperActivity}>
            <h3>Last 30 Days Edits</h3>
            <dl>
              <dt>You</dt>
              <dd>{userNumber.length}</dd>
              <dt>Everyone</dt>
              <dd>{everyoneNumber.length}</dd>
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
