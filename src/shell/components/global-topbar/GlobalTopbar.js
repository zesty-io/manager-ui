import React, { useState, useEffect } from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestion,
  faBell,
  faComment
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

  return (
    <section className={styles.GlobalTopbar}>
      <div>
        <h1 className={styles.InstanceName}>Instance Name</h1>
        <GlobalSearch dispatch={props.dispatch} />
      </div>
      <nav className={styles.QuickLinks}>
        <ol>
          {routes.map((route, i) => (
            <li className={cx(i === 0 ? styles.active : null)}>
              <Link
                to={`${route.pathname}${route.search}`}
              >{`${route.pathname.slice(1)}`}</Link>
            </li>
          ))}
        </ol>
        <ol className={styles.breadcrumbs}>
          <li>
            <a href="">Crumb 1</a>
          </li>
          <li>
            <a href="">Crumb 2</a>
          </li>
          <li>
            <a href="">Crumb 3</a>
          </li>
        </ol>
      </nav>
      <div className={styles.actions}>
        <button title="Help">
          <FontAwesomeIcon icon={faQuestion} />
        </button>
        <button title="Notice">
          <FontAwesomeIcon icon={faBell} />
        </button>
        <button title="chat">
          <FontAwesomeIcon icon={faComment} />
        </button>
      </div>
    </section>
  );
});
