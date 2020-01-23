import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { Search } from "@zesty-io/core/Search";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { DownloadCSVButton } from "components/DownloadCSVButton";
import { FormGroupSelector } from "components/FormGroupSelector";
import { TableDateFilter } from "components/TableDateFilter";
import { LeadsTable } from "components/LeadsTable";

import { setFilterText } from "store/filter";
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
          <div className={styles.LeadFilter}>
            <Search
              name="text-filter"
              placeholder="Search across all of your leads"
              onChange={(name, value) => {
                props.dispatch(setFilterText(value));
              }}
              onSubmit={(name, value) => {
                props.dispatch(setFilterText(value));
              }}
            />
          </div>

          <div className={styles.exportWrapper}>
            <h2>Export Lead Options</h2>
            <div className={styles.exportContent}>
              <TableDateFilter />
            </div>
            <div className={styles.exportContent}>
              <FormGroupSelector />
            </div>
            <div className={styles.exportContent}>
              <DownloadCSVButton />
            </div>
          </div>
        </header>

        <main className={styles.tableWrapper}>
          <Route component={LeadsTable} />
        </main>
      </section>
    </WithLoader>
  );
});
