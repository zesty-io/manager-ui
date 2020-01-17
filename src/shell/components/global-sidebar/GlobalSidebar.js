import React from "react";
import styles from "./GlobalSidebar.less";

import GlobalAccount from "shell/components/global-account";
import GlobalAccountMenu from "shell/components/global-account-menu";
import GlobalMenu from "shell/components/global-menu";
import GlobalActions from "shell/components/global-actions";

export default function GlobalSidebar(props) {
  return (
    <aside className={styles.GlobalSidebar}>
      <div className={styles.topMenu}>
        <GlobalAccount />
        <GlobalMenu />
        <GlobalActions />
      </div>
      <GlobalAccountMenu accountsMenuVisible={false} />
    </aside>
  );
}
