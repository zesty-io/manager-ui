import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAlignLeft,
  faFileImage,
  faFont,
} from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";

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
          onClick={() => props.setFieldType("text")}
          sx={{
            width: "250px",
            height: "300px",
            p: 2,
            textAlign: "center",
            boxSizing: "border-box",
            cursor: "pointer",
            border: "2px solid",
            "&:hover": {
              borderColor: "secondary.main",
            },
            ...(props.fieldType === "text" && {
              borderColor: "secondary.main",
            }),
          }}
        >
          <FontAwesomeIcon className={styles.icon} icon={faFont} />
          <h2 className={styles.OptionTitle}>Text</h2>
          <p className={styles.OptionDescription}>Simple one-line input.</p>
        </Card>
        <Card
          onClick={(e) => props.setFieldType("textarea")}
          sx={{
            width: "250px",
            height: "300px",
            p: 2,
            textAlign: "center",
            boxSizing: "border-box",
            cursor: "pointer",
            border: "2px solid",
            "&:hover": {
              borderColor: "secondary.main",
            },
            ...(props.fieldType === "textarea" && {
              borderColor: "secondary.main",
            }),
          }}
        >
          <FontAwesomeIcon className={styles.icon} icon={faAlignLeft} />
          <h2 className={styles.OptionTitle}>Rich text</h2>
          <p className={styles.OptionDescription}>
            Wysiwyg editor for formatted text.
          </p>
        </Card>
        <Card
          onClick={() => props.setFieldType("images")}
          sx={{
            width: "250px",
            height: "300px",
            p: 2,
            textAlign: "center",
            boxSizing: "border-box",
            cursor: "pointer",
            border: "2px solid",
            "&:hover": {
              borderColor: "secondary.main",
            },
            ...(props.fieldType === "images" && {
              borderColor: "secondary.main",
            }),
          }}
        >
          <FontAwesomeIcon className={styles.icon} icon={faFileImage} />
          <h2 className={styles.OptionTitle}>Media</h2>
          <p className={styles.OptionDescription}>Uploading images or files.</p>
        </Card>
      </div>
    </>
  );
}
