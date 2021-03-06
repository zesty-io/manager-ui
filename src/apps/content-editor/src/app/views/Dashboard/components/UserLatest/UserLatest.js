import React from "react";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./UserLatest.less";

export function UserLatest(props) {
  return (
    <>
      <Card className={styles.UserLatestEdits}>
        <CardHeader>
          <FontAwesomeIcon icon={faClock} /> {props.cardTitle}
        </CardHeader>
        <CardContent className={styles.CardContent}>
          <ul>
            {props.user.slice(0, 5).map((item, i) => (
              <li key={i}>
                {item.meta.message.includes("Content") ? (
                  <AppLink
                    to={`/content/${item.meta.message
                      .split(" ")
                      .slice(-1)
                      .join("")
                      .replaceAll('"', "")
                      .replaceAll(/`/g, "")}/${item.affectedZUID}`}
                  >
                    {/* <FontAwesomeIcon icon={faExternalLinkAlt} /> */}
                    <h4>{`${item.meta.message}`}</h4>
                  </AppLink>
                ) : (
                  <h4>{`${item.meta.message}`}</h4>
                )}

                <h5>{`Updated: ${moment(item.updatedAt).fromNow()}`}</h5>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
