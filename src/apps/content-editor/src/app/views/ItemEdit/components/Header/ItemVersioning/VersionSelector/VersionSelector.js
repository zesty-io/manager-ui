import { memo, useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";

import { Box, Select, MenuItem } from "@mui/material";

import { fetchVersions } from "shell/store/contentVersions";

import styles from "./VersionSelector.less";
export default connect((state, props) => {
  const versions = state.contentVersions[props.itemZUID] || [];

  let latestVersionNum = 1;
  if (Array.isArray(versions) && versions.length && versions[0].meta) {
    latestVersionNum = versions[0].meta.version;
  }

  return {
    versions,
    latestVersionNum,
  };
})(
  memo(function VersionSelector(props) {
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
    const onSelect = (e) => {
      const version = props.versions.find(
        (version) => version.meta.version == e.target.value
      );

      if (version) {
        props.dispatch({
          type: "LOAD_ITEM_VERSION",
          itemZUID: props.itemZUID,
          data: version,
        });

        setSelectedVersionNum(version.meta.version);
      }
    };

    return (
      <Select
        name="itemVersion"
        sx={{
          maxWidth: "125px",
          backgroundColor:
            selectedVersionNum !== props.latestVersionNum
              ? "warning.light"
              : "",
        }}
        value={selectedVersionNum}
        loading={loading}
        onChange={onSelect}
        size="small"
      >
        {Array.isArray(props.versions) &&
          props.versions.map((item) => (
            <MenuItem
              key={`${item.meta?.ZUID}-${item.meta?.version}`}
              className={styles.VersionOption}
              value={item.meta?.version}
            >
              Version {item.meta?.version}
              <Box component="small" sx={{ ml: 0.5 }}>
                {" "}
                {moment(item.web?.createdAt).format("MMM Do YYYY, [at] h:mm a")}
              </Box>
            </MenuItem>
          ))}
      </Select>
    );
  })
);
