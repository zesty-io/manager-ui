import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";

import { Select, Option } from "@zesty-io/core/Select";

import { fetchVersions } from "shell/store/contentVersions";

import styles from "./VersionSelector.less";
export default function VersionSelector(props) {
  const dispatch = useDispatch();

  const versions = useSelector(
    (state) => state.contentVersions[props.itemZUID]
  );
  const latestVersionNum = useSelector((state) => {
    if (
      state.contentVersions[props.itemZUID] &&
      state.contentVersions[props.itemZUID][0] &&
      state.contentVersions[props.itemZUID][0]?.meta?.version
    ) {
      return state.contentVersions[props.itemZUID][0].meta.version;
    } else {
      return 1;
    }
  });

  const [loading, setLoading] = useState(true);
  const [selectedVersionNum, setSelectedVersionNum] =
    useState(latestVersionNum);

  // Load versions
  useEffect(() => {
    dispatch(fetchVersions(props.modelZUID, props.itemZUID)).finally(() => {
      setLoading(false);
    });
  }, [props.modelZUID, props.itemZUID]);

  // Update after save
  useEffect(() => {
    setSelectedVersionNum(latestVersionNum);
  }, [latestVersionNum]);

  // Set item editing view to selected version
  const onSelect = useCallback(
    (versionNumber) => {
      const version = versions.find(
        (version) => version.meta.version == versionNumber
      );

      if (version) {
        dispatch({
          type: "LOAD_ITEM_VERSION",
          itemZUID: props.itemZUID,
          data: version,
        });

        setSelectedVersionNum(version.meta.version);
      }
    },
    [props.itemZUID, versions]
  );

  return (
    <Select
      name="itemVersion"
      className={cx(
        styles.VersionSelector,
        selectedVersionNum !== latestVersionNum ? styles.NotLatest : null
      )}
      value={selectedVersionNum}
      loading={loading}
      onSelect={onSelect}
    >
      {Array.isArray(versions) &&
        versions.map((item) => (
          <Option
            key={item.meta?.version}
            className={styles.VersionOption}
            value={item.meta?.version}
            html={`Version ${item.meta?.version}   <small>${moment(
              item.web?.createdAt
            ).format("MMM Do YYYY, [at] h:mm a")}</small>`}
          />
        ))}
    </Select>
  );
}
