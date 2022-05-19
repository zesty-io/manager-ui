import { useState } from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { useMetaKey } from "shell/hooks/useMetaKey";

import Button from "@mui/material/Button";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { CollapsibleCard } from "@zesty-io/core/CollapsibleCard";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";

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
  const [originalFieldName, setOriginalFieldName] = useState(props.field.name);

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
      <Footer
        {...props}
        originalFieldName={originalFieldName}
        setOriginalFieldName={setOriginalFieldName}
      />
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
      <h1 data-cy="fieldLabel" className={styles.Title}>
        {props.field.label}
      </h1>
      <small className={styles.Type}>{props.field.datatype}</small>
      <Button
        variant="contained"
        draggable="true"
        onClick={(evt) => {
          // Prevent the card toggle
          evt.preventDefault();
          evt.stopPropagation();
        }}
        onDragStart={props.onDragStart}
        sx={{ cursor: "move" }}
      >
        <ZoomOutMapIcon fontSize="small" sx={{ mr: "0 !important" }} />
      </Button>
    </div>
  );
}

export function Footer(props) {
  const [loading, setLoading] = useState(false);
  const [warningIsOpen, setWarningIsOpen] = useState(false);

  //const [name, setName] = useState(props.field.name)

  const save = () => {
    setLoading(true);
    return props
      .dispatch(saveField(props.field.contentModelZUID, props.field.ZUID))
      .then((res) => {
        setLoading(false);

        if (res.status === 200) {
          props.setOriginalFieldName(props.field.name);
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
              message: `Failed trying to save field: ${props.field.name}`,
            })
          );
        }
      })
      .catch(() => setLoading(false))
      .finally(() => setWarningIsOpen(false));
  };

  const warn = () => {
    setWarningIsOpen(true);
  };

  const saveOrWarn = () => {
    if (props.field.name === props.originalFieldName) save();
    else warn();
  };

  const metaShortcut = useMetaKey("s", saveOrWarn);

  return (
    <footer className={styles.FieldFooter}>
      <ButtonGroup className={styles.FieldActions}>
        {props.field.deletedAt ? (
          <Button
            variant="contained"
            onClick={(evt) => {
              evt.preventDefault();
              setLoading(true);
              props.dispatch(
                activateField(props.field.contentModelZUID, props.field.ZUID)
              );
            }}
            startIcon={
              loading ? <CircularProgress size="20px" /> : <PauseCircleIcon />
            }
          >
            Reactivate
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={(evt) => {
              evt.preventDefault();
              setLoading(true);
              props.dispatch(
                deactivateField(props.field.contentModelZUID, props.field.ZUID)
              );
            }}
            startIcon={
              loading ? <CircularProgress size="20px" /> : <PauseCircleIcon />
            }
          >
            Deactivate
          </Button>
        )}
        <Button
          variant="contained"
          color="success"
          disabled={!props.field.dirty}
          onClick={saveOrWarn}
          startIcon={loading ? <CircularProgress size="20px" /> : <SaveIcon />}
        >
          Save {metaShortcut}
        </Button>
        <ConfirmDialog
          isOpen={warningIsOpen}
          prompt="This could break your experience (e.g. your Parsley code)"
        >
          <Button
            variant="contained"
            id="editCancelButton"
            onClick={() => setWarningIsOpen(false)}
            startIcon={<DoDisturbAltIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            id="editConfirmButton"
            onClick={save}
            startIcon={
              loading ? <CircularProgress size="20px" /> : <SaveIcon />
            }
          >
            Save Changes
          </Button>
        </ConfirmDialog>
      </ButtonGroup>
    </footer>
  );
}
