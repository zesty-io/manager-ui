import React from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faImage,
  faAddressCard,
  faDatabase,
  faChartLine,
  faHistory,
  faCog,
  faBullseye,
  faCode
} from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";
export default connect(state => {
  return {
    products: state.products
  };
})(
  React.memo(function GlobalMenu(props) {
    const history = useHistory();

    const slug = history.location.pathname.split("/")[1];
    const icons = {
      content: faEdit,
      media: faImage,
      schema: faDatabase,
      code: faCode,
      leads: faAddressCard,
      analytics: faChartLine,
      seo: faBullseye,
      "audit-trail": faHistory,
      settings: faCog
    };

    return (
      <menu className={styles.GlobalMenu}>
        {props.products.map(product => {
          // Covert dashes to spaces
          // Uppercase first letter of word
          let name = product
            .split("-")
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ");

          if (product === "seo") {
            name = name.toUpperCase();
          }

          return (
            <Link
              key={product}
              className={cx(
                styles.control,
                slug === product ? styles.current : null
              )}
              to={`/${product}`}
              // onClick={this.showMenu}
              title={`${name} App`}
            >
              <FontAwesomeIcon icon={icons[product]} />
              <span className={styles.title}>{name}</span>
            </Link>
          );
        })}
      </menu>
    );
  })
);
