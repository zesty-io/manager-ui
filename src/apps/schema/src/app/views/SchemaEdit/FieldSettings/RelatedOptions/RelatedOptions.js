import { useState, useEffect, useMemo } from "react";
import { connect } from "react-redux";

import { FormControl, FormLabel, Box } from "@mui/material";
import { VirtualizedAutocomplete } from "@zesty-io/material";

import { fetchFields } from "shell/store/fields";

import styles from "./RelatedOptions.less";
export default connect((state) => {
  return {
    models: Object.keys(state.models).map(
      (modelZUID) => state.models[modelZUID]
    ),
    fields: Object.keys(state.fields).map(
      (fieldZUID) => state.fields[fieldZUID]
    ),
  };
})(function RelatedOptions(props) {
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const modelOptions = useMemo(() => {
    return props.models.map((m) => {
      return {
        value: m.ZUID,
        inputLabel: m.label,
        component: m.label,
      };
    });
  }, [props.models]);

  const fieldOptions = useMemo(() => {
    return props.fields
      .filter((f) => f.contentModelZUID === props.field.relatedModelZUID)
      .map((f) => {
        return {
          value: f.ZUID,
          inputLabel: f.label,
          component: f.label,
        };
      });
  }, [props.fields, props.field.relatedModelZUID]);

  // Load related model fields
  useEffect(() => {
    if (selectedModel?.value) {
      setLoading(true);
      props
        .dispatch(fetchFields(selectedModel.value))
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  }, [selectedModel]);

  return (
    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
      <FormControl fullWidth>
        <FormLabel>Related model</FormLabel>
        <VirtualizedAutocomplete
          name="relatedModelZUID"
          value={
            modelOptions?.find(
              (model) => model.value === props.field.relatedModelZUID
            ) || null
          }
          onChange={(_, option) => {
            setSelectedModel(option);
            // when changing the model reset the selected field
            props.updateValue("0", "relatedFieldZUID");
            props.updateValue(option?.value || "0", "relatedModelZUID");
          }}
          placeholder="Select related model..."
          options={modelOptions}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>Model field to display</FormLabel>
        <VirtualizedAutocomplete
          name="relatedFieldZUID"
          value={
            fieldOptions?.find(
              (field) => field.value === props.field.relatedFieldZUID
            ) || null
          }
          onChange={(_, option) => {
            props.updateValue(option?.value || "0", "relatedFieldZUID");
          }}
          placeholder="Select field to display..."
          options={fieldOptions}
          loading={loading}
        />
      </FormControl>
    </Box>
  );
});
