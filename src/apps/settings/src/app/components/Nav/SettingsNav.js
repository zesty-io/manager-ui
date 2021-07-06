import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import { faCog, faFont } from "@fortawesome/free-solid-svg-icons";
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
      label: "Instance",
      children: props.instanceNav,
      path: "/settings/instance",
      icon: faCog,
    },
    {
      label: "Styles",
      children: props.stylesNav,
      path: "/settings/styles",
      icon: faCog,
    },
    {
      label: "Fonts",
      children: props.fontsNav,
      path: "/settings/fonts",
      icon: faFont,
    },
    {
      label: "Robots.txt",
      path: "/settings/robots",
      icon: faCog,
    },
    {
      label: "Head Tags",
      path: "/settings/head",
      icon: faCog,
    },
  ];
  return (
    <nav className={cx(styles.SettingsNav)} data-cy="SettingsNav">
      <div className={styles.ModelList}>
        <Nav
          className={styles.PageSets}
          id="settings"
          name="settings"
          selected={selected}
          tree={tree}
        />
      </div>
    </nav>
  );
});
