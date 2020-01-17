import React from "react";
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

export default React.memo(function GlobalMenu() {
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

      <Link className={styles.control} to="/content" title="Content Editor">
        <FontAwesomeIcon icon={faEdit} />
        <span className={styles.title}>Content</span>
      </Link>
      <Link className={styles.control} to="/media" title="Media Manager">
        <FontAwesomeIcon icon={faImage} />
        <span className={styles.title}>Media</span>
      </Link>

      <Link className={styles.build} to="/schema" title="Schema Editor">
        <FontAwesomeIcon icon={faDatabase} />
        <span className={styles.title}>Schema</span>
      </Link>
      <Link className={styles.build} to="/code" title="Code Editor">
        <FontAwesomeIcon icon={faCodeBranch} />
        <span className={styles.title}>Code</span>
      </Link>

      <Link className={styles.control} to="/leads">
        <FontAwesomeIcon icon={faAddressCard} />
        <span className={styles.title}>Leads</span>
      </Link>
      <Link className={styles.optimize} to="/analytics" title="Analytics">
        <FontAwesomeIcon icon={faChartPie} />
        <span className={styles.title}>Analytics</span>
      </Link>

      <Link className={styles.optimize} to="/seo">
        <FontAwesomeIcon icon={faChartLine} />
        <span className={styles.title}>SEO</span>
      </Link>
      <Link className={styles.optimize} to="/audit-trail">
        <FontAwesomeIcon icon={faHistory} />
        <span className={styles.title}>AuditTrail</span>
      </Link>

      <Link className={styles.settings} to="/settings">
        <FontAwesomeIcon icon={faCog} />
        <span className={styles.title}>Settings</span>
      </Link>
    </menu>
  );
});
