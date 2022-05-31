import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import styles from "./Metrics.less";

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const floatWithCommas = (x) => {
  x = x.toFixed(2);
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const TopReq = ({ req, path }) => {
  if (req == undefined) return null;

  const fullPath = req.FullPath;

  const requests = numberWithCommas(req.RequestCount);
  const throughput = floatWithCommas(req.DataThroughputInGB) + "GB";

  return (
    <tr className={cx(styles.MetricsTableRow)}>
      <td className={cx(styles.MetricsTableRowCell)}>
        <Url href={fullPath} target="_blank" title="Redirect URL">
          <FontAwesomeIcon icon={faExternalLinkAlt} />
          &nbsp;<code>{path}</code>
        </Url>
      </td>
      <td className={cx(styles.MetricsTableRowCell)}>{requests}</td>
      <td className={cx(styles.MetricsTableRowCell)}>{throughput}</td>
    </tr>
  );
};

export default TopReq;
