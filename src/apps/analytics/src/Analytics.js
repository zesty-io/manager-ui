import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import cx from "classnames";
import moment from "moment";

import { PageviewTraffic } from "./components/PageviewTraffic";
import { InboundTraffic } from "./components/InboundTraffic";
import { SocialTraffic } from "./components/SocialTraffic";
import { TopPerforming } from "./components/TopPerforming";
import { RecentlyEdited } from "./components/RecentlyEdited";
import { GoogleAuthOverlay } from "./components/GoogleAuthOverlay";

import { fetchRecentItems } from "shell/store/user";

import shelldata from "./shelldata";

import styles from "./Analytics.less";

export default React.memo(function Analytics() {
  const [recentlyEditedItems, setRecentlyEditedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gaLegacyAuth, setGaLegacyAuth] = useState(false); // we need response body from cloud function could change this
  const user = useSelector(state => state.user);
  const instance = useSelector(state => state.instance);
  const instanceZUID = instance.ZUID;

  const gaAuthenticated = Boolean(instance.google_profile_id);

  const getLastEditedItems = items => {
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

  const domainSet = Boolean(
    instance.domains && instance.domains[0] && instance.domains[0].domain
  );

  useEffect(() => {
    const start = moment()
      .subtract(120, "days")
      .format("YYYY-MM-DD");

    dispatch(fetchRecentItems(user.ZUID, start)).then(res => {
      if (res && res.data) {
        setRecentlyEditedItems(getLastEditedItems(res.data));
      }
      setLoading(false);
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
              user={user}
              instance={instance}
            />
          )}
          {/* TODO add Google Auth Modal here */}
          <div className={cx(styles.column, styles.primary)}>
            <PageviewTraffic
              setGALegacyStatus={setGaLegacyAuth}
              instanceZUID={instanceZUID}
              profileID={instance.google_profile_id}
              data={shelldata.shellBarData()}
              domainSet={domainSet}
            />
          </div>

          <div className={styles.column}>
            <InboundTraffic
              setGALegacyStatus={setGaLegacyAuth}
              instanceZUID={instanceZUID}
              profileID={instance.google_profile_id}
              data={shelldata.shellDoughnutData()}
              domainSet={domainSet}
            />
            <SocialTraffic
              setGALegacyStatus={setGaLegacyAuth}
              instanceZUID={instanceZUID}
              profileID={instance.google_profile_id}
              data={shelldata.shellDoughnutData()}
              domainSet={domainSet}
            />
          </div>
        </div>

        <div className={styles.columns}>
          <div className={cx(styles.column)}>
            <RecentlyEdited items={recentlyEditedItems} loading={loading} />
          </div>
          <div className={cx(styles.column, styles.recent)}>
            <TopPerforming
              instanceZUID={instanceZUID}
              profileID={instance.google_profile_id}
            />
          </div>
        </div>
      </div>
    </section>
  );
});
