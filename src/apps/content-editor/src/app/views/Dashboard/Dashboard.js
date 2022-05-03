import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import moment from "moment-timezone";
import { useHistory } from "react-router-dom";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faCog,
  faDatabase,
  faHistory,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import { AppLink } from "@zesty-io/core/AppLink";
import { AccountInfo } from "./components/AccountInfo";
import { ChartDashboard } from "./components/ChartDashboard";
import { UserLatest } from "./components/UserLatest";
import { InstanceActivity } from "./components/InstanceActivity";
import { QuickJumps } from "./components/QuickJumps";
import { fetchRecentItems, getUserLogs } from "shell/store/user";
import styles from "./Dashboard.less";

function getFavoriteModels(items) {
  const grouped = items.reduce((acc, item) => {
    if (acc[item.meta.contentModelZUID]) {
      acc[item.meta.contentModelZUID].push(item);
    } else {
      acc[item.meta.contentModelZUID] = [item];
    }
    return acc;
  }, {});

  const sorted = Object.keys(grouped)
    .filter((item) => grouped[item][0].web.metaTitle)
    .map((contentModelZUID) => {
      return [contentModelZUID, grouped[contentModelZUID].slice(0, 3)];
    })
    .sort((a, b) => {
      if (a[1].length < b[1].length) {
        return 1;
      }
      if (a[1].length > b[1].length) {
        return -1;
      }
      return 0;
    });

  // Top three most edited models
  return sorted.slice(0, 3);
}

const selectModelsByZuid = createSelector(
  (state) => state.models,
  (models) =>
    Object.keys(models).reduce((acc, modelZUID) => {
      if (
        models[modelZUID] &&
        models[modelZUID].label !== "Dashboard Widgets"
      ) {
        acc[modelZUID] = models[modelZUID];
      }
      return acc;
    }, {})
);

export default memo(function Dashboard() {
  const user = useSelector((state) => state.user);
  const instance = useSelector((state) => state.instance);
  const headTags = useSelector((state) => state.headTags);
  const logs = useSelector((state) => state.logs);
  const modelsByZuid = useSelector(selectModelsByZuid);
  const [favoriteModels, setFavoriteModels] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const start = moment().subtract(120, "days").format("YYYY-MM-DD");

    dispatch(fetchRecentItems(user.ZUID, start))
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setFavoriteModels(getFavoriteModels(res.data));
        }
      })
      .catch((err) => {
        console.error("fetchRecentItems: ", err);
      });

    dispatch(getUserLogs());
  }, [user.ZUID]);
  return (
    <section className={styles.Dashboard}>
      <section className={styles.LinkOuts}>
        <div className={styles.Cards}>
          <AccountInfo
            instanceZUID={instance.ZUID}
            randomHashID={instance.randomHashID}
            headTags={headTags}
            instanceName={instance.name}
          />

          <QuickJumps
            cardTitle={"Code"}
            image={faCode}
            docsTitle={"Read Docs"}
            docsLink={"https://zesty.org/services/manager-ui/editor"}
            quickJump={"code"}
          />
          <QuickJumps
            cardTitle={"Schema"}
            image={faDatabase}
            docsTitle={"Read Docs"}
            docsLink={"https://zesty.org/services/manager-ui/schema"}
            quickJump={"schema"}
          />
          <QuickJumps
            cardTitle={"AuditTrail"}
            image={faHistory}
            docsTitle={"Read Docs"}
            docsLink={"https://zesty.org/services/manager-ui/audit-trail"}
            quickJump={"audit-trail"}
          />
          <QuickJumps
            cardTitle={"Settings"}
            image={faCog}
            docsTitle={"Read Docs"}
            docsLink={"https://zesty.org/services/manager-ui/settings"}
            quickJump={"settings"}
          />
        </div>
      </section>
      <section className={styles.LatestActivity}>
        <UserLatest
          cardTitle="Your Latest Edits"
          logs={logs}
          user={user}
          action="2"
        />
        <UserLatest
          cardTitle="Your Latest Publishes"
          logs={logs}
          user={user}
          action="4"
        />
      </section>
      <section className={styles.Chart}>
        <InstanceActivity logs={logs} user={user} />
        <ChartDashboard logs={logs} />
      </section>
      <section className={styles.RecentActivities}>
        {favoriteModels.map((arr, i) => {
          const [contentModelZUID, items] = arr;
          const model = modelsByZuid[contentModelZUID];

          return (
            <Card className={styles.Card} key={i}>
              <CardHeader>
                <h4 className={styles.columns}>
                  <div className={styles.column}>
                    <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>
                    Recent{" "}
                    <AppLink to={`/content/${contentModelZUID}`}>
                      {model && model.label}
                    </AppLink>{" "}
                    Edits
                  </div>
                </h4>
              </CardHeader>
              <CardContent>
                <ul>
                  {items.map((item, i) => {
                    return (
                      <li key={i}>
                        <AppLink
                          to={`/content/${contentModelZUID}/${item.meta.ZUID}`}
                        >
                          {item.web.metaTitle}
                        </AppLink>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
              <DashboardCardFooter
                model={model}
                contentModelZUID={contentModelZUID}
              />
            </Card>
          );
        })}
      </section>
    </section>
  );
});

function DashboardCardFooter(props) {
  const history = useHistory();
  return (
    <CardFooter>
      <Button
        type="secondary"
        variant="contained"
        onClick={() => history.push(`/content/${props.contentModelZUID}/new`)}
        startIcon={<Icon>add</Icon>}
      >
        Create {props.model && props.model.label}
      </Button>
    </CardFooter>
  );
}
