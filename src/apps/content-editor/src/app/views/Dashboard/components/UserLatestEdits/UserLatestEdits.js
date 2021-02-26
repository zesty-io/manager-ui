import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";

import { WithLoader } from "@zesty-io/core/WithLoader";

import styles from "./UserLatestEdits.less";

export function UserLatestEdits(props) {
  console.log(props);
  props.user.forEach(x => {
    console.log(x.meta.message);
  });
  return (
    <>
      <Card className={styles.UserLatestEdits}>
        <CardHeader>Your Latest Edits</CardHeader>
        <CardContent className={styles.CardContent}>
          {props.user.map((item, i) => (
            <div key={i}>
              <hgroup>
                <h4>{`${item.meta.message}`}</h4>
                <h5>{`Updated: ${moment(item.updatedAt).fromNow()}`}</h5>
              </hgroup>
              <AppLink
                to={`/content/${item.meta.message
                  .split(" ")
                  .slice(-1)
                  .join("")
                  .replaceAll('"', "")
                  .replaceAll(/`/g, "")}/${item.affectedZUID}`}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </AppLink>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
