import { useEffect, useState } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import moment from "moment";
import { useDomain } from "shell/hooks/use-domain";

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

export default connect(function (state) {
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
    }, {}),
  };
})(function Analytics(props) {
  const [recentlyEditedItems, setRecentlyEditedItems] = useState([]);
  const [favoriteModels, setFavoriteModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [webEngineOn, setWebEngineOn] = useState(true);
  const [gaAuthenticated, setGaAuthenticated] = useState(
    Boolean(props.instance.google_profile_id)
  );
  const [gaLegacyAuth, setGaLegacyAuth] = useState(false);

  const domainSet = useDomain();

  const setGALegacyStatus = (status) => {
    setGaLegacyAuth(status);
  };
  /**
    Group items by model
    [
      [contentModelZUID, [item, item, ...]]
    ]
  **/
  const getFavoriteModels = (items) => {
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
  };

  const getLastEditedItems = (items) => {
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
  };

  useEffect(() => {
    const start = moment().subtract(120, "days").format("YYYY-MM-DD");

    props.dispatch(fetchRecentItems(props.user.ZUID, start)).then((res) => {
      if (res && res.data) {
        setRecentlyEditedItems(getLastEditedItems(res.data));
        setFavoriteModels(getFavoriteModels(res.data));
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, []);

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
          {(!gaAuthenticated || gaLegacyAuth) && (
            <GoogleAuthOverlay
              gaLegacyAuth={gaLegacyAuth}
              domainSet={domainSet}
              gaAuthenticated={gaAuthenticated}
              user={props.user}
              instance={props.instance}
            />
          )}
          {/* TODO add Google Auth Modal here */}
          <div className={cx(styles.column, styles.primary)}>
            <PageviewTraffic
              setGALegacyStatus={setGALegacyStatus}
              instanceZUID={props.instanceZUID}
              profileID={props.instance.google_profile_id}
              data={shelldata.shellBarData()}
              domainSet={domainSet}
            />
          </div>

          <div className={styles.column}>
            <InboundTraffic
              setGALegacyStatus={setGALegacyStatus}
              instanceZUID={props.instanceZUID}
              profileID={props.instance.google_profile_id}
              data={shelldata.shellDoughnutData()}
              domainSet={domainSet}
            />
            <SocialTraffic
              setGALegacyStatus={setGALegacyStatus}
              instanceZUID={props.instanceZUID}
              profileID={props.instance.google_profile_id}
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
            <RecentlyEdited items={recentlyEditedItems} loading={loading} />
          </div>
          <div className={cx(styles.column, styles.recent)}>
            <TopPerforming
              instanceZUID={props.instanceZUID}
              profileID={props.instance.google_profile_id}
            />
          </div>
        </div>
      </div>
    </section>
  );
});
