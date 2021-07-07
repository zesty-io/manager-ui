import { Component } from "react";
import { connect } from "react-redux";

import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { setFilterFormGroup } from "../../../../store/filter";
import { FORM_GROUP_PRESETS } from "./FormGroupSelector.model";

export default connect((state) => {
  return {
    filter: state.filter,
    leads: state.leads,
  };
})(
  class DownloadCSVButton extends Component {
    constructor(props) {
      super(props);

      this.props = props;
      this.state = {
        groups: this.generateFormGroups(props.leads),
      };
    }

    /**
     * Given a list of leads, returns a list of unique Form Groups that can be used in a dropdown
     *
     * @param {Lead[]} leads A list of leads
     */
    generateFormGroups(leads) {
      let uniqueGroups = [...new Set(leads.map((lead) => lead.form))];
      return uniqueGroups.map((group) => {
        return {
          value: group,
          text: group,
        };
      });
    }

    onGroupFilterChange = (value) => {
      this.props.dispatch(setFilterFormGroup(value));
    };

    render() {
      return (
        <div>
          <FieldTypeDropDown
            defaultOptText="All"
            defaultOptValue={FORM_GROUP_PRESETS.ALL}
            label="Form Group"
            name="form-group-filter"
            onChange={this.onGroupFilterChange}
            options={this.state.groups}
            value={FORM_GROUP_PRESETS.ALL}
          />
        </div>
      );
    }
  }
);
