import React from "react";
import { Notice } from "@zesty-io/core/Notice";
import { useSelector } from "react-redux";

import styles from "./PreviewMode.less";
export default function PreviewMode(props) {
  const instance = useSelector((state) => state.instance);

  return (
    <div className={styles.DMContainer}>
      <div className={styles.Notice}>
        {props.dirty && <Notice>Click Save to See Changes</Notice>}
      </div>

      <iframe
        key={props.version}
        src={`${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
        frameBorder="0"
        style={{ width: "100%", height: "100vh" }}
      ></iframe>
    </div>
  );
}
