import React, { useEffect } from "react";
import cx from "classnames";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@zesty-io/core/Input";

import styles from "./FieldTypeUUID.less";

export const FieldTypeUUID = React.memo(function FieldTypeUUID(props) {
  // console.log("FieldTypeUUID:render");

  useEffect(() => {
    // NOTE may want to add a check to ensure the itemZUID is 'new'
    if (props.name && !props.value) {
      // there is no UUID and it needs to be generated
      props.onChange(uuidv4());
    }
  }, []);

  return (
    <label className={cx(styles.FieldTypeUUID, props.className)}>
      <div className={styles.DateFieldTypeInput}>
        <FontAwesomeIcon
          className={styles.Icon}
          icon={faClipboard}
          aria-hidden="true"
          title="Click to Copy"
          onClick={(e) => {
            const input = document.createElement("input");
            document.body.appendChild(input);
            input.value = props.value;
            input.focus();
            input.select();
            const result = document.execCommand("copy");
            input.remove();
            if (result === "unsuccessful") {
              return props.dispatch(
                notify({
                  type: "error",
                  message: "Failed to copy the team ID to your clipboard",
                })
              );
            }
          }}
        />

        <Input
          type="text"
          readOnly={true}
          required={props.required}
          defaultValue={props.value || ""}
        />
      </div>
    </label>
  );
});
