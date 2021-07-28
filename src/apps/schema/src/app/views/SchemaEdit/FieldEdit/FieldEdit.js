import { useState } from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { useMetaKey } from "shell/hooks/useMetaKey";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpandArrowsAlt,
  faSpinner,
  faSave,
  faPlayCircle,
  faPauseCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { CollapsibleCard } from "@zesty-io/core/CollapsibleCard";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";

import { FieldSettings } from "../FieldSettings";

import {
  saveField,
  updateField,
  updateFieldSetting,
  deactivateField,
  activateField,
} from "shell/store/fields";

import styles from "./FieldEdit.less";
import { notify } from "shell/store/notifications";
export function FieldEdit(props) {
  return (
    <CollapsibleCard
      className={styles.Card}
      header={Header(props)}
      open={props.field.isOpen}
    >
      <FieldSettings
        className={cx(props.field.deletedAt ? styles.Disabled : null)}
        updateValue={(value, name) => {
          props.dispatch(updateField(props.field.ZUID, name, value));
        }}
        updateFieldSetting={(value, name) => {
          props.dispatch(updateFieldSetting(props.field.ZUID, name, value));
        }}
        field={props.field}
      />
      <Footer {...props} />
    </CollapsibleCard>
  );
}

function Header(props) {
  let history = useHistory();

  return (
    <div
      className={styles.Header}
      onClick={() => {
        history.push(
          `/schema/${props.field.contentModelZUID}/field/${props.field.ZUID}`
        );
      }}
    >
      <span className={styles.Caret}>
        {props.type.icon ? (
          props.type.icon
        ) : (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            title={`The ${props.field.datatype} field type is no longer supported`}
          />
        )}
      </span>
      <h1 className={styles.Title}>{props.field.label}</h1>
      <small className={styles.Type}>{props.field.datatype}</small>
      <Button
        className={styles.DragHandle}
        draggable="true"
        onClick={(evt) => {
          // Prevent the card toggle
          evt.preventDefault();
          evt.stopPropagation();
        }}
        onDragStart={props.onDragStart}
      >
        <FontAwesomeIcon icon={faExpandArrowsAlt} />
      </Button>
    </div>
  );
}

export function Footer(props) {
  const [loading, setLoading] = useState(false);

  const onSave = () => {
    setLoading(true);
    props
      .dispatch(saveField(props.field.contentModelZUID, props.field.ZUID))
      .then((res) => {
        setLoading(false);

        if (res.status === 200) {
          props.dispatch(
            notify({
              kind: "save",
              message: `Saved field: ${props.field.name}`,
            })
          );
        } else {
          props.dispatch(
            notify({
              kind: "warn",
              message: `Failed tyring to save field: ${props.field.name}`,
            })
          );
        }
      })
      .catch(() => setLoading(false));
  };

  const metaShortcut = useMetaKey("s", onSave);

  return (
    <footer className={styles.FieldFooter}>
      <ButtonGroup className={styles.FieldActions}>
        <Button kind="save" disabled={!props.field.dirty} onClick={onSave}>
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faSave} />
          )}
          Save {metaShortcut}
        </Button>

        {props.field.deletedAt ? (
          <Button
            onClick={(evt) => {
              evt.preventDefault();
              setLoading(true);
              props.dispatch(
                activateField(props.field.contentModelZUID, props.field.ZUID)
              );
            }}
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPlayCircle} />
            )}
            Reactivate
          </Button>
        ) : (
          <Button
            className="deactivate"
            kind="cancel"
            onClick={(evt) => {
              evt.preventDefault();
              setLoading(true);
              props.dispatch(
                deactivateField(props.field.contentModelZUID, props.field.ZUID)
              );
            }}
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPauseCircle} />
            )}
            Deactivate
          </Button>
        )}
      </ButtonGroup>
    </footer>
  );
}
