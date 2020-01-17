import React, { useState, useEffect } from "react";
import cx from "classnames";

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
} from "../../../../store/schemaFields";

import styles from "./FieldEdit.less";
import { notify } from "shell/store/notifications";
export function FieldEdit(props) {
  return (
    <CollapsibleCard
      className={styles.Card}
      header={Header(props)}
      footer={Footer(props)}
      open={props.isOpen}
    >
      <FieldSettings
        className={cx(props.field.deletedAt ? styles.Disabled : null)}
        updateValue={(name, value) => {
          props.dispatch(updateField(props.field.ZUID, name, value));
        }}
        updateFieldSetting={(name, value) => {
          props.dispatch(updateFieldSetting(props.field.ZUID, name, value));
        }}
        field={props.field}
      />
    </CollapsibleCard>
  );
}

function Header(props) {
  return (
    <div
      className={styles.Header}
      onClick={() => {
        window.location = `/schema/${props.field.contentModelZUID}/field/${props.field.ZUID}`;
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
        <i className="fas fa-expand-arrows-alt" />
      </Button>
    </div>
  );
}

function Footer(props) {
  const [loading, setLoading] = useState(false);

  const onSave = () => {
    setLoading(true);
    props
      .dispatch(saveField(props.field.contentModelZUID, props.field.ZUID))
      .then(res => {
        setLoading(false);

        if (res.status === 200) {
          notify({
            kind: "save",
            message: `Saved field: ${props.field.name}`
          });
        } else {
          notify({
            kind: "warn",
            message: `Failed tyring to save field: ${props.field.name}`
          });
        }
      })
      .catch(() => setLoading(false));
  };

  const handleKeyDown = evt => {
    if ((evt.metaKey || evt.ctrlKey) && evt.keyCode == 83) {
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
    <ButtonGroup className={styles.FieldActions}>
      <Button kind="save" disabled={!props.field.dirty} onClick={onSave}>
        {loading ? (
          <i className="fas fa-spinner" aria-hidden="true" />
        ) : (
          <i className="fas fa-save" aria-hidden="true" />
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
            <i className="fas fa-spinner" aria-hidden="true" />
          ) : (
            <i className="fas fa-play-circle"></i>
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
            <i className="fas fa-spinner" aria-hidden="true" />
          ) : (
            <i className="fas fa-pause-circle"></i>
          )}
          Deactivate
        </Button>
      )}
    </ButtonGroup>
  );
}
