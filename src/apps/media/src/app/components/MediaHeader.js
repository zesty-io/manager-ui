import React, { useState } from "react";
import { useSelector } from "react-redux";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

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
      <h1 className={cx(styles.subheadline, styles.Title)}>
        <small className={styles.NumFiles}>({props.numFiles})</small>
        {props.searchTerm
          ? `Search Results "${props.searchTerm}"`
          : props.currentGroup.name}
      </h1>

      {!props.searchTerm && (
        <div className={styles.Actions}>
          <Button
            title="Create Group"
            aria-label="Create Group"
            kind="secondary"
            onClick={() => setCreateGroupModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Sub Group</span>
          </Button>

          {createGroupModal && (
            <MediaCreateGroupModal
              currentGroup={props.currentGroup}
              currentBin={props.currentBin}
              onClose={() => setCreateGroupModal(false)}
              setCurrentGroupID={props.setCurrentGroupID}
            />
          )}

          <Button
            kind="cancel"
            title="Edit"
            aria-label="Edit"
            onClick={() => setEditGroupModal(true)}
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </Button>
          {editGroupModal && (
            <MediaEditGroupModal
              currentGroup={props.currentGroup}
              currentBin={props.currentBin}
              onClose={() => setEditGroupModal(false)}
            />
          )}

          {/* Only show delete for groups and users who role is greater than contributor */}
          {props.currentBin !== props.currentGroup &&
          userRole.name !== "Contributor" ? (
            <Button
              title="Delete Group"
              kind="warn"
              aria-label="Delete"
              onClick={props.showDeleteGroupModal}
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>Delete</span>
            </Button>
          ) : null}

          {/* hide tutorial until new video is published */}
          {/* <Button title="Tutorial Video" kind="default" aria-label="Tutorial">
            <FontAwesomeIcon icon={faVideo} />
            <span>Tutorial</span>
          </Button> */}
        </div>
      )}
    </header>
  );
});
