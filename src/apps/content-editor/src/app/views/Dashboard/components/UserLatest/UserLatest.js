import React, { useState, useEffect } from "react";
import moment from "moment";
import { request } from "utility/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faClock } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./UserLatest.less";

export function UserLatest(props) {
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    let userLogs = Object.keys(props.logs)

      .filter(logZUID => {
        return (
          props.logs[logZUID].actionByUserZUID === props.user.ZUID &&
          props.logs[logZUID].action == props.action
        );
      })
      .map(zuid => props.logs[zuid])
      .sort((loga, logb) => {
        return moment(logb.createdAt) - moment(loga.createdAt);
      });
    //Filtering out repeated edited titles
    const affectedUserLogs = userLogs
      .filter((log, index) => {
        const _log = log;
        return (
          index ===
          userLogs.findIndex(other_log => {
            return other_log.affectedZUID === _log.affectedZUID;
          })
        );
      })
      .slice(0, 5);

    //Fetch content model metaTitles
    Promise.all(
      affectedUserLogs.map(log => {
        return request(
          `${CONFIG.API_INSTANCE}/search/items?q=${log.affectedZUID}`
        )
          .then(data => {
            log.recentTitle = data.data[0]?.web?.metaTitle;
            return log;
          })
          .catch(err => console.log(err));
      })
    ).then(logs => {
      setLatest(logs);
    });
  }, [props.user, props.logs]);
  return (
    <Card className={styles.UserLatestEdits}>
      <CardHeader>
        <FontAwesomeIcon icon={faClock} />
        {props.cardTitle}
      </CardHeader>
      <CardContent className={styles.CardContent}>
        {latest.length > 0 ? (
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
                    <h4>
                      {log.recentTitle ? log.recentTitle : log.meta.message}
                    </h4>
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
        ) : props.action == "2" ? (
          <h3 className={styles.display}>No recent changes</h3>
        ) : (
          <h3 className={styles.display}>No recent publishes</h3>
        )}
      </CardContent>
    </Card>
  );
}
