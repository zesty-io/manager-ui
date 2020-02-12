import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { FieldAdd } from "./FieldAdd";
import { FieldEdit } from "./FieldEdit";
import { SchemaMeta } from "./SchemaMeta";

import { Dropzone } from "./Dropzone";
import { Draggable } from "./Draggable";

import { notify } from "shell/store/notifications";
import { fetchFields, saveField } from "shell/store/fields";
import { FIELD_TYPES } from "./FieldSettings";

import styles from "./SchemaEdit.less";
export default connect((state, props) => {
  const { modelZUID, fieldZUID } = props.match.params;
  return {
    fieldZUID,
    modelZUID,
    model: state.models[modelZUID] || {},
    fields: Object.keys(state.fields)
      .map(key => state.fields[key])
      .filter(field => field.contentModelZUID === modelZUID)
      .sort((fieldA, fieldB) => fieldA.sort - fieldB.sort)
  };
})(function SchemaEdit(props) {
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState(false);

  // Load schema fields to edit when the schema changes
  useEffect(() => {
    setLoading(false);
    props
      .dispatch(fetchFields(props.modelZUID))
      .then(() => {
        setLoading(true);
      })
      .catch(err => {
        console.error("fetchFields()", err);
        notify({
          kind: "warn",
          message: `There was an error loading the schema fields. ${err.message}`
        });
        setLoading(true);
      });
  }, [props.modelZUID]);

  const updateFieldSort = children => {
    setSorting(true);

    // Re-sort to match index
    const sorted = children.map((child, i) => {
      return {
        ...child.props.children.props.field,
        sort: i
      };
    });

    // Generate field update request for each field
    Promise.all(
      sorted.map(field => {
        return props.dispatch(
          saveField(field.contentModelZUID, field.ZUID, field)
        );
      })
    )
      .then(() => {
        props.dispatch({
          type: "FETCH_FIELDS_SUCCESS",
          payload: sorted.reduce((acc, field) => {
            acc[field.ZUID] = field;
            return acc;
          }, {})
        });

        notify({
          kind: "save",
          message: `${props.model.label} field order updated`
        });

        setSorting(false);
      })
      .catch(err => {
        setSorting(false);
        notify({
          kind: "warn",
          message: err.message
        });
        console.error(err);
      });
  };

  return (
    <WithLoader
      condition={loading}
      message={`Loading ${props.model.label} Schema`}
    >
      <section className={styles.SchemaEdit}>
        <div className={styles.content}>
          <main className={cx("Fields", styles.Fields)}>
            <FieldAdd
              modelZUID={props.modelZUID}
              dispatch={props.dispatch}
              firstField={!props.fields.length}
            />

            <WithLoader condition={!sorting} message="Sorting Fields">
              <Dropzone onDrop={updateFieldSort}>
                {props.fields
                  .filter(field => !field.deletedAt)
                  .map(field => {
                    const type = FIELD_TYPES.find(
                      type => type.value === field.datatype
                    );

                    if (field.ZUID === props.fieldZUID) {
                      field.isOpen = true;
                    }

                    return (
                      <Draggable key={field.ZUID}>
                        <FieldEdit
                          dispatch={props.dispatch}
                          type={type || {}}
                          field={field}
                        />
                      </Draggable>
                    );
                  })}
              </Dropzone>
            </WithLoader>

            <div className={styles.Deactivated}>
              <h2 className={styles.Title}>De-activated Fields</h2>
              {props.fields
                .filter(field => field.deletedAt)
                .map(field => {
                  const type = FIELD_TYPES.find(
                    type => type.value === field.datatype
                  );

                  if (field.ZUID === props.fieldZUID) {
                    field.isOpen = true;
                  }

                  return (
                    <FieldEdit
                      key={field.ZUID}
                      dispatch={props.dispatch}
                      type={type || {}}
                      field={field}
                    />
                  );
                })}
            </div>
          </main>
          <SchemaMeta
            dispatch={props.dispatch}
            model={props.model}
            fields={props.fields}
          />
        </div>
      </section>
    </WithLoader>
  );
});
