import React, { useState, useEffect } from "react";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faClock,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./UserLatest.less";

export function UserLatest(props) {
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    const userLogs = Object.keys(props.logs)

      .filter(logZUID => {
        return (
          props.logs[logZUID].actionByUserZUID === props.user.ZUID &&
          props.logs[logZUID].action == props.action
        );
      })
      .map(zuid => props.logs[zuid])
      .sort((loga, logb) => {
        return Date.parse(logb.happenedAt) - Date.parse(loga.happenedAt);
      })
      .slice(0, 5);

    setLatest(userLogs);
  }, [props.user, props.logs]);

  return (
    <Card className={styles.UserLatestEdits}>
      <CardHeader>
        <FontAwesomeIcon icon={faClock} />
        {props.cardTitle}
      </CardHeader>
      <CardContent className={styles.CardContent}>
        <ul>
          {latest.map((log, i) => {
            let url = "";

            if (log.meta?.url) {
              url = log.meta.url
                .split("/")
                .slice(3)
                .join("/");
            }

            return (
              <li key={i}>
                <hgroup>
                  <h4>{`${log.meta.message}`}</h4>
                  <h5>{`Updated: ${moment(log.updatedAt).fromNow()}`}</h5>
                </hgroup>

                {url && (
                  <AppLink className={styles.AppLink} to={url}>
                    View
                    <FontAwesomeIcon icon={faChevronRight} />
                  </AppLink>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
