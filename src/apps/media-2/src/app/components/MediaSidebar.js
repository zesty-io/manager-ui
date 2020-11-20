import React from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faFolderOpen,
  faPlus
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import styles from "./MediaSidebar.less";

export function MediaSidebar() {
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
      {/* PULLING FROM DESIGN-SYSTEM NODE */}
      <article className="Parent">
        {/* <h1 className={styles.NavTitle}>Company Title</h1> */}
        <ul>
          <li className={cx(styles.item, styles.depth1)}>
            <a href="#">
              <FontAwesomeIcon icon={faFolderOpen} />
              <span>Group 1</span>
            </a>
          </li>
          <li className={cx(styles.item, styles.depth2)}>
            <a href="#">
              <FontAwesomeIcon icon={faFolder} />
              <span>Group 2</span>
            </a>
          </li>
          <li className={cx(styles.item, styles.depth3)}>
            <a href="#">
              <FontAwesomeIcon icon={faFolder} />
              <span>Group 3</span>
            </a>
          </li>
        </ul>
      </article>
    </nav>
  );
}
