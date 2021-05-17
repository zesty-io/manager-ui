import React from "react";
import GlobalSearch from "shell/components/global-search";
import GlobalAccount from "shell/components/global-account";
import GlobalInstance from "shell/components/global-instance";
import GlobalTabs from "shell/components/global-tabs";
import { GlobalNotifications } from "shell/components/global-notifications";

import styles from "./GlobalTopbar.less";

export function GlobalTopbar() {
  return (
    <section className={styles.GlobalTopBar}>
      <div className={styles.InstanceSearch}>
        <GlobalSearch />
      </div>
      <div className={styles.InstanceTabs}>
        <GlobalTabs />
        <GlobalInstance />
        <GlobalNotifications />
        <GlobalAccount />
      </div>
    </section>
  );
}
