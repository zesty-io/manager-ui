import React, { useState, useEffect } from "react";
import moment from "moment";
import { request } from "utility/request";
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
  const [title, setTitle] = useState("Loading....");

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
        return moment(logb.createdAt) - moment(loga.createdAt);
      })
      .slice(0, 5);

    const requestArray = userLogs.map(afZUID => afZUID.affectedZUID);
    console.log(
      "🚀 ~ file: UserLatest.js ~ line 35 ~ useEffect ~ requestArray",
      requestArray
    );

    Promise.all(
      requestArray.map(affectedZUID => {
        return request(`${CONFIG.API_INSTANCE}/search/items?q=${affectedZUID}`)
          .then(data => {
            console.log(data);
            console.log(data.data[0].web?.metaTitle);
            const title = data.data[0].web?.metaTitle;
            return title;
          })
          .catch(err => console.log(err));
      })
    );

    setTitle(title);
    setLatest(userLogs);
  }, [props.user, props.logs]);

  return (
    <Card className={styles.UserLatestEdits}>
      <CardHeader>{props.cardTitle}</CardHeader>
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
                  {/* <h4>{`${log.meta.message}`}</h4> */}
                  <h4>{title ? title : log.meta.message}</h4>
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
