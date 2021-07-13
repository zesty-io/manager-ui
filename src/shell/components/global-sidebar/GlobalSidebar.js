import React from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import styles from "./GlobalSidebar.less";

import Favicon from "shell/components/favicon";
import GlobalMenu from "shell/components/global-menu";
import GlobalActions from "shell/components/global-actions";

export default connect((state) => {
  return {
    ui: state.ui,
    instance: state.instance,
  };
})(function GlobalSidebar(props) {
  return (
    <aside className={styles.GlobalSidebar}>
      <div
        className={cx(
          styles.topMenu,
          props.ui.openNav ? styles.OpenTopMenu : null
        )}
      >
        <Favicon />
        <GlobalMenu openNav={props.ui.openNav} />
        <GlobalActions hash={props.instance.randomHashID} />
        {props.openNav ? (
          <p
            className={cx(styles.Collapse, styles.Open)}
            onClick={props.onClick}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            <span>Collapse</span>
          </p>
        ) : (
          <p className={styles.Collapse} onClick={props.onClick}>
            <FontAwesomeIcon icon={faChevronRight} />
          </p>
        )}
      </div>
    </aside>
  );
});
