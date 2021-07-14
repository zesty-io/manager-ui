import { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";

import { notify } from "shell/store/notifications";

import { WithLoader } from "@zesty-io/core/WithLoader";
import AuditControls from "../../components/controls";
import Log from "../../components/log";
// import Pagination from "components/pagination";

import { getLogs } from "../../store/logsInView";

import styles from "./styles.less";
export default connect((state) => state)(function AuditTrail(props) {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterByDays, setFilterByDays] = useState(-1);

  useEffect(() => {
    props
      .dispatch(getLogs())
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        props.dispatch(
          notify({
            kind: "warn",
            message: "Failed to load AuditTrail logs",
          })
        );
      });
  }, []);

  let logs = Object.values(props.logsInView);
  if (search) {
    logs = logs.filter(
      (log) => log.meta.message.toLowerCase().indexOf(search) !== -1
    );
  }
  if (filterByDays !== -1) {
    const subtractDays = +moment().subtract(filterByDays, "days");
    logs = logs.filter((log) => +moment(log.createdAt) > subtractDays);
  }
  logs.sort(
    (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
  );

  return (
    <WithLoader condition={!loading} message="Loading AuditTrail">
      <main className={styles.auditApp}>
        <AuditControls
          setSearch={setSearch}
          filter={filterByDays}
          setFilter={setFilterByDays}
          logCount={logs.length}
        />
        <section className={styles.logList}>
          {logs.length ? (
            logs.map((log) => <Log log={log} key={log.ZUID} />)
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
