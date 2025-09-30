import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { WithLoader } from "shell/components/legacy/WithLoader";
import { LeadExporter } from "../../components/LeadExporter";
import { LeadsTable } from "../../components/LeadsTable";
import { GetStarted } from "../GetStarted";

import { fetchLeads } from "../../../store/leads";
import { LoadingQuote } from "../../../../../../shell/components/LoadingQuote";

import styles from "./Leads.less";
export default connect((state) => state)(function Leads(props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(props.dispatch(fetchLeads())).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingQuote />;
  }

  if (!props.leads.length) {
    return <GetStarted />;
  }

  return (
    <section className={styles.Leads}>
      <LeadExporter />
      <main className={styles.tableWrapper}>
        <Route component={LeadsTable} />
      </main>
    </section>
  );
});
