import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import idb from "utility/idb";
import cx from "classnames";

import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faCog,
  faDatabase,
  faEdit,
  faFile,
  faFolder,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import GlobalSearch from "shell/components/global-search";
import GlobalAccount from "shell/components/global-account";
import GlobalInstance from "shell/components/global-instance";
import { GlobalNotifications } from "shell/components/global-notifications";

import styles from "./GlobalTabs.less";

const ZUID_REGEX = /[a-zA-Z0-9]{1,5}-[a-zA-Z0-9]{6,10}-[a-zA-Z0-9]{5,35}/;

function toCapitalCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function parse(path) {
  let parts = path.split("/").filter(part => part);
  let zuid = null;
  let prefix = null;
  let contentSection = null;

  if (parts.length > 1) {
    if (
      parts[parts.length - 1] === "head" ||
      parts[parts.length - 1] === "meta"
    ) {
      contentSection = parts.pop();
    }
    if (ZUID_REGEX.test(parts[parts.length - 1])) {
      zuid = parts.pop();
    }
  }

  if (zuid) {
    prefix = zuid.split("-")[0];
  }

  return [parts, zuid, prefix, contentSection];
}

export default connect(state => {
  return {
    instanceName: state.instance.name,
    instanceZUID: state.instance.ZUID,
    fields: state.fields,
    models: state.models,
    content: state.content,
    files: state.files,
    user: state.user,
    mediaGroups: state.media.groups,
    mediaFiles: state.media.files,
    mediaSearchFiles: state.media.search.files
  };
})(
  React.memo(function GlobalTabs(props) {
    let history = useHistory();

    const [routes, setRoutes] = useState([]);
    const [ZUID, setZUID] = useState("");

    // Load prev session routes
    useEffect(() => {
      idb.get(`${props.instanceZUID}:session:routes`).then(storedRoutes => {
        if (Array.isArray(storedRoutes) && storedRoutes.length) {
          setRoutes(storedRoutes);

          // On initial render if user is entering at the app root
          // Load their last session resource route
          if (history.location.pathname === "/") {
            history.push(storedRoutes[0].pathname);
          }
        }
      });
    }, [props.instanceZUID]);

    // Track route changes to display quick links
    useEffect(() => {
      let newRoutes = [...routes];
      const [parts, zuid, prefix, contentSection] = parse(
        history.location.pathname
      );
      // don't show root
      if (parts.length === 0) {
        return;
      }
      // don't show global tab for top level section
      if (parts.length === 1 && !zuid) {
        return;
      }
      // don't show global tab for content head/meta sections
      if (contentSection) {
        return;
      }
      // don't show global tab for settings first level section (except robots, styles)
      if (
        parts.length === 2 &&
        parts[0] === "settings" &&
        parts[1] !== "robots" &&
        parts[1] !== "styles"
      ) {
        return;
      }

      // don't show tertiary style tabs
      if (
        parts.length === 3 &&
        parts[0] === "settings" &&
        parts[1] === "styles"
      ) {
        return;
      }

      let existingIndex = newRoutes.findIndex(
        route => route.pathname === history.location.pathname
      );

      if (existingIndex === -1) {
        newRoutes = [history.location, ...newRoutes];
      } else {
        newRoutes.splice(existingIndex, 1);
        newRoutes = [history.location, ...newRoutes];
      }

      // Maximum of 20 route records
      newRoutes = newRoutes.slice(0, 20);

      // Lookup route resource to get a friendly display name
      // Last zuid in path part is the resource being viewed
      newRoutes.forEach(route => {
        const [parts, zuid, prefix] = parse(route.pathname);

        // resolve ZUID from store to determine display information
        switch (prefix) {
          case "1":
          case "2":
            const group = props.mediaGroups[zuid];
            if (group) {
              route.name = group.name;
            }
            route.icon = faFolder;
            break;
          case "3":
            const file =
              props.mediaFiles.find(file => file.id === zuid) ||
              props.mediaSearchFiles.find(file => file.id === zuid);
            if (file) {
              route.name = file.filename;
            }
            route.icon = faFile;
            break;
          case "6":
            if (props.models) {
              const model = props.models[zuid];

              if (model) {
                route.name = model.label;
              }
            }
            route.icon = faDatabase;
            break;
          case "12":
            if (props.fields) {
              const field = props.fields[zuid];

              if (field) {
                route.name = "Field: " + field.label;
              }
            }
            route.icon = faDatabase;
            break;

          case "7":
            if (props.content) {
              const item = props.content[zuid];
              if (item && item.web) {
                route.name =
                  item.web.metaTitle ||
                  item.web.metaLinkText ||
                  item.web.pathPart;
              }
            }
            route.icon = faEdit;
            break;
          case "10":
          case "11":
            if (props.files) {
              const selectedFile = props.files.find(file => file.ZUID === zuid);
              if (selectedFile) {
                route.name = selectedFile.fileName;
              }
            }
            route.icon = faCode;
            break;
          case "17":
            break;
        }
        if (parts[0] === "settings") {
          route.icon = faCog;
          if (parts[2]) {
            if (parts[1] === "instance") {
              route.name =
                parts[2]
                  .replace("-", " ")
                  .replace("_", " ")
                  .split(" ")
                  .map(toCapitalCase)
                  .join(" ") + " Settings";
            } else if (parts[1] === "fonts") {
              route.name = toCapitalCase(parts[2]) + " Fonts";
            } else {
              route.name = toCapitalCase(parts[1]) + " Settings";
            }
          } else if (parts[1] === "styles") {
            route.name = toCapitalCase(parts[1]) + " Settings";
          }
        }
      });

      // store routes to local storage and reload on app start
      idb.set(`${props.instanceZUID}:session:routes`, newRoutes);
      setRoutes(newRoutes);
    }, [history.location, props.models, props.content, props.files, props.mediaGroups, props.mediaFiles, props.mediaSearchFiles]);

    // Update Breadcrumb
    useEffect(() => {
      const [, zuid, prefix] = parse(history.location.pathname);

      // breadcrumbs only exist for content items
      if (prefix === "7" || prefix === "6" || prefix === "17") {
        setZUID(zuid);
      } else {
        setZUID("");
      }
    }, [history.location]);

    const removeRoute = path => {
      const newRoutes = routes.filter(route => route.pathname !== path);

      // store routes to local storage and reload on app start
      set(`${props.instanceZUID}:session:routes`, newRoutes);
      setRoutes(newRoutes);
    };

    return (
      <section className={styles.GlobalTopBar}>
        <div className={styles.InstanceSearch}>
          <GlobalSearch />
        </div>

        <div className={styles.InstanceTabs}>
          {/* NOTE: Location/Design needs work */}
          {/* <Button
            className={styles.CloseAll}
            title="Close all open tabs"
            onClick={() => setRoutes([])}
          >
            <FontAwesomeIcon icon={faTimesCircle} />
          </Button> */}
          <nav className={styles.QuickLinks}>
            <ol className={styles.Links}>
              {routes.map((route, i) => (
                <li
                  key={i}
                  className={cx(
                    styles.Route,
                    route.pathname === history.location.pathname
                      ? styles.active
                      : null
                  )}
                >
                  <AppLink to={`${route.pathname}${route.search}`}>
                    {route.icon && <FontAwesomeIcon icon={route.icon} />}
                    &nbsp;
                    {route.name ? route.name : `${route.pathname.slice(1)}`}
                  </AppLink>
                  <span
                    className={styles.Close}
                    onClick={() => removeRoute(route.pathname)}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </span>
                </li>
              ))}
            </ol>
          </nav>
          <GlobalInstance />
          <GlobalNotifications />
          <GlobalAccount />
        </div>
      </section>
    );
  })
);
