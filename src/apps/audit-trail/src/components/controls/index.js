import React from "react";
import { useDispatch } from "react-redux";

import { Search } from "@zesty-io/core/Search";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import { searchInViewLogs, filterInViewLogs } from "store/logsInView";

import styles from "./styles.less";
export default React.memo(function AuditControls() {
  const dispatch = useDispatch();
  return (
    <header className={styles.auditControls}>
      <Search
        className={styles.SearchLogs}
        placeholder="Search AuditTrail Logs"
        onChange={value => {
          dispatch(searchInViewLogs(value.trim()));
        }}
      />
      <ButtonGroup className={styles.btnGroup}>
        <Button
          className={styles.child}
          onClick={() => {
            dispatch(filterInViewLogs("1"));
          }}
        >
          Today
        </Button>
        <Button
          className={styles.child}
          onClick={() => {
            dispatch(filterInViewLogs("7"));
          }}
        >
          Last Week
        </Button>
        <Button
          className={styles.child}
          onClick={() => {
            dispatch(filterInViewLogs("30"));
          }}
        >
          Last Month
        </Button>
      </ButtonGroup>
    </header>
  );
});
