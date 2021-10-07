import { memo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faMicrochip } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";
export default memo(function GlobalCustomApps(props) {
  const apps = useSelector((state) => state.apps);
  const location = useLocation();
  const slug = location.pathname.split("/")[1];

  return (
    <menu
      className={cx(
        styles.CustomApps,
        props.openNav ? styles.OpenNav : styles.Collapse
      )}
    >
      <Link to="/apps">
        <FontAwesomeIcon icon={faMicrochip} />
        <span className={styles.title}>Custom Apps</span>
      </Link>

      {apps.installed.map((app) => {
        return (
          <Link
            key={app.zuid}
            className={cx(
              styles.control,
              slug === app.name ? styles.current : null
            )}
            to={`/app/${app.zuid}`}
            title={`${app.name}`}
          >
            <FontAwesomeIcon icon={faFileAlt} />
            <span className={styles.title}>{app.name}</span>
          </Link>
        );
      })}
    </menu>
  );
});
