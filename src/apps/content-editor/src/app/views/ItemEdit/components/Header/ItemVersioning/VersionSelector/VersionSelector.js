import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";

import { Select, Option } from "@zesty-io/core/Select";

import { fetchVersions } from "shell/store/contentVersions";

import styles from "./VersionSelector.less";
export default connect((state, props) => {
  const versions = state.contentVersions[props.itemZUID] || [];

  let latestVersionNum = 1;
  if (Array.isArray(versions) && versions.length) {
    latestVersionNum = versions[0].meta.version;
  }

  return {
    versions,
    latestVersionNum
  };
})(
  React.memo(function VersionSelector(props) {
    const [loading, setLoading] = useState(true);
    const [selectedVersionNum, setSelectedVersionNum] = useState(
      props.latestVersionNum
    );

    // Load versions
    useEffect(() => {
      props
        .dispatch(fetchVersions(props.modelZUID, props.itemZUID))
        .finally(() => {
          setLoading(false);
        });
    }, [props.modelZUID, props.itemZUID]);

    // Update after save
    useEffect(() => {
      setSelectedVersionNum(props.latestVersionNum);
    }, [props.latestVersionNum]);

    // Set item editing view to selected version
    const onSelect = versionNumber => {
      const version = props.versions.find(
        version => version.meta.version == versionNumber
      );

      if (version) {
        props.dispatch({
          type: "LOAD_ITEM_VERSION",
          itemZUID: props.itemZUID,
          data: version
        });

        setSelectedVersionNum(version.meta.version);
      }
    };

    return (
      <Select
        name="itemVersion"
        className={cx(
          styles.VersionSelector,
          selectedVersionNum !== props.latestVersionNum
            ? styles.NotLatest
            : null
        )}
        value={selectedVersionNum}
        loading={loading}
        onSelect={onSelect}
      >
        {props.versions.map(item => (
          <Option
            key={`${item.meta.ZUID}-${item.meta.version}`}
            className={styles.VersionOption}
            value={item.meta.version}
            html={`Version ${item.meta.version} <small>${moment(
              item.web.createdAt
            ).format("MMM Do YYYY, [at] h:mm a")}</small>`}
          />
        ))}
      </Select>
    );
  })
);
