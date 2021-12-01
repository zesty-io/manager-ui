import React from "react";
import { Notice } from "@zesty-io/core/Notice";
import { useSelector } from "react-redux";

// import styles from "./Preview.less";
export default function Preview(props) {
  const instance = useSelector((state) => state.instance);

  return (
    <div>
      {/* {props.dirty ? (
                <Notice>Click Save to See Changes</Notice>
            ) : (
                <p></p>
            )} */}

      <iframe
        src={`${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
        frameBorder="0"
        style={{ width: "100%", height: "100vh" }}
      ></iframe>
    </div>
  );
}
