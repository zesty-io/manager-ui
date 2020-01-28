import React from "react";

import { Loader } from "@zesty-io/core/Loader";

import styles from "./RedirectLoader.less";
export default function RedirectLoader(props) {
  return (
    <div className={styles.RedirectLoader}>
      <Loader />
      <h1>Loading Redirects</h1>
    </div>
  );
}
