import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import GlobalSearch from "shell/components/global-search";

import styles from "./Header.less";
export function Header(props) {
  return (
    <header className={styles.Header}>
      <GlobalSearch />
      <Button>
        <FontAwesomeIcon icon={faCloudUploadAlt} />
        Publish All
      </Button>
    </header>
  );
}
