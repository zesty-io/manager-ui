import React, { useState, useEffect } from "react";
import { withRouter } from "react-router";
// import { Link } from "react-router-dom";

import { AppLink } from "@zesty-io/core/AppLink";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestion,
  faBell,
  faComment,
  faAngleRight,
  faShareAlt,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import GlobalSearch from "shell/components/global-search";

import styles from "./GlobalTopbar.less";
export default withRouter(function GlobalTopbar(props) {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // Filter out the route that was just loaded if it was already
    // in our route stack. This way it gets moved to the front and not duplicated
    const removedRoute = routes.filter(
      route => route.pathname !== props.location.pathname
    );

    setRoutes([props.location, ...removedRoute]);

    // TODO store routes to local storage and reload on app start
  }, [props.location]);

  const removeRoute = path => {
    const removedRoute = routes.filter(route => route.pathname !== path);

    // jump to the first route in our list after
    props.history.push(removedRoute[0].pathname);

    setRoutes(removedRoute);
  };

  return (
    <section className={styles.GlobalTopbar}>
      <div className={styles.GlobalSearch}>
        <h1 className={styles.InstanceName}>Instance Name</h1>
        <GlobalSearch dispatch={props.dispatch} />
      </div>
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
            {/* <FontAwesomeIcon icon={faAngleRight} /> */}
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
      <div className={styles.actions}>
        <ButtonGroup>
          <Button title="Help">
            <FontAwesomeIcon icon={faQuestion} />
          </Button>
          <Button title="Notice">
            <FontAwesomeIcon icon={faBell} />
          </Button>
          <Button title="chat">
            <FontAwesomeIcon icon={faComment} />
          </Button>
        </ButtonGroup>
      </div>
    </section>
  );
});
