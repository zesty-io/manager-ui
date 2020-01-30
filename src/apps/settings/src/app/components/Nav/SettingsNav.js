import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
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
  const [selected, setSelected] = useState(window.location.hash);
  const [navName, setNavName] = useState(
    window.location.hash.split("/")[2] || "instance"
  );

  const handleHashChange = () => {
    setNavName(window.location.hash.split("/")[2]);
    if (window.location.hash !== selected) {
      setSelected(window.location.hash);
    }
  };

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <nav className={cx("SchemaNav", styles.SchemaNav)}>
      <div className={styles.ModelList}>
        <Nav
          className={styles.PageSets}
          id="settings"
          name="settings"
          selected={selected}
          tree={navName && props[`${navName}Nav`] ? props[`${navName}Nav`] : []}
        />
      </div>
    </nav>
  );
});
