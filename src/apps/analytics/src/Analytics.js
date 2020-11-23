import React from "react";
import { connect } from "react-redux";
import cx from "classnames";
import moment from "moment";

import { Url } from "@zesty-io/core/Url";

// import { ContentVelocity } from "./components/ContentVelocity";
import { PageviewTraffic } from "./components/PageviewTraffic";
import { InboundTraffic } from "./components/InboundTraffic";
import { SocialTraffic } from "./components/SocialTraffic";
import { TopPerforming } from "./components/TopPerforming";
import { RecentlyEdited } from "./components/RecentlyEdited";
import { GoogleAuthOverlay } from "./components/GoogleAuthOverlay";

import { fetchRecentItems } from "shell/store/user";

import shelldata from "./shelldata";

import styles from "./Analytics.less";

export default connect(function(state) {
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
  class Analytics extends React.PureComponent {
    state = {
      recentlyEditedItems: [],
      favoriteModels: [],
      loading: true,
      webEngineOn: true, // in the future this will be a boolean pulled off the account, it will change the dash
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
      const domainSet = Boolean(
        this.props.instance.domains &&
          this.props.instance.domains[0] &&
          this.props.instance.domains[0].domain
      );
      return (
        <section className={styles.Dashboard}>
          <div className={styles.container}>
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
                  domainSet={domainSet}
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
                  domainSet={domainSet}
                />
              </div>

              <div className={styles.column}>
                <InboundTraffic
                  setGALegacyStatus={this.setGALegacyStatus}
                  instanceZUID={this.props.instanceZUID}
                  profileID={this.props.instance.google_profile_id}
                  data={shelldata.shellDoughnutData()}
                  domainSet={domainSet}
                />
                <SocialTraffic
                  setGALegacyStatus={this.setGALegacyStatus}
                  instanceZUID={this.props.instanceZUID}
                  profileID={this.props.instance.google_profile_id}
                  data={shelldata.shellDoughnutData()}
                  domainSet={domainSet}
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
