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
import GlobalCustomApps from "shell/components/global-custom-apps";
import GlobalActions from "shell/components/global-actions";

import { theme } from "@zesty-io/material";

const globalSideBarThemeStyles = {
  backgroundColor: theme.palette.grey[900],
};

export default connect((state) => {
  return {
    ui: state.ui,
    instance: state.instance,
  };
})(function GlobalSidebar(props) {
  return (
    <aside className={styles.GlobalSidebar} style={globalSideBarThemeStyles}>
      <div
        className={cx(
          styles.topMenu,
          props.ui.openNav ? styles.OpenTopMenu : null
        )}
      >
        <Favicon />
        <GlobalMenu openNav={props.ui.openNav} />
        <GlobalCustomApps openNav={props.ui.openNav} />
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
