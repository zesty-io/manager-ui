import { useEffect } from "react";
import { connect } from "react-redux";

import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { fetchParents } from "../../../../../../store/parents";

export default connect((state) => {
  return {
    parents: state.parents,
  };
})(function Parent(props) {
  useEffect(() => {
    props.dispatch(fetchParents());
  }, []);

  return (
    <div>
      <FieldTypeDropDown
        name="parentZUID"
        label="Model parent"
        description="Changing a models parent does not change the item URLs. They have to be changed per item."
        value={props.parentZUID}
        onChange={props.onChange}
        options={props.parents.map((p) => {
          return {
            value: p.ZUID,
            text: p.label,
          };
        })}
      />
    </div>
  );
});
