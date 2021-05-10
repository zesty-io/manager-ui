import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import GlobalSearch from "shell/components/global-search";

import styles from "./Header.less";
export function Header(props) {
  return (
    <header className={styles.Header}>
      <h1 className={styles.display}>Publish Plan</h1>
      <GlobalSearch placeholder="Search for items to include in your publish plan" />
      <Button kind="alt" disabled={!props.canPublish && "disabled"}>
        <FontAwesomeIcon icon={faCloudUploadAlt} />
        Publish All
      </Button>
    </header>
  );
}
