import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import uniqBy from "lodash/uniqBy";
import zuid from "zuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faClock } from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { request } from "utility/request";
import { searchItems } from "shell/store/content";
import { fetchModel } from "shell/store/models";

import styles from "./UserLatest.less";
export function UserLatest(props) {
  const dispatch = useDispatch();

  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Filter logs to actions by the session user
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

    // Find 5 latest unique logs
    let affectedUserLogs = uniqBy(userLogs, "affectedZUID").slice(0, 5);

    // Clean up log messages
    // Based on the ZUID prefix request differing endpoints to resolve affected record data
    Promise.all(
      affectedUserLogs.map(log => {
        switch (Number(log.affectedZUID.split("-")[0])) {
          // Display content item meta title
          case zuid.prefix.SITE_CONTENT_ITEM:
            return dispatch(searchItems(log.affectedZUID)).then(item => {
              if (item?.data[0]?.web?.metaTitle) {
                if (log.action === 2) {
                  log.recentTitle = `Modified Content Item ${item.data[0].web.metaTitle}`;
                } else if (log.action === 4) {
                  log.recentTitle = `Published Content Item ${item.data[0].web.metaTitle}`;
                }
              }

              return log;
            });

          // Display model labels
          case zuid.prefix.SITE_CONTENT_SET:
            return dispatch(fetchModel(log.affectedZUID)).then(model => {
              if (model?.payload?.label) {
                log.recentTitle = `Modified Schema ${model.payload?.label}`;
              }
              return log;
            });

          // Display field and model labels
          case zuid.prefix.SITE_FIELD:
            // NOTE: Can not use fetchField action because we do not have the field model ZUID on hand
            return request(
              `${CONFIG.API_INSTANCE}${log.meta.uri.slice(3)}` // strip api version from uri
            ).then(field => {
              return request(
                `${CONFIG.API_INSTANCE}/content/models/${field.data.contentModelZUID}`
              ).then(model => {
                if (field?.data?.label && model?.data?.label) {
                  if (log.action === 2) {
                    log.recentTitle = `Modified ${field.data.label} Field on ${model.data.label} Schema`;
                  }
                }

                return log;
              });
            });

          default:
            // strip backticks from default log message
            log.recentTitle = log.meta.message.replaceAll("`", "");
            return log;
        }
      })
    )
      .then(logs => {
        setLatest(logs);
      })
      .finally(() => setLoading(false));
  }, [props.user, props.logs]);

  return (
    <Card className={styles.UserLatestEdits}>
      <WithLoader condition={!loading} message={`Loading ${props.cardTitle}`}>
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
                    <div>
                      <h4>
                        {log.recentTitle ? log.recentTitle : log.meta.message}
                      </h4>
                      <h5>{`${
                        props.cardTitle.includes("Edits")
                          ? "Edited"
                          : "Published"
                      } : ${moment(log.updatedAt).fromNow()}`}</h5>
                    </div>
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
      </WithLoader>
    </Card>
  );
}
