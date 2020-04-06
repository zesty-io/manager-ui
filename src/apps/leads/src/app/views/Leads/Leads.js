import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { LeadExporter } from "components/LeadExporter";
import { LeadsTable } from "components/LeadsTable";
import { GetStarted } from "../GetStarted";

import { fetchLeads } from "store/leads";

import styles from "./Leads.less";
export default connect(state => state)(function Leads(props) {
  const [loading, setLoading] = useState();

  useEffect(() => {
    setLoading(true);
    props.dispatch(fetchLeads()).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <WithLoader
      condition={!loading}
      message="Loading Leads"
      width="100vw"
      height="100vh"
    >
      {!props.leads.length ? (
        <GetStarted />
      ) : (
        <section className={styles.Leads}>
          <header>
            <LeadExporter />
          </header>
          <main className={styles.tableWrapper}>
            <Route component={LeadsTable} />
          </main>
        </section>
      )}
    </WithLoader>
  );
});
