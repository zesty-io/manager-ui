import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { LeadExporter } from "components/LeadExporter";
import { LeadsTable } from "components/LeadsTable";

import { fetchLeads } from "store/leads";

import styles from "./Leads.less";
export default connect(state => state)(function Leads(props) {
  useEffect(() => {
    props.dispatch(fetchLeads());
  }, []);

  return (
    <WithLoader
      condition={props.leads.length}
      message="Starting Leads App"
      width="100vw"
      height="100vh"
    >
      <section className={styles.Leads}>
        <header>
          <LeadExporter />
        </header>
        <main className={styles.tableWrapper}>
          <Route component={LeadsTable} />
        </main>
      </section>
    </WithLoader>
  );
});
