import React from "react";
import { ToggleButton } from "@zesty-io/core/ToggleButton";

import styles from "./ImportTableRowDisabled.less";

export default function ImportTableRowDisabled({
  path,
  code,
  target,
  query_string,
  created
}) {
  return (
    <div className={styles.ImportTableRowDisabled}>
      <span className={styles.RowCell} style={{ flex: "1" }}>
        {path}
      </span>
      <span className={styles.RedirectCreatorCell}>
        <ToggleButton
          className={styles.code}
          name="redirectType"
          value={code}
          offValue="302"
          onValue="301"
        />
      </span>
      <span className={styles.RowCell} style={{ flex: "1" }}>
        {target}
        {query_string ? `?${query_string}` : null}
      </span>
      <span className={styles.RowCell}>
        {created ? <span>Created</span> : <span>Pre-Existing</span>}
      </span>
    </div>
  );
}
