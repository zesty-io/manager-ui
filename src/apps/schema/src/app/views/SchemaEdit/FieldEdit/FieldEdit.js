import { useState } from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { useMetaKey } from "shell/hooks/useMetaKey";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  let history = useHistory();

  return (
    <Box sx={{ m: 2 }}>
      <Accordion expanded={props.field.isOpen}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          onClick={() => {
            history.push(
              `/schema/${props.field.contentModelZUID}/field/${props.field.ZUID}`
            );
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <h1 data-cy="fieldLabel">
              <Box component="span" sx={{ mr: 1 }}>
                {props.type.icon ? (
                  props.type.icon
                ) : (
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    title={`The ${props.field.datatype} field type is no longer supported`}
                  />
                )}
              </Box>
              {props.field.label}
            </h1>
            <Box component="small" sx={{ ml: "auto" }}>
              {props.field.datatype}
            </Box>

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
              <ZoomOutMapIcon fontSize="small" />
            </Button>
          </Box>
        </AccordionSummary>
        {/* Conditionally rendering to speed up drag and drop */}
        {props.field.isOpen ? (
          <AccordionDetails>
            <FieldSettings
              className={cx(props.field.deletedAt ? styles.Disabled : null)}
              updateValue={(value, name) => {
                props.dispatch(updateField(props.field.ZUID, name, value));
              }}
              updateFieldSetting={(value, name) => {
                props.dispatch(
                  updateFieldSetting(props.field.ZUID, name, value)
                );
              }}
              field={props.field}
            />
            <Footer
              {...props}
              originalFieldName={originalFieldName}
              setOriginalFieldName={setOriginalFieldName}
            />
          </AccordionDetails>
        ) : (
          ""
        )}
      </Accordion>
    </Box>
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
      {props.field.deletedAt ? (
        <Button
          variant="outlined"
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
          sx={{ mr: 2 }}
        >
          Reactivate
        </Button>
      ) : (
        <Button
          variant="outlined"
          data-cy="deactivated"
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
          sx={{ mr: 2 }}
        >
          Deactivate
        </Button>
      )}
      <Button
        variant="contained"
        color="success"
        data-cy="fieldSave"
        disabled={!props.field.dirty}
        onClick={saveOrWarn}
        startIcon={loading ? <CircularProgress size="20px" /> : <SaveIcon />}
      >
        Save {metaShortcut}
      </Button>
      <ConfirmDialog
        isOpen={warningIsOpen}
        title="Test"
        prompt="Changing the reference name could break JSON endpoints or
            Parsley Views that expect the name as it was. You can change the
            Field Label without needing to change the reference_name. Only
            proceed if you are confident it will not affect your production
            code."
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
          startIcon={loading ? <CircularProgress size="20px" /> : <SaveIcon />}
        >
          Save Changes
        </Button>
      </ConfirmDialog>
    </footer>
  );
}
