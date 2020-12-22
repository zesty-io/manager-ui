import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { FieldTypeNumber } from "@zesty-io/core/FieldTypeNumber";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { fetchAllBins, fetchAllGroups } from "shell/store/media";

import styles from "./ImageOptions.less";
export default connect(state => {
  return {
    media: state.media
  };
})(function ImageOptions(props) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    props.dispatch(fetchAllBins());
  }, []); // fire once to load initial bins

  useEffect(() => {
    props.dispatch(fetchAllGroups());
  }, [props.media.bins.length]); // fetch all groups

  useEffect(() => {
    setGroups(
      props.media.groups.map(group => {
        return {
          value: group.id,
          text: group.name
        };
      })
    );
  }, [props.media.groups.length]);

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
        <FieldTypeDropDown
          name="group_id"
          label="Lock field to media folder"
          value={props.field.settings && props.field.settings.group_id}
          onChange={props.updateFieldSetting}
          options={groups}
        />
      </div>
    </div>
  );
});
