import React from "react";

import styles from "./Completed.less";
export function Completed(props) {
  return (
    <div className={styles.Completed}>
      <ol className={styles.display}>
        <li>Successfully published all items</li>
      </ol>
    </div>
  );
}
