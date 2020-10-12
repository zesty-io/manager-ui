import React from "react";
import { connect } from "react-redux";
import styles from "./GlobalSidebar.less";

import Favicon from "shell/components/favicon";
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
        <Favicon />
        <GlobalMenu />
        <GlobalActions />
      </div>
    </aside>
  );
});
