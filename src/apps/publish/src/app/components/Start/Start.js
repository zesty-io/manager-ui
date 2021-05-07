import React from "react";

import styles from "./Start.less";
export function Start(props) {
  return (
    <div className={styles.Start}>
      <h2 className={styles.display}>
        Get started adding items to this publish plan
      </h2>
      <ol className={styles.bodyText}>
        <li>Begin by searching for content you want to publish</li>
        <li>
          Selecting an item from the search list will add it to this publish
          plan
        </li>
        <li>
          Pressing the "Publish All" button will publish all the items listed in
          the plan
        </li>
      </ol>
      {/* <p></p> */}
    </div>
  );
}
