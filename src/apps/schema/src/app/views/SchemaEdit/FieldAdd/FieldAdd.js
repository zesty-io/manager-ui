import { Fragment, useState } from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";

import Button from "@mui/material/Button";

import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import Link from "@mui/material/Link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkSquareAlt,
  faHandPointUp,
} from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { FieldSettings, FIELD_TYPES } from "../FieldSettings";

import { notify } from "shell/store/notifications";
import { createField } from "shell/store/fields";

import styles from "./FieldAdd.less";
export function FieldAdd(props) {
  let history = useHistory();

  const initialState = {
    contentModelZUID: props.modelZUID,
    datatype: "0",
    name: "",
    label: "",
    description: "",
    required: false,
    settings: {
      list: true,
    },
    sort: 10000,
    dirty: false,
  };
  const [field, setField] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const create = () => {
    // TODO validate fields

    if (!field.label) {
      props.dispatch(
        notify({
          kind: "warn",
          message: "Missing required field label",
        })
      );
      return;
    }
    if (!field.name) {
      props.dispatch(
        notify({
          kind: "warn",
          message: "Missing required field name",
        })
      );
      return;
    }

    setLoading(true);

    props
      .dispatch(createField(props.modelZUID, field))
      .then((res) => {
        setLoading(false);

        if (res.status === 201) {
          props.dispatch(
            notify({
              kind: "save",
              message: `Created new field: ${field.label}`,
            })
          );
          setField(initialState);
          history.push(`/schema/${props.modelZUID}/field/${res.data.ZUID}`);
        } else {
          props.dispatch(
            notify({
              kind: "warn",
              message: `${res.error}`,
            })
          );
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        props.dispatch(
          notify({
            kind: "warn",
            message: err.message,
          })
        );
      });
  };

  return (
    <Card
      className={cx("FieldAdd", styles.FieldAdd)}
      sx={{ m: 2, overflow: "visible" }}
    >
      <CardContent>
        <FieldTypeDropDown
          className={styles.Type}
          name="type"
          options={FIELD_TYPES}
          defaultOptText="— Select a Field Type —"
          onChange={(val) => {
            setField({ ...field, datatype: val });
          }}
        />

        {/* <div className={styles.description}>{fieldType.description}</div> */}

        {field.datatype == 0 && (
          <Fragment>
            {props.firstField && (
              <div className={styles.AlignHeader}>
                <FontAwesomeIcon icon={faHandPointUp} />
                <h1>Get started by selecting this models first field type</h1>
              </div>
            )}
            <p>
              Fields provide the model structure and guidance to content editors
              on what type of content to provide.
            </p>
            <p>
              <Link
                underline="none"
                color="secondary"
                href="https://zesty.org/services/web-engine/interface/schema/fields"
                target="_blank"
                title="Learn more about fields and their types"
              >
                <FontAwesomeIcon icon={faExternalLinkSquareAlt} />
                &nbsp;Learn more about fields and their types.
              </Link>
            </p>
          </Fragment>
        )}

        {field.datatype != 0 && (
          <FieldSettings
            field={field}
            new={true}
            dispatch={props.dispatch}
            updateValue={(val, name) => {
              if (val === null) return;
              setField({
                ...field,
                [name]: val,
                dirty: true,
              });
            }}
            updateMultipleValues={(values) => {
              setField({
                ...field,
                ...values,
                dirty: true,
              });
            }}
            updateFieldSetting={(val, name) => {
              if (val === null) return;
              setField({
                ...field,
                settings: {
                  ...field.settings,
                  [name]: val,
                },
                dirty: true,
              });
            }}
          />
        )}
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="success"
          data-cy="addField"
          disabled={!field.dirty || loading}
          onClick={create}
          startIcon={loading ? <CircularProgress size="20px" /> : <AddIcon />}
        >
          Add Field
        </Button>
      </CardActions>
    </Card>
  );
}
