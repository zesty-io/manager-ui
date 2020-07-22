import React from "react";
import { useDispatch } from "react-redux";
import cx from "classnames";

import { Search } from "@zesty-io/core/Search";
import { DownloadCSVButton } from "components/LeadExporter/DownloadCSVButton";
import { FormGroupSelector } from "components/LeadExporter/FormGroupSelector";
import { TableDateFilter } from "components/LeadExporter/TableDateFilter";

import { setFilterText } from "store/filter";

import styles from "./LeadExporter.less";
export function LeadExporter() {
  const dispatch = useDispatch();

  return (
    <div className={styles.LeadExporter}>
      <div className={cx(styles.filter)}>
        <Search
          name="text-filter"
          placeholder="Search across all of your leads"
          onChange={value => {
            dispatch(setFilterText(value));
          }}
          onSubmit={value => {
            dispatch(setFilterText(value));
          }}
        />
      </div>
      <div className={styles.filter}>
        <TableDateFilter />
      </div>
      <div className={styles.filter}>
        <FormGroupSelector />
      </div>
      <div className={styles.filter}>
        <DownloadCSVButton />
      </div>
    </div>
  );
}
