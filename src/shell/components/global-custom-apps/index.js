import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import ExternalLink from "@mui/material/Link";
import { fetchInstalledApps } from "shell/store/apps";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug } from "@fortawesome/free-solid-svg-icons";
import ExtensionIcon from "@mui/icons-material/Extension";
import { ListItemIcon, ListItem, Typography } from "@mui/material";

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
      <ExternalLink
        href={`${CONFIG.URL_MARKETPLACE}?instanceZUID=${instanceZUID}`}
        key="marketplace"
        rel="noopener noreferrer"
        target="_blank"
        // className={cx(styles.control)}
      >
        <ListItem
          sx={{
            px: "10px",
            mb: "10px",
            height: "36px",
            borderRadius: "4px",
          }}
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <ExtensionIcon
              sx={{
                color: slug === "Marketplace" ? "primary.main" : "grey.500",
              }}
            />
          </ListItemIcon>
          {props.openNav && (
            <Typography
              variant="body2"
              sx={{
                color: slug === "Marketplace" ? "common.white" : "grey.500",
              }}
            >
              Marketplace
            </Typography>
          )}
        </ListItem>
      </ExternalLink>

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
            <FontAwesomeIcon icon={faPlug} />
            <span className={styles.title}>{app.label}</span>
          </Link>
        );
      })}
    </menu>
  );
});
