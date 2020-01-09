import React, { Component } from "react";
import styles from "./GlobalSidebar.less";
import cx from "classnames";

import GlobalAccount from "shell/components/global-account";
import GlobalAccountMenu from "shell/components/global-account-menu";
import GlobalMenu from "shell/components/global-menu";
import GlobalActions from "shell/components/global-actions";

export default function GlobalSidebar(props) {
  return (
    <aside className={styles.GlobalSidebar}>
      <div className={styles.topMenu}>
        <GlobalAccount dispatch={props.dispatch} />

        <GlobalMenu
          dispatch={props.dispatch}
          products={props.site.settings.products}
        />
        <GlobalActions />
      </div>
      <GlobalAccountMenu
        dispatch={props.dispatch}
        accountsMenuVisible={props.accountsMenuVisible}
      />
    </aside>
  );
}
