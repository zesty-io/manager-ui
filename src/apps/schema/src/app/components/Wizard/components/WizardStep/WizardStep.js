import React from "react";
import styles from "./WizardStep.less";

export function WizardStep(props) {
  return (
    <div className={styles.WizardStep}>
      <div>{props.children}</div>
    </div>
  );
}
