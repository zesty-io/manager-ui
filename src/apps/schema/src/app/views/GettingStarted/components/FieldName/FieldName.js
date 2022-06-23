import { FieldTypeText } from "@zesty-io/material";

import styles from "./FieldName.less";
export function FieldName(props) {
  return (
    <>
      <h2 className={styles.display}>Name Field</h2>
      <p className={styles.title}>
        In the same way a model name acts as a reference so do field names.
        Attributes can be edited post-creation
      </p>
      <p className={styles.title}>
        <em>For example: Title, Hero image, Related tags, Item cost, etc.</em>
      </p>

      <div className={styles.FieldSet}>
        <FieldTypeText
          className={styles.TextField}
          label="Field Display Name"
          name="label"
          placeholder="This name will be shown in the Zesty content editor"
          tooltip="This name will be shown in the Zesty content editor"
          value={props.fieldLabel}
          onChange={(evt) => props.setField("label", evt.target.value)}
        />
        <FieldTypeText
          className={styles.TextField}
          label="Field Reference Name"
          name="name"
          placeholder="The name used in code to reference this field"
          tooltip="The name used in code to reference this field"
          value={props.fieldName}
          onChange={(evt) => props.setField("name", evt.target.value)}
        />
      </div>
    </>
  );
}
