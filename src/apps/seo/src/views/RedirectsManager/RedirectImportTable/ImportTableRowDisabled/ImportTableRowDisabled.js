// import React from 'react'
import styles from "./ImportTableRowDisabled.less";

export default function ImportTableRowDisabled({
  path,
  code,
  target,
  query_string
}) {
  return (
    <div className={styles.ImportTableRowDisabled}>
      <span className={styles.RowCell} style={{ flex: "1" }}>
        {path}
      </span>
      <span className={styles.RowCell}>
        <Toggle className={styles.code}>
          <ToggleOption value="301" selected={code == "301" ? "true" : ""}>
            301
          </ToggleOption>
          <ToggleOption value="302" selected={code == "302" ? "true" : ""}>
            302
          </ToggleOption>
        </Toggle>
      </span>
      <span className={styles.RowCell} style={{ flex: "1" }}>
        {target}
        {query_string ? `?${query_string}` : null}
      </span>
      <span className={styles.RowCell}>
        <span>Pre-Existing</span>
      </span>
    </div>
  );
}
