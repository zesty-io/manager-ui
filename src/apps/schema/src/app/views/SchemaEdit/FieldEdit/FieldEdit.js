import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpandArrowsAlt,
  faSpinner,
  faSave,
  faPlayCircle,
  faPauseCircle
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
  activateField
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
          <i
            className={cx("fas fa-exclamation-triangle")}
            title={`The ${props.field.datatype} field type is no longer supported`}
          />
        )}
      </span>
      <h1 className={styles.Title}>{props.field.label}</h1>
      <small className={styles.Type}>{props.field.datatype}</small>
      <Button
        className={styles.DragHandle}
        draggable="true"
        onClick={evt => {
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

const Footer = connect(state => {
  return {
    platform: state.platform
  };
})(function Footer(props) {
  const [loading, setLoading] = useState(false);

  const onSave = () => {
    setLoading(true);
    props
      .dispatch(saveField(props.field.contentModelZUID, props.field.ZUID))
      .then(res => {
        setLoading(false);

        if (res.status === 200) {
          props.dispatch(
            notify({
              kind: "save",
              message: `Saved field: ${props.field.name}`
            })
          );
        } else {
          props.dispatch(
            notify({
              kind: "warn",
              message: `Failed tyring to save field: ${props.field.name}`
            })
          );
        }
      })
      .catch(() => setLoading(false));
  };

  const handleKeyDown = evt => {
    if (
      ((props.platform.isMac && evt.metaKey) ||
        (!props.platform.isMac && evt.ctrlKey)) &&
      evt.key == "s"
    ) {
      evt.preventDefault();
      if (props.field.dirty) {
        onSave();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <footer className={styles.FieldFooter}>
      <ButtonGroup className={styles.FieldActions}>
        <Button kind="save" disabled={!props.field.dirty} onClick={onSave}>
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} />
          ) : (
            <FontAwesomeIcon icon={faSave} />
          )}
          Save Changes
        </Button>

        {props.field.deletedAt ? (
          <Button
            onClick={evt => {
              evt.preventDefault();
              setLoading(true);
              props.dispatch(
                activateField(props.field.contentModelZUID, props.field.ZUID)
              );
            }}
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} />
            ) : (
              <FontAwesomeIcon icon={faPlayCircle} />
            )}
            Reactivate
          </Button>
        ) : (
          <Button
            className="deactivate"
            kind="cancel"
            onClick={evt => {
              evt.preventDefault();
              setLoading(true);
              props.dispatch(
                deactivateField(props.field.contentModelZUID, props.field.ZUID)
              );
            }}
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} />
            ) : (
              <FontAwesomeIcon icon={faPauseCircle} />
            )}
            Deactivate
          </Button>
        )}
      </ButtonGroup>
    </footer>
  );
});
