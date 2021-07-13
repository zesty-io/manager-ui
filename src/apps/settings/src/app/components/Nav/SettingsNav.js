import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import {
  faCog,
  faFont,
  faFolder,
  faPenFancy,
  faGlobe,
  faCode,
  faTextHeight,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";

import { Nav } from "@zesty-io/core/Nav";

import styles from "./SettingsNav.less";
export default connect((state) => {
  return {
    instanceNav: state.settings.catInstance,
    stylesNav: state.settings.catStyles,
    fontsNav: state.settings.catFonts,
  };
})(function SettingsNav(props) {
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);
  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);

  const tree = [
    {
      label: "WebEngine",
      children: props.instanceNav,
      path: "/settings/instance",
      icon: faGlobe,
    },
    {
      label: "Robots.txt",
      path: "/settings/robots",
      icon: faFileAlt,
    },
    {
      label: "Head Tags",
      path: "/settings/head",
      icon: faCode,
    },
  ];
  const treeAlt = [
    {
      label: "Styles",
      children: props.stylesNav,
      path: "/settings/styles",
      icon: faPenFancy,
    },

    {
      label: "Fonts",
      children: props.fontsNav,
      path: "/settings/fonts",
      icon: faFont,
    },
  ];
  return (
    <nav className={cx(styles.SettingsNav)} data-cy="SettingsNav">
      <h1 className={styles.NavTitle}>Instance Settings</h1>
      <div className={styles.ModelList}>
        <Nav
          className={styles.PageSets}
          id="settings"
          lightMode="true"
          name="settings"
          selected={selected}
          tree={tree}
        />
        <h1 className={styles.NavTitle}>WebEngine Styles &amp; Fonts</h1>
        <Nav
          className={styles.PageSets}
          id="settings"
          lightMode="true"
          name="settings"
          selected={selected}
          tree={treeAlt}
        />
      </div>
    </nav>
  );
});
