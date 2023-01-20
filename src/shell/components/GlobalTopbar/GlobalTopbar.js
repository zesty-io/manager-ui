import GlobalSearch from "shell/components/global-search";
import GlobalAccount from "shell/components/global-account";
import GlobalInstance from "shell/components/global-instance";
import GlobalTabs from "shell/components/global-tabs";
import { GlobalNotifications } from "shell/components/global-notifications";

import styles from "./GlobalTopbar.less";
import { theme } from "@zesty-io/material";

const globalTopBarThemeStyles = {
  backgroundColor: theme.palette.grey[900],
  boxShadow: `0px 0px 3px ${theme.palette.grey[900]}`,
};

export function GlobalTopbar() {
  return (
    <section className={styles.GlobalTopbar} style={globalTopBarThemeStyles}>
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
