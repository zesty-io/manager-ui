import React, { useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";
import { useHistory } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCode,
  faCog,
  faDatabase,
  faHistory,
  faClock,
  faUser
} from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";

import { AccountInfo } from "./components/AccountInfo";
import { ChartDashboard } from "./components/ChartDashboard";
import { RecentlyEdited } from "./components/RecentlyEdited";
import { UserLatest } from "./components/UserLatest";
import { InstanceActivity } from "./components/InstanceActivity";
import { QuickJumps } from "./components/QuickJumps";

import { fetchRecentItems, getUserLogs } from "shell/store/user";

import styles from "./Dashboard.less";
export default connect(function(state) {
  return {
    user: state.user,
    instance: state.instance,
    headTags: state.headTags,
    logs: state.logs,
    contentModels: Object.keys(state.models).reduce((acc, modelZUID) => {
      if (
        state.models[modelZUID] &&
        state.models[modelZUID].label !== "Dashboard Widgets"
      ) {
        acc[modelZUID] = state.models[modelZUID];
      }
      return acc;
    }, {})
  };
})(
  class Dashboard extends React.PureComponent {
    state = {
      recentlyEditedItems: [],
      favoriteModels: [],
      loading: true
    };

    componentDidMount() {
      const start = moment()
        .subtract(120, "days")
        .format("YYYY-MM-DD");

      this.props
        .dispatch(fetchRecentItems(this.props.user.ZUID, start))
        .then(res => {
          if (res && res.data) {
            this.setState({
              recentlyEditedItems: this.getLastEditedItems(res.data),
              favoriteModels: this.getFavoriteModels(res.data),
              loading: false
            });
          } else {
            this.setState({
              loading: false
            });
          }
        });

      this.props.dispatch(getUserLogs());
    }

    getFavoriteModels(items) {
      const grouped = items.reduce((acc, item) => {
        if (acc[item.meta.contentModelZUID]) {
          acc[item.meta.contentModelZUID].push(item);
        } else {
          acc[item.meta.contentModelZUID] = [item];
        }
        return acc;
      }, {});

      const sorted = Object.keys(grouped)
        .filter(item => grouped[item][0].web.metaTitle)
        .map(contentModelZUID => {
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

    getLastEditedItems(items) {
      return [...items]
        .sort((a, b) => {
          if (a.meta.updatedAt < b.meta.updatedAt) {
            return 1;
          }
          if (a.meta.updatedAt > b.meta.updatedAt) {
            return -1;
          }
          return 0;
        })
        .slice(0, 5);
    }

    render() {
      return (
        <section className={styles.Dashboard}>
          <section className={styles.LinkOuts}>
            <div className={styles.Cards}>
              <AccountInfo
                instanceZUID={this.props.instance.ZUID}
                randomHashID={this.props.instance.randomHashID}
                domain={this.props.instance.domain}
                headTags={this.props.headTags}
                instanceName={this.props.instance.name}
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
              logs={this.props.logs}
              user={this.props.user}
              action="2"
            />
            <UserLatest
              cardTitle="Your Latest Publishes"
              logs={this.props.logs}
              user={this.props.user}
              action="4"
            />
          </section>
          <section className={styles.Chart}>
            <InstanceActivity logs={this.props.logs} user={this.props.user} />
            <ChartDashboard logs={this.props.logs} />
          </section>
          <section className={styles.RecentActivities}>
            {/* <RecentlyEdited
              items={this.state.recentlyEditedItems}
              loading={this.state.loading}
            /> */}
            {this.state.favoriteModels.map((arr, i) => {
              const [contentModelZUID, items] = arr;

              const model = this.props.contentModels[contentModelZUID];
              {
                /* console.log(
                "🚀 ~ file: Dashboard.js ~ line 215 ~ Dashboard ~ {this.state.favoriteModels.map ~ model",
                model
              ); */
              }
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
    }
  }
);

function DashboardCardFooter(props) {
  const history = useHistory();
  return (
    <CardFooter>
      <Button
        kind="secondary"
        onClick={() => history.push(`/content/${props.contentModelZUID}/new`)}
      >
        <FontAwesomeIcon icon={faPlus} />
        Create {props.model && props.model.label}
      </Button>
    </CardFooter>
  );
}
