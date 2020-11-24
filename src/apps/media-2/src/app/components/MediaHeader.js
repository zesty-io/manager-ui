import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faEdit,
  faExclamationCircle,
  faVideo
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import styles from "./MediaHeader.less";

export function MediaHeader() {
  return (
    <header className={styles.WorkspaceHeader}>
      <div className={styles.WorkspaceLeft}>
        <h1>Group Name</h1>
        <Button kind="secondary"> Upload</Button>
        <Button kind="cancel">
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </Button>
        <Button kind="warn">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Delete</span>
        </Button>
      </div>
      <div className={styles.WorkspaceRight}>
        <Button kind="default">
          <FontAwesomeIcon icon={faVideo} />
          <span>Tutorial</span>
        </Button>
      </div>
    </header>
  );
}
