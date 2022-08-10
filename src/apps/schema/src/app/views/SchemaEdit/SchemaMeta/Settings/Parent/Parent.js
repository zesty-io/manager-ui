import { useEffect, useMemo } from "react";
import { connect } from "react-redux";

import { FormControl, FormLabel } from "@mui/material";
import { VirtualizedAutocomplete } from "@zesty-io/material";

import { fetchParents } from "../../../../../../store/parents";

export default connect((state) => {
  return {
    parents: state.parents,
  };
})(function Parent(props) {
  useEffect(() => {
    props.dispatch(fetchParents());
  }, []);

  const parentOptions = useMemo(() => {
    return props.parents.map((p) => ({
      value: p.ZUID,
      inputLabel: p.label,
      component: p.label,
    }));
  }, [props.parents]);

  return (
    <div>
      <FormControl fullWidth>
        <FormLabel>Model parent</FormLabel>
        <VirtualizedAutocomplete
          name="parentZUID"
          value={
            parentOptions?.find(
              (parent) => parent.value === props.parentZUID
            ) || null
          }
          helperText="Changing a models parent does not change the item URLs. They have to be changed per item."
          onChange={(_, option) => {
            props.onChange(option?.value || "0", "parentZUID");
          }}
          placeholder="Select model parent..."
          options={parentOptions}
        />
      </FormControl>
    </div>
  );
});
