import cx from "classnames";

import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

import styles from "./ImportTableRowDisabled.less";

export default function ImportTableRowDisabled({
  path,
  code,
  target,
  query_string,
  created,
}) {
  return (
    <div className={styles.ImportTableRowDisabled}>
      <span className={styles.RowCell}>{path}</span>
      <span className={styles.RedirectCreatorCell}>
        <ToggleButtonGroup color="secondary" value={code} size="small" disabled>
          <ToggleButton value={302}>302</ToggleButton>
          <ToggleButton value={301}>301</ToggleButton>
        </ToggleButtonGroup>
      </span>
      <span className={styles.RowCell}>
        {target}
        {query_string ? `?${query_string}` : null}
      </span>
      <span className={cx(styles.RowCell, styles.RowCellEnd)}>
        {created ? <span>Created</span> : <span>Pre-Existing</span>}
      </span>
    </div>
  );
}
