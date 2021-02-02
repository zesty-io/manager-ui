import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExclamationCircle,
  faPlus
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { MediaCreateGroupModal } from "./MediaCreateGroupModal";
import { MediaEditGroupModal } from "./MediaEditGroupModal";
import styles from "./MediaHeader.less";

export const MediaHeader = React.memo(function MediaHeader(props) {
  const userRole = useSelector(state => state.userRole);
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
            aria-label="Edit"
            onClick={() => setEditGroupModal(true)}
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </Button>
        ) : null}
        {/* hide in search context */

        !props.searchTerm &&
        /* hide for bins */
        props.currentBin !== props.currentGroup &&
        /* hide for Contributor */
        userRole.name !== "Contributor" ? (
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
        {/* hide tutorial until new video is published */}
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
