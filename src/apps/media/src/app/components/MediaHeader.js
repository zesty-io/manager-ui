import { memo, useState } from "react";
import { useSelector } from "react-redux";
import cx from "classnames";

import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

import { MediaCreateGroupModal } from "./MediaCreateGroupModal";
import { MediaEditGroupModal } from "./MediaEditGroupModal";

import styles from "./MediaHeader.less";

export const MediaHeader = memo(function MediaHeader(props) {
  const userRole = useSelector((state) => state.userRole);
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
            variant="contained"
            color="secondary"
            title="Create Group"
            aria-label="Create Group"
            kind="secondary"
            onClick={() => setCreateGroupModal(true)}
            startIcon={<AddIcon />}
          >
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
            variant="contained"
            title="Edit"
            aria-label="Edit"
            onClick={() => setEditGroupModal(true)}
            startIcon={<EditIcon />}
          >
            Edit
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
              variant="contained"
              color="error"
              title="Delete Group"
              aria-label="Delete"
              onClick={props.showDeleteGroupModal}
              startIcon={<DeleteIcon />}
            >
              Delete
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
