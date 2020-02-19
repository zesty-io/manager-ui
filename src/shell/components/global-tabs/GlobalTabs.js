import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { get, set } from "idb-keyval";

import { AppLink } from "@zesty-io/core/AppLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faShareAlt,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import GlobalSearch from "shell/components/global-search";

import styles from "./GlobalTabs.less";
export default connect(state => {
  return {
    instanceZUID: state.instance.zuid,
    models: state.models,
    content: state.content,
    files: state.files
  };
})(
  React.memo(function GlobalTabs(props) {
    let history = useHistory();
    const [routes, setRoutes] = useState([]);

    // Load prev session routes
    useEffect(() => {
      get(`${props.instanceZUID}:session:routes`).then(storedRoutes => {
        if (Array.isArray(storedRoutes) && storedRoutes.length) {
          setRoutes(storedRoutes);

          // On initial render if user is entering at the app root
          // Load their last session resource route
          if (history.location.pathname === "/") {
            history.push(storedRoutes[0].pathname);
          }
        }
      });
    }, []);

    // Track route changes to display quick links
    useEffect(() => {
      const parts = history.location.pathname.split("/").filter(part => part);
      if (parts.length >= 2) {
        let newRoutes = [...routes];
        let exists = newRoutes.find(
          route => route.pathname === history.location.pathname
        );
        if (!exists) {
          newRoutes = [history.location, ...newRoutes];
        }

        // Maximum of 20 route records
        newRoutes = newRoutes.slice(0, 20);

        // Lookup route resource to get a friendly display name
        // Last zuid in path part is the resource being viewed
        newRoutes.forEach(route => {
          const routePathParts = route.pathname.split("/").filter(part => part);
          const zuid = routePathParts.pop();
          const prefix = zuid.charAt(0);

          // resolve ZUID from store to determine display information
          switch (prefix) {
            case "6":
              if (props.models) {
                const model = props.models[zuid];

                if (model) {
                  route.name = model.label;
                }
              }
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
            case "10":
            case "11":
              if (props.files) {
                // const file = props.files[zuid];
                console.log("// TODO lookup file names");
              }
          }
        });

        // store routes to local storage and reload on app start
        set(`${props.instanceZUID}:session:routes`, newRoutes);
        setRoutes(newRoutes);
      }
    }, [history.location]);

    const removeRoute = path => {
      const newRoutes = routes.filter(route => route.pathname !== path);

      // store routes to local storage and reload on app start
      set(`${props.instanceZUID}:session:routes`, newRoutes);
      setRoutes(newRoutes);

      // jump to the first route in our list after
      if (newRoutes.length) {
        history.push(newRoutes[0].pathname);
      }
    };

    return (
      <section className={styles.GlobalTabs}>
        <GlobalSearch className={styles.GlobalSearch} />
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
          <ol className={styles.BreadCrumbs}>
            <li>
              <FontAwesomeIcon icon={faShareAlt} />
            </li>
            <li>
              <AppLink to={`/`}>Crumb 1</AppLink>
            </li>
            <li>
              <FontAwesomeIcon icon={faAngleRight} />{" "}
              <AppLink to={`/`}>Crumb 1</AppLink>
            </li>
            <li>
              <FontAwesomeIcon icon={faAngleRight} />{" "}
              <AppLink to={`/`}>Crumb 1</AppLink>
            </li>
          </ol>
        </nav>
      </section>
    );
  })
);
