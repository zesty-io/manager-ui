import { FieldTypeText } from "@zesty-io/material";

import styles from "./ModelName.less";
export function ModelName(props) {
  return (
    <div className={styles.ModelName}>
      <h2 className={styles.display}>Name Your Content Model</h2>

      <p className={styles.title}>
        Now we are going to name this content model. This will be the name used
        to refer to this model inside the application and code.
      </p>

      <p className={styles.title}>
        <em>For example: Contact us, About us, Articles, Icons, etc</em>
      </p>

      <div className={styles.FieldSet}>
        <FieldTypeText
          className={styles.TextField}
          label="Model Display Name"
          name="label"
          placeholder="The name that will be displayed throughout Zesty"
          tooltip="The name that will be displayed throughout Zesty"
          value={props.label}
          onChange={(evt) => props.setModel("label", evt.target.value)}
        />
        <FieldTypeText
          className={styles.TextField}
          label="Model Reference Name"
          name="name"
          placeholder="The name used by code to reference this content model"
          tooltip="The name used by code to reference this content model"
          value={props.name}
          onChange={(evt) => props.setModel("name", evt.target.value)}
        />
      </div>
    </div>
  );
}
