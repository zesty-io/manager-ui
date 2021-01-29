import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [editGroupModal, setEditGroupModal] = useState(false);

  return (
    <header className={styles.WorkspaceHeader}>
      <div className={styles.WorkspaceLeft}>
        {props.numFiles ? (
          <h1 className={styles.GroupCount}>{` (${props.numFiles})`}</h1>
        ) : null}
        <h1 className={styles.GroupTitle}>
          {props.searchTerm
            ? `Search Results "${props.searchTerm}"`
            : props.currentGroup.name}
        </h1>
      </div>
      <div className={styles.WorkspaceRight}>
        {!props.searchTerm ? (
          <Button
            title="Create Group"
            aria-label="Create Group"
            kind="secondary"
            onClick={() => setCreateGroupModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Sub Group</span>
          </Button>
        ) : null}
        {createGroupModal && (
          <MediaCreateGroupModal
            currentGroup={props.currentGroup}
            currentBin={props.currentBin}
            onClose={() => setCreateGroupModal(false)}
            setCurrentGroupID={props.setCurrentGroupID}
          />
        )}

        {!props.searchTerm ? (
          <Button
            kind="cancel"
            title="Edit"
            onClick={() => setEditGroupModal(true)}
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </Button>
        ) : null}
        {!props.searchTerm && props.currentBin !== props.currentGroup ? (
          <Button
            title="Delete Group"
            kind="warn"
            aria-label="Delete"
            onClick={props.showDeleteGroupModal}
          >
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>Delete</span>
          </Button>
        ) : null}
        {/* <Button title="Tutorial Video" kind="default" aria-label="Tutorial">
          <FontAwesomeIcon icon={faVideo} />
          <span>Tutorial</span>
        </Button> */}
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
