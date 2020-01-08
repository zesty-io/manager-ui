import React, { useState, useEffect } from "react";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestion,
  faBell,
  faComment
} from "@fortawesome/free-solid-svg-icons";

import cx from "classnames";

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
      <h1 className={styles.InstanceName}>Instance Name</h1>
      <nav className={styles.quicklinks}>
        <ol>
          {routes.map(route => (
            <li>
              <Link
                to={`${route.pathname}${route.search}`}
              >{`${route.pathname.slice(1)}`}</Link>
            </li>
          ))}
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
