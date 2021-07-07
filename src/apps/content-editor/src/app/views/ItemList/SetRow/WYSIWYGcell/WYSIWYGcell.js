import { memo } from "react";
import cx from "classnames";

import styles from "./WYSIWYGcell.less";
export const WYSIWYGcell = memo(function WYSIWYGcell(props) {
  const rawData = props.value;
  let elementFromData = document.createElement("div");
  elementFromData.innerHTML = rawData;
  const strippedData = elementFromData.textContent || elementFromData.innerText;
  return (
    <span className={cx(props.className, styles.WYSIWYGcell)}>
      {strippedData.replace(/<[^>]*>/g, "").slice(0, 120) || ""}
      {props.value && props.value.length > 200 && "…"}
    </span>
  );
});
