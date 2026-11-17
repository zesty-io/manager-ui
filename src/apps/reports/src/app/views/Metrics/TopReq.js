import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import Link from "@mui/material/Link";

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
    <tr>
      <td>
        <Link
          data-cy="metrics-path-link"
          underline="none"
          color="secondary"
          href={fullPath}
          target="_blank"
          title="Redirect URL"
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} />
          &nbsp;<code>{path}</code>
        </Link>
      </td>
      <td>{requests}</td>
      <td>{throughput}</td>
    </tr>
  );
};

export default TopReq;
