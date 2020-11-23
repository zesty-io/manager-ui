import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";

import styles from "./MediaSidebar.less";

export function MediaSidebar(props) {
  const [selected, setSelected] = useState(location.pathname);
  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);
  return (
    <nav className={styles.Nav}>
      <div className={styles.TopNav}>
        <form
          className={styles.searchForm}
          action=""
          style={{ margin: "auto", maxWidth: 300 }}
        >
          <input type="text" placeholder="Search Your Files" name="search2" />
          <button type="submit">
            <i className="fa fa-search" />
          </button>
        </form>

        <Button kind="secondary">
          <FontAwesomeIcon icon={faPlus} />
          <span>Create Group</span>
        </Button>
      </div>
      <Nav tree={props.nav} selected={selected} />
    </nav>
  );
}
