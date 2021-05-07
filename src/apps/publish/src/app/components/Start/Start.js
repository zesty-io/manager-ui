import React from "react";

import styles from "./Start.less";
export function Start(props) {
  return (
    <div className={styles.Start}>
      <ol className={styles.display}>
        <li>Begin by searching for content you want to publish</li>
        <li>
          Select an item from the search list to add it to this publish plan
        </li>
        <li>
          Press the "Publish All" button to publish all the items listed in the
          plan
        </li>
      </ol>
    </div>
  );
}
