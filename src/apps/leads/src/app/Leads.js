import React from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";
import AppError from "./AppError";

import { fetchLeads } from "../store/leads";
import { LeadsScreen } from "./LeadsScreen";

import styles from "./Leads.less";
export default connect(state => state)(function Leads(props) {
  if (!props.leads.length) {
    props.dispatch(fetchLeads());
  }

  return (
    <AppError>
      <WithLoader
        condition={props.leads.length}
        message="Starting Leads App"
        width="100vw"
        height="100vh"
      >
        <section className={styles.Leads}>
          <div className={`${styles.row} ${styles.headline}`}>
            <h1>Leads App</h1>
          </div>
          <LeadsScreen className={styles.row} />
        </section>
      </WithLoader>
    </AppError>
  );
});
