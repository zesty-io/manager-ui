import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import uniqBy from "lodash/uniqBy";
import cx from "classnames";
import zuid from "zuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faClock } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import AccessAlarmsIcon from "@mui/icons-material/AccessAlarms";

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
    // Filter logs to actions by the session user
    let userLogs = Object.keys(props.logs)
      .filter((logZUID) => {
        return (
          props.logs[logZUID].actionByUserZUID === props.user.ZUID &&
          props.logs[logZUID].action == props.action
        );
      })
      .map((zuid) => props.logs[zuid])
      .sort((loga, logb) => {
        return moment(logb.createdAt) - moment(loga.createdAt);
      });

    // only if there are user logs do we want to make API requests to enrich them
    if (userLogs.length) {
      setLoading(true);

      // Find 5 latest unique logs
      let affectedUserLogs = uniqBy(userLogs, "affectedZUID").slice(0, 5);

      // Clean up log messages
      // Based on the ZUID prefix request differing endpoints to resolve affected record data
      Promise.all(
        affectedUserLogs.map((log) => {
          switch (Number(log.affectedZUID.split("-")[0])) {
            // Display content item meta title
            case zuid.prefix.SITE_CONTENT_ITEM:
              return dispatch(searchItems(log.affectedZUID)).then((item) => {
                if (item?.data[0]?.web?.metaTitle) {
                  if (log.action === 2) {
                    log.recentTitle = `You Modified Content Item ${
                      item.data[0].web.metaTitle
                    } ${moment(log.updatedAt).fromNow()}`;
                  } else if (log.action === 4) {
                    log.recentTitle = `You Published Content Item ${
                      item.data[0].web.metaTitle
                    } ${moment(log.updatedAt).fromNow()}`;
                  }
                }

                return log;
              });

            // Display model labels
            case zuid.prefix.SITE_CONTENT_SET:
              return dispatch(fetchModel(log.affectedZUID)).then((model) => {
                if (model?.payload?.label) {
                  log.recentTitle = `You Modified Schema ${
                    model.payload.label
                  } ${moment(log.updatedAt).fromNow()}`;
                }
                return log;
              });

            // Display field and model labels
            case zuid.prefix.SITE_FIELD:
              // NOTE: Can not use fetchField action because we do not have the field model ZUID on hand
              return request(
                `${CONFIG.API_INSTANCE}${log.meta.uri.slice(3)}` // strip api version from uri
              ).then((field) => {
                return request(
                  `${CONFIG.API_INSTANCE}/content/models/${field.data.contentModelZUID}`
                ).then((model) => {
                  if (field?.data?.label && model?.data?.label) {
                    if (log.action === 2) {
                      log.recentTitle = `You Modified ${
                        field.data.label
                      } Field on ${model.data.label} Schema ${moment(
                        log.updatedAt
                      ).fromNow()}`;
                    }
                  }

                  return log;
                });
              });

            default:
              // NOTE: Brave browser does not support replaceAll so check for presence of
              // function before using. Defaults to API log
              if (log?.meta?.message?.replaceAll) {
                // strip backticks from default log message
                log.recentTitle = `You ${log.meta.message.replaceAll(
                  "`",
                  ""
                )} ${moment(log.updatedAt).fromNow()}`;
              }

              return log;
          }
        })
      )
        .then((logs) => {
          setLatest(logs);
        })
        .finally(() => setLoading(false));
    }
  }, [props.user, Object.keys(props.logs).length]);

  return (
    <Card
      className={styles.UserLatestEdits}
      sx={{
        m: 2,
        display: "flex",
        flexDirection: "column",
        minHeight: "275px",
      }}
    >
      <CardHeader
        avatar={<AccessAlarmsIcon fontSize="small" />}
        title={props.cardTitle}
      ></CardHeader>
      <CardContent className={styles.CardContent}>
        <WithLoader condition={!loading} message={`Loading ${props.cardTitle}`}>
          {!latest.length && props.action === "2" && (
            <h3 className={cx(styles.NoLogs, styles.display)}>
              No recent edits
            </h3>
          )}

          {!latest.length && props.action === "4" && (
            <h3 className={cx(styles.NoLogs, styles.display)}>
              No recent publishes
            </h3>
          )}
          <ul>
            {latest.map((log, i) => {
              let url = "";

              if (log.meta?.url) {
                url = log.meta.url.split("/").slice(3).join("/");
              }

              return (
                <li key={i}>
                  <div>
                    <h4>
                      {log.recentTitle ? log.recentTitle : log.meta.message}
                    </h4>
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
        </WithLoader>
      </CardContent>
    </Card>
  );
}
