import React, { useEffect, useState } from "react";

import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./InstanceActivity.less";

export function InstanceActivity(props) {
  return (
    <>
      <Card>
        <CardHeader>Instance Activity</CardHeader>
        <CardContent>
          <div className={styles.WrapperActivity}>
            <h3>Last 7 days</h3>
            <dl>
              <dt>You</dt>
              <dd>{props.totalEdits.length}</dd>
              <dt>Everyone</dt>
              <dd>1034</dd>
            </dl>
            <h3>All time</h3>
            <dl>
              <dt>You</dt>
              <dd>20</dd>
              <dt>Everyone</dt>
              <dd>1034</dd>
            </dl>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
