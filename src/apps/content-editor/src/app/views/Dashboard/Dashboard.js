import React from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";
import { useHistory } from "react-router-dom";

import { PreviewUrl } from "../ItemEdit/components/Header/PreviewUrl/PreviewUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faExternalLinkAlt,
  faLink
} from "@fortawesome/free-solid-svg-icons";

import { Url } from "@zesty-io/core/Url";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";

// import { ContentVelocity } from "./components/ContentVelocity";

import { TopPerforming } from "./components/TopPerforming";
import { RecentlyEdited } from "./components/RecentlyEdited";

import { fetchRecentItems } from "shell/store/user";

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
      domainSet: Boolean(this.props.instance.live_domain),
      gaAuthenticated: Boolean(this.props.instance.google_profile_id),
      gaLegacyAuth: false // we need response body from cloud function could change this
    };

    componentDidMount() {
      // if (this.props.instance.google_profile_id) {
      const start = moment()
        .subtract(120, "days")
        .format("YYYY-MM-DD");
      console.log(start);
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
      // }
    }
    setGALegacyStatus = status => {
      this.setState({ gaLegacyAuth: status });
    };
    /**
      Group items by model
      [
        [contentModelZUID, [item, item, ...]]
      ]
    **/
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
          <div className={styles.container}>
            <header>
              <Card>
                <CardHeader className={styles.DashboardHeader}>
                  <h2>
                    {this.props.instance.name} - Created Date:{" "}
                    {this.props.instance.createdAt}{" "}
                  </h2>
                  <Url
                    target="_blank"
                    title={`${CONFIG.URL_PREVIEW_PROTOCOL}${this.props.instance.randomHashID}${CONFIG.URL_PREVIEW}`}
                    href={`${CONFIG.URL_PREVIEW_PROTOCOL}${this.props.instance.randomHashID}${CONFIG.URL_PREVIEW}`}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                    &nbsp;View Preview
                  </Url>
                  {this.props.instance.domain && (
                    <Url
                      className={styles.Live}
                      href={`//${this.props.instance.domain}`}
                      target="_blank"
                      title="Open live link in standard browser window"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                      &nbsp;View Live
                    </Url>
                  )}
                </CardHeader>
              </Card>
            </header>
            <section className={styles.LatestActivity}>
              <Card>
                <CardHeader>Your Latest Edits</CardHeader>
                <CardContent>
                  <ul>
                    <li>
                      <div>
                        <p>Title - Content Modal Name</p>
                        <p>User 1 edited 1/1/2021</p>
                      </div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </li>
                    <li>
                      <div>
                        <p>Title - Content Modal Name</p>
                        <p>User 1 edited 1/1/2021</p>
                      </div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </li>
                    <li>
                      <div>
                        <p>Title - Content Modal Name</p>
                        <p>User 1 edited 1/1/2021</p>
                      </div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>Your Latest Content Publishes</CardHeader>
                <CardContent>
                  <ul>
                    <li>
                      <div>
                        <p>Title - Content Modal Name</p>
                        <p>User 1 edited 1/1/2021</p>
                      </div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </li>
                    <li>
                      <div>
                        <p>Title - Content Modal Name</p>
                        <p>User 1 edited 1/1/2021</p>
                      </div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </li>
                    <li>
                      <div>
                        <p>Title - Content Modal Name</p>
                        <p>User 1 edited 1/1/2021</p>
                      </div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>Instance Activity</CardHeader>
                <CardContent>
                  <div className={styles.WrapperActivity}>
                    <dl>
                      <h3>Last 30 days</h3>
                      <dt>You</dt>
                      <dd>20</dd>
                      <dt>Full Team</dt>
                      <dd>1034</dd>
                      <h3>All time</h3>
                      <dt>You</dt>
                      <dd>20</dd>
                      <dt>Full Team</dt>
                      <dd>1034</dd>
                    </dl>
                  </div>
                </CardContent>
              </Card>
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
