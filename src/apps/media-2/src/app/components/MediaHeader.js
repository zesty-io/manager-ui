import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faEdit,
  faExclamationCircle,
  faVideo
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import styles from "./MediaHeader.less";

export function MediaHeader(props) {
  const hiddenFileInput = useRef(null);

  function handleUploadClick() {
    hiddenFileInput.current.click();
  }

  function handleFileInputChange(event) {
    const file = event.target.files[0];
    uploadFile(file);
  }

  function uploadFile(file) {
    let data = new FormData();
    data.append("file", file);
    data.append("bin_id", props.currentBin.id);
    if (props.currentGroup) {
      data.append("group_id", props.currentGroup.id);
    }
    data.append("user_id", zestyStore.getState().user.ZUID);

    let request = new XMLHttpRequest();
    request.open(
      "POST",
      `${CONFIG.SERVICE_MEDIA_STORAGE}/upload/${props.currentBin.storage_driver}/${props.currentBin.storage_name}`
    );

    // upload progress event
    request.upload.addEventListener("progress", function(e) {
      // upload progress as percentage
      let percent_completed = (e.loaded / e.total) * 100;
      console.log(percent_completed);
    });

    request.addEventListener("load", function(e) {
      // HTTP status message (200, 404 etc)
      console.log(request.status);
      if (request.status === 200) {
        console.log(request.response);
        // request.response.data[0]
      }
    });

    request.send(data);
  }

  return (
    <header className={styles.WorkspaceHeader}>
      <div className={styles.WorkspaceLeft}>
        <h1>Group Name</h1>
        <Button kind="secondary" onClick={handleUploadClick}>
          <FontAwesomeIcon icon={faUpload} />
          <span>Upload</span>
        </Button>
        <input
          type="file"
          ref={hiddenFileInput}
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />
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
