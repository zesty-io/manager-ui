import { memo } from "react";
import cx from "classnames";

import { Search } from "@zesty-io/core/Search";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import styles from "./styles.less";
export default memo(function AuditControls(props) {
  return (
    <header className={styles.auditControls}>
      <Search
        className={styles.SearchLogs}
        placeholder="Search AuditTrail Logs"
        onChange={(value) => {
          props.setSearch(value.trim().toLowerCase());
        }}
      />
      <ButtonGroup className={styles.btnGroup}>
        <Button
          className={cx(styles.child, {
            [styles.selected]: props.filter === 1,
          })}
          onClick={() => {
            if (props.filter === 1) {
              props.setFilter(-1);
            } else {
              props.setFilter(1);
            }
          }}
        >
          Today
        </Button>
        <Button
          className={cx(styles.child, {
            [styles.selected]: props.filter === 7,
          })}
          onClick={() => {
            if (props.filter === 7) {
              props.setFilter(-1);
            } else {
              props.setFilter(7);
            }
          }}
        >
          Last Week
        </Button>
        <Button
          className={cx(styles.child, {
            [styles.selected]: props.filter === 30,
          })}
          onClick={() => {
            if (props.filter === 30) {
              props.setFilter(-1);
            } else {
              props.setFilter(30);
            }
          }}
        >
          Last Month
        </Button>
      </ButtonGroup>
    </header>
  );
});
