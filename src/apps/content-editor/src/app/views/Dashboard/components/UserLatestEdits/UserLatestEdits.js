import React from "react";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";

import { WithLoader } from "@zesty-io/core/WithLoader";

import styles from "./UserLatestEdits.less";

export function UserLatestEdits(props) {
  return (
    <>
      <Card className={styles.UserLatestEdits}>
        <CardHeader>{props.cardTitle}</CardHeader>
        <CardContent className={styles.CardContent}>
          {props.user.slice(0, 5).map((item, i) => (
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
