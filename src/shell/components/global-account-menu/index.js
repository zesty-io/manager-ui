import React from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { Select, Option } from "@zesty-io/core/Select";

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
          {props.user.firstName} {props.user.lastName}
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

      <menu className={styles.accountActions}>
        <a
          href={`${CONFIG.URL_ACCOUNTS}/logout`}
          className={cx(styles.link, styles.logout)}
        >
          Logout
        </a>
      </menu>
    </section>
  );
});
