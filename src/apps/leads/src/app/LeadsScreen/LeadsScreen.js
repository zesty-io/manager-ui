import React from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { Search } from "@zesty-io/core/Search";

import { setFilterText } from "../../store/filter";
import { DownloadCSVButton } from "../DownloadCSVButton";
import { FormGroupSelector } from "../FormGroupSelector";
import { TableDateFilter } from "../TableDateFilter";
import { LeadsTable } from "../LeadsTable";

import styles from "./LeadsScreen.less";
export default connect(state => {
  return {
    leads: state.leads
  };
})(
  class LeadsScreen extends React.Component {
    constructor(props) {
      super(props);
    }

    onTextFilterChange = (name, value, datatype) => {
      this.props.dispatch(setFilterText(value));
    };

    render() {
      return (
        <div className={`p-4 ${styles.LeadsScreen}`}>
          <div className={styles.textFilterWrapper}>
            <div>
              <p className={styles.label}>Fuzzy Search</p>
              <Search
                name="text-filter"
                onChange={this.onTextFilterChange}
                onSubmit={this.onTextFilterChange}
              />
            </div>
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
          <div className={styles.tableWrapper}>
            <Route component={LeadsTable} />
          </div>
        </div>
      );
    }
  }
);
