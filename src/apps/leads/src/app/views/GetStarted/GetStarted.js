import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import styles from "./GetStarted.less";
export function GetStarted(props) {
  return (
    <section className={styles.GetStarted}>
      <h1 className={styles.display}>Get Started</h1>
      <h2 className={styles.subheadline}>Capture leads on your instance</h2>

      <p className={styles.bodyText}>
        By creating a form on your instance which includes the zlf input you can
        begin instantly capturing leads.
      </p>
      <p className={styles.bodyText}>
        Learn more about{" "}
        <a
          href="https://zesty.org/services/web-engine/guides/how-to-create-a-lead-form#zlf-zesty-leads-form"
          target="_blank"
        >
          How to Create a Lead Form
        </a>
      </p>
    </section>
  );
}
