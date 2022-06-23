import { useState, useEffect } from "react";
import { connect } from "react-redux";

import { FieldTypeNumber } from "@zesty-io/core/FieldTypeNumber";
import { FormControl, FormLabel } from "@mui/material";
import { VirtualizedAutocomplete } from "@zesty-io/material";

import { fetchAllBins, fetchAllGroups } from "shell/store/media";

import styles from "./ImageOptions.less";
export default connect((state) => {
  return {
    media: state.media,
  };
})(function ImageOptions(props) {
  const [groups, setGroups] = useState([]);

  // load bins/groups on mount
  useEffect(() => {
    props.dispatch(fetchAllBins()).then(() => {
      props.dispatch(fetchAllGroups());
    });
  }, []);

  useEffect(() => {
    setGroups(
      Object.keys(props.media.groups)
        // filter out root nodes
        .filter((id) => id !== "0" && id !== "1")
        .map((id) => {
          const group = props.media.groups[id];
          return {
            value: group.id,
            inputLabel: group.name,
            component: group.name,
          };
        })
    );
  }, [props.media.groups]);

  return (
    <div className={styles.FieldSettings}>
      <div className={styles.Option}>
        <FieldTypeNumber
          name="limit"
          label="Image Limit"
          value={(props.field.settings && props.field.settings.limit) || 1}
          onChange={props.updateFieldSetting}
        />
      </div>

      <div className={styles.Option}>
        <FormControl fullWidth>
          <FormLabel>Lock field to media folder</FormLabel>
          <VirtualizedAutocomplete
            name="group_id"
            label="Queue item for release"
            value={
              groups.find(
                (group) => group.value === props.field.settings.group_id
              ) || null
            }
            onChange={(_, option) =>
              props.updateFieldSetting(option?.value || "0", "group_id")
            }
            placeholder="Select media folder..."
            options={groups}
          />
        </FormControl>
      </div>
    </div>
  );
});
