import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { addStep, publishAll } from "shell/store/publishPlan";
import { fetchVersions } from "shell/store/contentVersions";
import { Button } from "@zesty-io/core/Button";
import ContentSearch from "shell/components/ContentSearch";
import styles from "./Header.less";

export function Header(props) {
  const dispatch = useDispatch();
  const onSelect = useCallback(
    item => {
      dispatch(
        addStep({
          ZUID: item.meta.ZUID,
          version: item.meta.version,
          status: "idle"
        })
      );
      dispatch(fetchVersions(item.meta.contentModelZUID, item.meta.ZUID));
    },
    [dispatch]
  );
  const onPublishAll = useCallback(() => {
    dispatch(publishAll());
  }, [dispatch]);
  return (
    <header className={styles.Header}>
      <h1 className={styles.display}>Publish Plan</h1>
      <ContentSearch
        placeholder="Search for items to include in your publish plan"
        onSelect={onSelect}
      />
      <Button
        kind="alt"
        disabled={!props.canPublish && "disabled"}
        onClick={onPublishAll}
      >
        <FontAwesomeIcon icon={faCloudUploadAlt} />
        Publish All
      </Button>
    </header>
  );
}
