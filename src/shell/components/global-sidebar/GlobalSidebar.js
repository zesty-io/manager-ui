import React from "react";
import { connect } from "react-redux";
import styles from "./GlobalSidebar.less";

import GlobalAccount from "shell/components/global-account";
import GlobalHelpMenu from "shell/components/GlobalHelpMenu";
import GlobalMenu from "shell/components/global-menu";
import GlobalActions from "shell/components/global-actions";

export default connect(state => {
  return {
    ui: state.ui
  };
})(function GlobalSidebar(props) {
  return (
    <aside className={styles.GlobalSidebar}>
      <div className={styles.topMenu}>
        <GlobalAccount />
        <GlobalMenu />
        <GlobalActions />
      </div>

      {props.ui.helpMenuVisible && <GlobalHelpMenu />}
    </aside>
  );
});
