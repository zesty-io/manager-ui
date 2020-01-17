import React, { useState, useReducer } from "react";
import cx from "classnames";

import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";

import { FieldSettings, FIELD_TYPES } from "../FieldSettings";

import { notify } from "shell/store/notifications";
import { createField } from "../../../../store/schemaFields";

import styles from "./FieldAdd.less";
export function FieldAdd(props) {
  const initialState = {
    contentModelZUID: props.modelZUID,
    datatype: "0",
    name: "",
    label: "",
    description: "",
    required: false,
    settings: {
      list: true
    },
    sort: 10000,
    dirty: false
  };
  const [field, setField] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const create = () => {
    // TODO validate fields

    if (!field.label) {
      notify({
        kind: "warn",
        message: "Missing required field label"
      });
      return;
    }
    if (!field.name) {
      notify({
        kind: "warn",
        message: "Missing required field name"
      });
      return;
    }

    setLoading(true);

    props
      .dispatch(createField(props.modelZUID, field))
      .then(res => {
        setLoading(false);

        if (res.status === 201) {
          notify({
            kind: "save",
            message: `Created new field: ${field.label}`
          });
          setField(initialState);
          window.location = `/schema/${props.modelZUID}/field/${res.data.ZUID}`;
        } else {
          notify({
            kind: "warn",
            message: `${res.error}`
          });
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        notify({
          kind: "warn",
          message: err.message
        });
      });
  };

  return (
    <Card className={cx("FieldAdd", styles.FieldAdd)}>
      <CardContent>
        <FieldTypeDropDown
          className={styles.Type}
          name="type"
          options={FIELD_TYPES}
          defaultOptText="— Select a Field Type —"
          onChange={(key, val) => {
            setField({ ...field, datatype: val });
          }}
        />

        {/* <div className={styles.description}>{fieldType.description}</div> */}

        {field.datatype == 0 && (
          <React.Fragment>
            {props.firstField && (
              <h1>
                <i className="far fa-hand-point-up" />
                &nbsp; Get started by selecting this models first field type
              </h1>
            )}
            <p>
              Fields provide the model structure and guidance to content editors
              on what type of content to provide.
            </p>
            <p>
              <Url
                href="https://zesty.org/services/web-engine/interface/schema/fields"
                target="_blank"
              >
                <i className="fas fa-external-link-square-alt" />
                &nbsp;Learn more about fields and their types.
              </Url>
            </p>
          </React.Fragment>
        )}

        {field.datatype != 0 && (
          <FieldSettings
            field={field}
            new={true}
            dispatch={props.dispatch}
            updateValue={(name, val) =>
              setField({
                ...field,
                [name]: val,
                dirty: true
              })
            }
            updateMultipleValues={values => {
              setField({
                ...field,
                ...values,
                dirty: true
              });
            }}
            updateFieldSetting={(name, val) =>
              setField({
                ...field,
                settings: {
                  ...field.settings,
                  [name]: val
                },
                dirty: true
              })
            }
          />
        )}
      </CardContent>
      <CardFooter>
        <Button kind="save" disabled={!field.dirty || loading} onClick={create}>
          {loading ? (
            <i className="fas fa-spinner" />
          ) : (
            <i className="fa fa-plus" aria-hidden="true" />
          )}
          Add Field
        </Button>
      </CardFooter>
    </Card>
  );
}
