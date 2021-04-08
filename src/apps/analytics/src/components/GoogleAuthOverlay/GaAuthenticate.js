import React from "react";

import { usePermission } from "shell/hooks/use-permissions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import styles from "./GoogleAuthOverlay.less";

export default function GaAuthenticate(props) {
  const canAuthenticate = usePermission("CODE");

  return (
    <React.Fragment>
      {canAuthenticate && (
        <div className={styles.buttonHolder}>
          <Button kind="save" onClick={props.onClick}>
            <FontAwesomeIcon icon={faKey} />
            Click here to Authenticate With Google
          </Button>
        </div>
      )}
    </React.Fragment>
  );
}
