import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import ExternalLink from "@mui/material/Link";
import { fetchInstalledApps } from "shell/store/apps";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faMicrochip } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";
export default memo(function GlobalCustomApps(props) {
  const installedApps = useSelector((state) => state.apps.installed);
  const instanceZUID = useSelector((state) => state.instance.ZUID);
  const dispatch = useDispatch();
  const location = useLocation();
  const slug = location.pathname.split("/")[1];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchInstalledApps());
    setLoading(false);
  }, []);

  return (
    <menu
      className={cx(
        styles.CustomApps,
        props.openNav ? styles.OpenNav : styles.Collapse
      )}
    >
      {/* Hidden for soft launch

      <ExternalLink
        href={`${CONFIG.URL_MARKETPLACE}?instanceZUID=${instanceZUID}`}
        key="marketplace"
        rel="noopener noreferrer"
        target="_blank"
        className={cx(styles.control)}
      >
        <FontAwesomeIcon icon={faMicrochip} />
        <span className={styles.title}>Custom Apps</span>
      </ExternalLink>
      */}

      {installedApps.map((app) => {
        return (
          <Link
            key={app.ZUID}
            className={cx(
              styles.control,
              slug === app.name ? styles.current : null
            )}
            to={`/app/${app.ZUID}`}
            title={`${app.label}`}
          >
            <FontAwesomeIcon icon={faFileAlt} />
            <span className={styles.title}>{app.label}</span>
          </Link>
        );
      })}
    </menu>
  );
});
