import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Loader } from "@zesty-io/core/Loader";

import { injectReducer } from "shell/store";

import AuditControls from "components/controls";
import Log from "components/log";
import Pagination from "components/pagination";

import { getLogs } from "store/logs";
import { logs } from "store/logs";
import { loadingLogs } from "store/loadingLogs";
import { inViewLogs } from "store/inViewLogs";
import { settings } from "store/settings";

// Necessary for exposing the store
// on the component context
// AuditApp.contextTypes = {
//   store: PropTypes.object.isRequired
// };

import styles from "./styles.less";
export default connect(state => state)(
  class AuditApp extends Component {
    constructor(props) {
      super(props);
      console.log("AuditApp:constructor", this);
    }
    componentWillMount() {
      console.log("AuditApp:componentWillMount", this);

      injectReducer(window.ZESTY_REDUX_STORE, "logs", logs);
      injectReducer(window.ZESTY_REDUX_STORE, "loadingLogs", loadingLogs);
      injectReducer(window.ZESTY_REDUX_STORE, "inViewLogs", inViewLogs);
      injectReducer(window.ZESTY_REDUX_STORE, "settings", settings);

      // TODO these settings need to be
      // provided by the app-shell
      this.props.dispatch({
        type: "APP_SETTINGS",
        settings: {
          siteZuid: "8-45a294a-96t789",
          SITES_SERVICE: "http://svc.zesty.localdev:3018/sites-service"
        }
      });

      this.props.dispatch(getLogs());
    }
    renderLogs() {
      console.log("renderLogs", this);
      let logs = Object.keys(this.props.inViewLogs || {});

      if (logs.length) {
        return logs.map(zuid => {
          let log = this.props.inViewLogs[zuid];
          return <Log log={log} key={zuid} />;
        });
      } else {
        return <h1 className={styles.noLogs}>No Logs Found</h1>;
      }
    }
    render() {
      console.log("AuditApp:render", this.props);
      return (
        <main className={styles.auditApp}>
          <div
            className={this.props.loadingLogs ? styles.loading : styles.hidden}
          >
            <Loader />
            <h1>LOADING AUDIT TRAIL</h1>
          </div>
          {
            <AuditControls
              logCount={Object.keys(this.props.inViewLogs || {}).length}
            />
          }
          <section className={styles.logList}>{this.renderLogs()}</section>
          <footer className={styles.paginationWrap}>
            <Pagination />
          </footer>
        </main>
      );
    }
  }
);
