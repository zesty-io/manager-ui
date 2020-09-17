import React from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";

import { Select, Option } from "@zesty-io/core/Select";
import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";

import styles from "./styles.less";
export default connect(state => {
  return {
    ui: state.ui,
    instance: state.instance,
    instances: state.instances,
    user: state.user
  };
})(function GlobalAccount(props) {
  return (
    <section
      className={cx(
        styles.accountMenu,
        props.ui.accountsMenuVisible ? styles.show : styles.hide
      )}
    >
      <header className={styles.user}>
        <h1>
          <img
            alt={`${props.user.firstName} ${props.user.lastName} Avatar`}
            src={`https://www.gravatar.com/avatar/${props.user.emailHash}?d=mm&s=40`}
          />
          <div className={styles.meta}>
            <span className={styles.name}>
              {props.user.firstName} {props.user.lastName}
            </span>
            <span className={styles.subheadline}>{props.user.email}</span>
          </div>
        </h1>
      </header>

      <main className={styles.siteSelector}>
        <Select name="instance" value={props.instance.ZUID}>
          {props.instances.map(instance => (
            <Option
              key={instance.ZUID}
              value={instance.ZUID}
              text={instance.name}
              onClick={() => {
                window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}`;
              }}
            />
          ))}
        </Select>
      </main>

      <main className={styles.Domains}>
        {props.instance.screenshotURL && (
          <img src={props.instance.screenshotURL} width="275px" />
        )}

        <ul className={styles.bodyText}>
          {props.instance.domains.map(domain => (
            <li key={domain.domain}>
              <Url href={`http://${domain.domain}`}>
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                &nbsp;
                {domain.domain}
              </Url>
            </li>
          ))}
        </ul>
      </main>

      <Url
        href={`${CONFIG.URL_ACCOUNTS}/logout`}
        className={cx(styles.link, styles.logout)}
      >
        <Button kind="alt">
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </Button>
      </Url>
    </section>
  );
});
