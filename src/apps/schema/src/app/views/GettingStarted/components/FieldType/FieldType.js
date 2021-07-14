import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faFileImage,
  faFont,
} from "@fortawesome/free-solid-svg-icons";

import { Card } from "@zesty-io/core/Card";

import styles from "./FieldType.less";
export function FieldType(props) {
  return (
    <>
      <p className={styles.display}>Add a Field To Your Model</p>
      <p className={styles.title}>
        Now we will choose the type of field you want to add to this model.
        After completing this wizard you’ll have access to over 15 field types.
      </p>

      <div className={styles.Cards}>
        <Card
          className={cx(styles.Option, {
            [styles.Selected]: props.fieldType === "text",
          })}
          onClick={() => props.setFieldType("text")}
        >
          <FontAwesomeIcon className={styles.icon} icon={faFont} />
          <h2 className={styles.OptionTitle}>Text</h2>
          <p className={styles.OptionDescription}>Simple one-line input.</p>
        </Card>
        <Card
          className={cx(styles.Option, {
            [styles.Selected]: props.fieldType === "textarea",
          })}
          onClick={(e) => props.setFieldType("textarea")}
        >
          <FontAwesomeIcon className={styles.icon} icon={faAlignLeft} />
          <h2 className={styles.OptionTitle}>Rich text</h2>
          <p className={styles.OptionDescription}>
            Wysiwyg editor for formatted text.
          </p>
        </Card>
        <Card
          className={cx(styles.Option, {
            [styles.Selected]: props.fieldType === "images",
          })}
          onClick={() => props.setFieldType("images")}
        >
          <FontAwesomeIcon className={styles.icon} icon={faFileImage} />
          <h2 className={styles.OptionTitle}>Media</h2>
          <p className={styles.OptionDescription}>Uploading images or files.</p>
        </Card>
      </div>
    </>
  );
}
