import React from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

import { addStep } from "shell/store/publishPlan";
import { Button } from "@zesty-io/core/Button";
import ContentSearch from "shell/components/ContentSearch";
import styles from "./Header.less";

export function Header(props) {
  const dispatch = useDispatch();
  return (
    <header className={styles.Header}>
      <h1 className={styles.display}>Publish Plan</h1>
      <ContentSearch
        placeholder="Search for items to include in your publish plan"
        onSelect={item => {
          dispatch(
            addStep({ ZUID: item.meta.ZUID, version: item.meta.version })
          );
        }}
      />
      <Button kind="alt" disabled={!props.canPublish && "disabled"}>
        <FontAwesomeIcon icon={faCloudUploadAlt} />
        Publish All
      </Button>
    </header>
  );
}
