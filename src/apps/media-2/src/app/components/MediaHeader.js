import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUpload,
  faEdit,
  faExclamationCircle,
  faVideo
} from "@fortawesome/free-solid-svg-icons";

import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";

import styles from "./MediaHeader.less";

export function MediaHeader() {
  return (
    <header className={styles.WorkspaceHeader}>
      <div className={styles.WorkspaceLeft}>
        <Button kind="secondary">
          <FontAwesomeIcon icon={faUpload} />
          <span>Group Name</span>
        </Button>
        <Button kind="secondary"> Upload</Button>
      </div>
      <div className={styles.WorkspaceRight}>
        <Button kind="cancel">
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </Button>
        <Button kind="warn">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Delete</span>
        </Button>

        <Button kind="default">
          <FontAwesomeIcon icon={faVideo} />
          <span>Tutorial</span>
        </Button>
      </div>
    </header>
  );
}
