import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import cx from "classnames";

import { Nav } from "@zesty-io/core/Nav";

import styles from "./SettingsNav.less";
export default connect(state => {
  return {
    instanceNav: state.settings.catInstance,
    stylesNav: state.settings.catStyles,
    fontsNav: state.settings.catFonts
  };
})(function SettingsNav(props) {
  const location = useLocation();
  const [selected, setSelected] = useState(location.pathname);
  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);
  console.log(selected);

  const tree = [
    { label: "Instance", children: props.instanceNav },
    { label: "Styles", children: props.stylesNav },
    { label: "Fonts", children: props.fontsNav }
  ];
  return (
    <nav className={cx(styles.SettingsNav)}>
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
