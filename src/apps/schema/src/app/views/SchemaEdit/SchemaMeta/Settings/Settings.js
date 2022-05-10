import { Fragment, useState } from "react";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";

import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import FileCopyIcon from "@mui/icons-material/FileCopy";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import {
  CollapsibleCard,
  CardContent,
  CardFooter,
} from "@zesty-io/core/CollapsibleCard";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import { Parent } from "./Parent";
import { notify } from "shell/store/notifications";
import { updateModel, saveModel, duplicateModel } from "shell/store/models";

import styles from "./Settings.less";
export default function Settings(props) {
  let history = useHistory();
  const update = (val, name) => {
    props.dispatch(updateModel(props.model.ZUID, name, val));
  };

  return (
    <CollapsibleCard className={styles.ModelSettings} header={Header(props)}>
      <CardContent>
        <FieldTypeText
          name="label"
          label="Display label"
          value={props.model.label}
          onChange={update}
        />

        <FieldTypeText
          name="name"
          label="Parsley reference name (no spaces)"
          value={props.model.name}
          onChange={update}
        />

        <FieldTypeTextarea
          className={styles.FieldTypeTextarea}
          name="description"
          label="Description"
          value={props.model.description}
          maxLength={500}
          onChange={update}
        />

        {/* <label>
        <p>Display in "Add New Item"?</p>
        <ToggleButton
          name="listed"
          offValue="No"
          onValue="Yes"
          value={Number(props.model.listed)}
          onChange={() => update("listed", !props.model.listed)}
        />
      </label>

      <FieldTypeDropDown
        name="sort_by"
        label="Sort table by"
        options={props.fields.map(field => {
          return {
            text: field.label,
            value: field.ZUID
          };
        })}
        onChange={update}
      />

      <FieldTypeDropDown
        name="sort_direction"
        label="Sort direction"
        options={[
          {
            value: "ASC",
            text: "Ascending Order"
          },
          {
            value: "DSC",
            text: "Descending Order"
          }
        ]}
        onChange={update}
      /> */}

        <Parent parentZUID={props.model.parentZUID} onChange={update} />
      </CardContent>
      <Footer {...props} />
    </CollapsibleCard>
  );
}

function Header(props) {
  return (
    <Fragment>
      <FontAwesomeIcon icon={faCog} />
      &nbsp;Model Settings
    </Fragment>
  );
}

function Footer(props) {
  const [loading, setLoading] = useState(false);

  const duplicate = () => {
    setLoading(true);
    props
      .dispatch(duplicateModel(props.model.ZUID))
      .then((res) => {
        if (res.status === 200) {
          history.pushState(`/schema/${res.data.ZUID}/`);
        } else {
          props.dispatch(
            notify({
              kind: "warn",
              message: res.error,
            })
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Settings:duplicate:catch", err);
        props.dispatch(
          notify({
            kind: "warn",
            message:
              err.message || `Failed to duplicate model: ${props.model.label}`,
          })
        );
        setLoading(false);
      });
  };

  return (
    <CardFooter className={styles.CardFooter}>
      <ButtonGroup>
        <Button
          variant="contained"
          color="success"
          disabled={!props.model.dirty || loading}
          onClick={() => {
            setLoading(true);
            props
              .dispatch(saveModel(props.model.ZUID, props.model))
              .then((res) => {
                if (res.status === 200) {
                  props.dispatch(
                    notify({
                      kind: "save",
                      message: `Save ${props.model.label} changes`,
                    })
                  );
                } else {
                  console.error(res);
                  props.dispatch(
                    notify({
                      kind: "warn",
                      message: `${res.error}`,
                    })
                  );
                }
                setLoading(false);
              })
              .catch((err) => {
                console.err(err);
                props.dispatch(
                  notify({
                    kind: "warn",
                    message: `Failed saving ${props.model.label} changes. ${err.message}`,
                  })
                );
                setLoading(false);
              });
          }}
          startIcon={loading ? <CircularProgress size="20px" /> : <SaveIcon />}
        >
          Save Model
        </Button>
        <Button
          variant="contained"
          onClick={duplicate}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size="20px" /> : <FileCopyIcon />
          }
        >
          Duplicate Model
        </Button>
      </ButtonGroup>
    </CardFooter>
  );
}
