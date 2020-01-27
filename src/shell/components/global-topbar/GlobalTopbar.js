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

import styles from "./GlobalTopbar.less";
export default React.memo(
  connect(state => {
    return {
      instanceZUID: state.instance.zuid
    };
  })(function GlobalTopbar(props) {
    let history = useHistory();
    const [routes, setRoutes] = useState([]);

    // Load prev session routes
    useEffect(() => {
      get(`${props.instanceZUID}:session:routes`).then(storedRoutes => {
        if (Array.isArray(storedRoutes) && storedRoutes.length) {
          setRoutes(storedRoutes);

          // Load users last session route
          history.push(storedRoutes[0].pathname);
        }
      });
    }, []);

    // Track route changes to display quick links
    useEffect(() => {
      const parts = history.location.pathname.split("/").filter(part => part);
      if (parts.length >= 2) {
        // Filter out the route that was just loaded if it was already
        // in our route stack. This way it gets moved to the front and not duplicated
        const removedRoute = routes.filter(
          route => route.pathname !== history.location.pathname
        );

        // TODO resolve ZUID from store to determine display information?
        // switch (prefix) {
        //   // model
        //   case "6":
        //   // content item
        //   case "7":
        //   // code file
        //   case "":
        // }

        const newRoutes = [history.location, ...removedRoute].slice(0, 15);

        // store routes to local storage and reload on app start
        set(`${props.instanceZUID}:session:routes`, newRoutes);

        // Maximum of 25 route records
        setRoutes(newRoutes);
      }
    }, [history.location]);

    const removeRoute = path => {
      const newRoutes = routes.filter(route => route.pathname !== path);

      // store routes to local storage and reload on app start
      set(`${props.instanceZUID}:session:routes`, newRoutes);

      // jump to the first route in our list after
      history.push(newRoutes[0].pathname);

      setRoutes(newRoutes);
    };

    return (
      <section className={styles.GlobalTopbar}>
        <GlobalSearch className={styles.GlobalSearch} />
        <nav className={styles.QuickLinks}>
          <ol className={styles.Links}>
            {routes.map((route, i) => (
              <li
                key={i}
                className={cx(styles.Route, i === 0 ? styles.active : null)}
              >
                <AppLink
                  to={`${route.pathname}${route.search}`}
                >{`${route.pathname.slice(1)}`}</AppLink>
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
