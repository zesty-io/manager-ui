import React from "react";

import { Button } from "@zesty-io/core/Button";

import styles from "./RedirectsImport.less";
export default function RedirectsImport(props) {
  let fileInput = null;
  return (
    <div className={styles.RedirectsImport}>
      <input
        type="file"
        className={styles.hidden}
        ref={input => (fileInput = input)}
        onChange={props.onChange}
      />
      <Button
        onClick={() => {
          fileInput.click();
        }}
      >
        <i className="fa fa-upload" aria-hidden="true"></i>Import CSV/XML
      </Button>
    </div>
  );
}
