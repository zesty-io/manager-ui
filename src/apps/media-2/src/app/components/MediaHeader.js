import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faEdit,
  faExclamationCircle,
  faVideo,
  faPlus
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { MediaCreateGroupModal } from "./MediaCreateGroupModal";
import { MediaEditGroupModal } from "./MediaEditGroupModal";
import styles from "./MediaHeader.less";

export const MediaHeader = React.memo(function MediaHeader(props) {
  const dispatch = useDispatch();
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [editGroupModal, setEditGroupModal] = useState(false);

  return (
    <header className={styles.WorkspaceHeader}>
      <div className={styles.WorkspaceLeft}>
        <h1 className={styles.GroupTitle}>{props.currentGroup.name}</h1>
        {props.numFiles ? (
          <h1 className={styles.GroupCount}>{` (${props.numFiles})`}</h1>
        ) : null}
        <Button
          aria-label="Create Group"
          kind="secondary"
          onClick={() => setCreateGroupModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Create Group</span>
        </Button>
        {createGroupModal && (
          <MediaCreateGroupModal
            currentGroup={props.currentGroup}
            currentBin={props.currentBin}
            onClose={() => setCreateGroupModal(false)}
            setCurrentGroupID={props.setCurrentGroupID}
          />
        )}

        <Button kind="cancel" onClick={() => setEditGroupModal(true)}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </Button>
        {props.currentBin !== props.currentGroup && (
          <Button kind="warn" onClick={props.showDeleteGroupModal}>
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>Delete</span>
          </Button>
        )}
      </div>
      <div className={styles.WorkspaceRight}>
        <Button kind="default">
          <FontAwesomeIcon icon={faVideo} />
          <span>Tutorial</span>
        </Button>
      </div>
      {editGroupModal && (
        <MediaEditGroupModal
          currentGroup={props.currentGroup}
          currentBin={props.currentBin}
          onClose={() => setEditGroupModal(false)}
        />
      )}
    </header>
  );
});
