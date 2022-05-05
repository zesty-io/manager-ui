import { memo } from "react";
import cx from "classnames";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";

import { Search } from "@zesty-io/core/Search";

import styles from "./styles.less";
export default memo(function AuditControls(props) {
  return (
    <header className={styles.auditControls}>
      <ButtonGroup variant="contained">
        <Button
          color={props.filter === 1 ? "secondary" : "primary"}
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
          color={props.filter === 7 ? "secondary" : "primary"}
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
          color={props.filter === 30 ? "secondary" : "primary"}
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
      <Search
        className={styles.SearchLogs}
        placeholder="Search AuditTrail Logs"
        onChange={(value) => {
          props.setSearch(value.trim().toLowerCase());
        }}
      />
    </header>
  );
});
