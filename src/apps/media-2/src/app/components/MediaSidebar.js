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
        <form className={styles.SearchForm} action="">
          <input type="text" placeholder="Search Your Files" name="search2" />
          <button type="submit">
            <i className="fa fa-search" />
          </button>
        </form>

        <Button kind="secondary" className={styles.CreateGroup}>
          <FontAwesomeIcon icon={faPlus} />
          <span>Create Group</span>
        </Button>
      </div>
      <Nav tree={props.nav} selected={selected} />
    </nav>
  );
}
