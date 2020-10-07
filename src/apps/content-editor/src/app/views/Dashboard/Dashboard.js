import React from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";

// import { ContentVelocity } from "./components/ContentVelocity";
import { PageviewTraffic } from "./components/PageviewTraffic";
import { InboundTraffic } from "./components/InboundTraffic";
import { SocialTraffic } from "./components/SocialTraffic";
import { TopPerforming } from "./components/TopPerforming";
import { RecentlyEdited } from "./components/RecentlyEdited";
import { GoogleAuthOverlay } from "./components/GoogleAuthOverlay";

import shelldata from "./shelldata";
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
          <div className={styles.topBar}>
            <div className={styles.columns}>
              <div className={styles.column}>
                <span className={styles.instanceName}>
                  Content Instance Dashboard
                </span>
              </div>
              <div className={`${styles.column} ${styles.isAlignedRight}`}>
                <strong>{this.props.instanceName}</strong>{" "}
                <span className={styles.muted}>
                  [{this.props.instanceZUID}]
                </span>
              </div>
              {/* <div className={`${styles.column} ${styles.isAlignedRight}`}>
                <div className={styles.webEngineLinks}>
                  Web Engine URLs
                  <span className={styles.encompassedBlock}>
                    <Url
                      target="_blank"
                      href={this.props.instance.preview_domain}
                    >
                      Stage
                    </Url>

                    <Url
                      target="_blank"
                      href={`https://${this.props.instance.live_domain}`}
                    >
                      Live
                    </Url>
                  </span>
                </div>
              </div> */}
            </div>
          </div>
          <div className={styles.container}>
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
                    <CardFooter>
                      <Button
                        kind="save"
                        onClick={() =>
                          (window.location.hash = `/content/${contentModelZUID}/new`)
                        }
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        New {model && model.label}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div
              className={cx(
                styles.columns,
                styles.graphs,
                styles.analyticsContainer
              )}
            >
              {(!this.state.gaAuthenticated || this.state.gaLegacyAuth) && (
                <GoogleAuthOverlay
                  gaLegacyAuth={this.state.gaLegacyAuth}
                  domainSet={this.state.domainSet}
                  gaAuthenticated={this.state.gaAuthenticated}
                  user={this.props.user}
                  instance={this.props.instance}
                />
              )}
              {/* TODO add Google Auth Modal here */}
              <div className={cx(styles.column, styles.primary)}>
                <PageviewTraffic
                  setGALegacyStatus={this.setGALegacyStatus}
                  instanceZUID={this.props.instanceZUID}
                  profileID={this.props.instance.google_profile_id}
                  data={shelldata.shellBarData()}
                  domainSet={this.state.domainSet}
                />
              </div>

              <div className={styles.column}>
                <InboundTraffic
                  setGALegacyStatus={this.setGALegacyStatus}
                  instanceZUID={this.props.instanceZUID}
                  profileID={this.props.instance.google_profile_id}
                  data={shelldata.shellDoughnutData()}
                  domainSet={this.state.domainSet}
                />
                <SocialTraffic
                  setGALegacyStatus={this.setGALegacyStatus}
                  instanceZUID={this.props.instanceZUID}
                  profileID={this.props.instance.google_profile_id}
                  data={shelldata.shellDoughnutData()}
                  domainSet={this.state.domainSet}
                />
              </div>
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
