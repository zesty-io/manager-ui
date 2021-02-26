import React, { useEffect } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";
import { useHistory } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faExternalLinkAlt,
  faCode,
  faCog,
  faDatabase,
  faHistory
} from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { AccountInfo } from "./components/AccountInfo";
import { HeaderDashboard } from "./components/HeaderDashboard";
import { TopPerforming } from "./components/TopPerforming";
import { RecentlyEdited } from "./components/RecentlyEdited";
import { UserLatestEdits } from "./components/UserLatestEdits";
import { InstanceActivity } from "./components/InstanceActivity";

import { QuickJumps } from "./components/QuickJumps";

import { fetchRecentItems, getUserLogs } from "shell/store/user";

import styles from "./Dashboard.less";

export default connect(function(state, props) {
  return {
    user: state.user,
    instanceZUID: state.instance.ZUID,
    instance: state.instance,
    instanceName: state.instance.name,
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
      loading: true,
      webEngineOn: true, // in the future this will be a boolean pulled off the account, it will change the dash
      domainSet: Boolean(this.props.instance.live_domain)
    };

    componentDidMount() {
      const start = moment()
        .subtract(120, "days")
        .format("YYYY-MM-DD");

      Promise.all([
        this.props.dispatch(fetchRecentItems(this.props.user.ZUID, start)),
        this.props.dispatch(getUserLogs())
      ]).then(res => {
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
      console.log(this.props);

      return (
        <section className={styles.Dashboard}>
          <div className={styles.container}>
            <HeaderDashboard
              instanceName={this.props.instance.name}
              createdAt={this.props.instance.createdAt}
              randomHashID={this.props.instance.randomHashID}
              domain={this.props.instance.domain}
              firstName={this.props.user.firstName}
            />

            {/* USER LATEST  */}
            <section className={styles.LatestActivity}>
              <UserLatestEdits user={this.props.user.latest_edits} />
              <UserLatestEdits user={this.props.user.latest_publishes} />

              {/* STATS */}
              <InstanceActivity
                totalEdits={this.props.user.total_user_actions}
              />
            </section>
            <section className={styles.LinkOuts}>
              <QuickJumps
                cardTitle={"Open Preview"}
                docsTitle={"WebEngine Docs Link"}
                docsLink={"https://zesty.org/services/web-engine"}
                randomHashID={this.props.instance.randomHashID}
                liveLink={this.props.instance.domain}
              />
              <QuickJumps
                cardTitle={"Edit Code"}
                image={faCode}
                docsTitle={"Code Docs"}
                docsLink={"https://zesty.org/services/manager-ui/editor"}
                quickJump={"code"}
              />
              <QuickJumps
                cardTitle={"Settings"}
                image={faCog}
                docsTitle={"Settings Docs"}
                docsLink={"https://zesty.org/services/manager-ui/settings"}
                quickJump={"settings"}
              />
              <QuickJumps
                cardTitle={"Schema"}
                image={faDatabase}
                docsTitle={"Schema Docs"}
                docsLink={"https://zesty.org/services/manager-ui/schema"}
                quickJump={"schema"}
              />
              <QuickJumps
                cardTitle={"Audit Trail"}
                image={faHistory}
                docsTitle={"Audit Trail Docs"}
                docsLink={"https://zesty.org/services/manager-ui/audit-trail"}
                quickJump={"audit-trail"}
              />
            </section>
            <section className={styles.Chart}>
              {/* Graph */}
              <Card>
                <CardHeader>Editing Trend Last 30days Coming Soon</CardHeader>
                <CardContent>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </CardContent>
                <CardFooter>this is the card footer</CardFooter>
              </Card>
              {/* ACCOUNT INFO */}
              <AccountInfo
                instanceName={this.props.instance.name}
                instanceZUID={this.props.instance.ZUID}
                randomHashID={this.props.instance.randomHashID}
                domain={this.props.instance.domain}
              />
            </section>
            <div className={styles.columns}>
              {this.state.favoriteModels.map((arr, i) => {
                const [contentModelZUID, items] = arr;
                const model = this.props.contentModels[contentModelZUID];
                return (
                  <Card className={styles.Card} key={i}>
                    <CardHeader>
                      <h2 className={styles.columns}>
                        <div className={styles.column}>
                          Recent{" "}
                          <AppLink to={`/content/${contentModelZUID}`}>
                            {model && model.label}
                          </AppLink>{" "}
                          Edits
                        </div>
                      </h2>
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
            </div>

            <div className={styles.columns}>
              {/*<div className={styles.column}>
              <ContentVelocity />
            </div>*/}
              <div className={cx(styles.column)}>
                <RecentlyEdited
                  items={this.state.recentlyEditedItems}
                  loading={this.state.loading}
                />
              </div>
              <div className={cx(styles.column, styles.recent)}>
                <TopPerforming
                  instanceZUID={this.props.instanceZUID}
                  profileID={this.props.instance.google_profile_id}
                />
              </div>
            </div>
          </div>
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
