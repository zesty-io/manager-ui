import { Component } from "react";
import { connect } from "react-redux";

import { FormControl, FormLabel } from "@mui/material";
import { VirtualizedAutocomplete } from "@zesty-io/material";

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
        groups: [
          {
            value: FORM_GROUP_PRESETS.ALL,
            inputLabel: FORM_GROUP_PRESETS.ALL,
            component: FORM_GROUP_PRESETS.ALL,
          },
          ...this.generateFormGroups(props.leads),
        ],
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
          inputLabel: group,
          component: group,
        };
      });
    }

    onGroupFilterChange = (value) => {
      this.props.dispatch(setFilterFormGroup(value));
    };

    render() {
      return (
        <FormControl fullWidth>
          <FormLabel>Form Group</FormLabel>
          <VirtualizedAutocomplete
            name="form-group-filter"
            defaultValue={{
              value: FORM_GROUP_PRESETS.ALL,
              inputLabel: FORM_GROUP_PRESETS.ALL,
              component: FORM_GROUP_PRESETS.ALL,
            }}
            onChange={(_, option) => {
              this.onGroupFilterChange(option.value);
            }}
            placeholder="Select release..."
            options={this.state.groups}
            disableClearable
          />
        </FormControl>
      );
    }
  }
);
