import React, { Component } from "react";
import { connect } from "react-redux";

import { Loader } from "@zesty-io/core/Loader";

import AuditControls from "components/controls";
import Log from "components/log";
import Pagination from "components/pagination";

import styles from "./styles.less";
export default connect(state => state)(
  class AuditApp extends Component {
    constructor(props) {
      super(props);
    }

    render() {
      const logs = Object.keys(this.props.inViewLogs || {});
      return (
        <main className={styles.auditApp}>
          <div
            className={this.props.loadingLogs ? styles.loading : styles.hidden}
          >
            <Loader />
            <h1>LOADING AUDIT TRAIL</h1>
          </div>
          {<AuditControls logCount={logs.length} />}
          <section className={styles.logList}>
            {logs.length ? (
              logs.map(zuid => (
                <Log log={this.props.inViewLogs[zuid]} key={zuid} />
              ))
            ) : (
              <h1 className={styles.noLogs}>No Logs Found</h1>
            )}
          </section>
          <footer className={styles.paginationWrap}>
            <Pagination />
          </footer>
        </main>
      );
    }
  }
);
