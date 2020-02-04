import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faImage,
  faAddressCard,
  faDatabase,
  faCodeBranch,
  faChartPie,
  faChartLine,
  faHistory,
  faCog
} from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";

export default connect(state => {
  return {
    products: state.products
  };
})(
  React.memo(function GlobalMenu(props) {
    return (
      <menu className={styles.GlobalMenu}>
        {/*props.products.map(product => {
        return <Link
                className={styles.control}
                to={`/${product}`}

                onClick={this.showMenu}>
                <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                <span className={styles.title}>{product}</span>
              </Link>
      })*/}

        {props.products.map(product => {
          switch (product) {
            case "content":
              return (
                <Link
                  key={product}
                  className={styles.control}
                  to="/content"
                  title="Content Editor"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span className={styles.title}>Content</span>
                </Link>
              );
            case "media":
              return (
                <Link
                  key={product}
                  className={styles.control}
                  to="/media"
                  title="Media Manager"
                >
                  <FontAwesomeIcon icon={faImage} />
                  <span className={styles.title}>Media</span>
                </Link>
              );

            case "schema":
              return (
                <Link
                  key={product}
                  className={styles.build}
                  to="/schema"
                  title="Schema Editor"
                >
                  <FontAwesomeIcon icon={faDatabase} />
                  <span className={styles.title}>Schema</span>
                </Link>
              );

            case "code":
              return (
                <Link
                  key={product}
                  className={styles.build}
                  to="/code"
                  title="Code Editor"
                >
                  <FontAwesomeIcon icon={faCodeBranch} />
                  <span className={styles.title}>Code</span>
                </Link>
              );

            case "leads":
              return (
                <Link key={product} className={styles.control} to="/leads">
                  <FontAwesomeIcon icon={faAddressCard} />
                  <span className={styles.title}>Leads</span>
                </Link>
              );

            case "analytics":
              return (
                <Link
                  key={product}
                  className={styles.optimize}
                  to="/analytics"
                  title="Analytics"
                >
                  <FontAwesomeIcon icon={faChartPie} />
                  <span className={styles.title}>Analytics</span>
                </Link>
              );

            case "seo":
              return (
                <Link key={product} className={styles.optimize} to="/seo">
                  <FontAwesomeIcon icon={faChartLine} />
                  <span className={styles.title}>SEO</span>
                </Link>
              );

            case "audit-trail":
              return (
                <Link
                  key={product}
                  className={styles.optimize}
                  to="/audit-trail"
                >
                  <FontAwesomeIcon icon={faHistory} />
                  <span className={styles.title}>AuditTrail</span>
                </Link>
              );

            case "settings":
              return (
                <Link key={product} className={styles.settings} to="/settings">
                  <FontAwesomeIcon icon={faCog} />
                  <span className={styles.title}>Settings</span>
                </Link>
              );

            default:
              null;
          }
        })}
      </menu>
    );
  })
);
