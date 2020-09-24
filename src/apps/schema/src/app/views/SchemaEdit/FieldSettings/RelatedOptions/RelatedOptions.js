import React, { useState, useEffect, useMemo } from "react";
import { connect } from "react-redux";

import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { fetchFields } from "shell/store/fields";

import styles from "./RelatedOptions.less";
export default connect(state => {
  return {
    models: Object.keys(state.models).map(modelZUID => state.models[modelZUID]),
    fields: Object.keys(state.fields).map(fieldZUID => state.fields[fieldZUID])
  };
})(function RelatedOptions(props) {
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    props.field.relatedModelZUID
  );
  const [selectedField, setSelectedField] = useState(
    props.field.relatedFieldZUID
  );

  const fieldOptions = useMemo(() => {
    return props.fields
      .filter(f => f.contentModelZUID === selectedModel)
      .map(f => {
        return {
          value: f.ZUID,
          text: f.label
        };
      });
  }, [props.fields]);

  // Load related model fields
  useEffect(() => {
    if (selectedModel) {
      setLoading(true);
      props
        .dispatch(fetchFields(selectedModel))
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  }, [selectedModel]);

  return (
    <div className={styles.FieldSettings}>
      {/* <h2 className={styles.Title}>Related Field Settings</h2> */}

      <div className={styles.Option}>
        <div className={styles.Values}>
          <FieldTypeDropDown
            name="relatedModelZUID"
            label="Related model"
            value={selectedModel}
            onChange={(val, name) => {
              setSelectedModel(val);
              // when changing the model reset the selected field
              setSelectedField("0");

              props.updateValue(name, val);
            }}
            options={props.models.map(m => {
              return {
                value: m.ZUID,
                text: m.label
              };
            })}
          />

          <FieldTypeDropDown
            name="relatedFieldZUID"
            label="Model field to display"
            value={selectedField}
            onChange={(val, name) => {
              setSelectedField(val);
              props.updateValue(name, val);
            }}
            options={fieldOptions}
            disabled={!fieldOptions.length}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
});
