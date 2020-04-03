import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { notify } from "shell/store/notifications";

import { WithLoader } from "@zesty-io/core/WithLoader";
import AuditControls from "components/controls";
import Log from "components/log";
// import Pagination from "components/pagination";

import { getLogs } from "store/logs";

import styles from "./styles.less";
export default connect(state => state)(function AuditTrail(props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props
      .dispatch(getLogs())
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        notify({
          kind: "warn",
          message: "Failed to load AuditTrail logs"
        });
      });
  }, []);

  const logs = Object.keys(props.logsInView || {});

  return (
    <WithLoader condition={!loading} message="Loading AuditTrail">
      <main className={styles.auditApp}>
        <AuditControls logCount={logs.length} />
        <section className={styles.logList}>
          {logs.length ? (
            logs.map(zuid => <Log log={props.logsInView[zuid]} key={zuid} />)
          ) : (
            <h1 className={styles.noLogs}>No Logs Found</h1>
          )}
        </section>
        <footer className={styles.paginationWrap}>
          {/* <Pagination /> */}
        </footer>
      </main>
    </WithLoader>
  );
});
