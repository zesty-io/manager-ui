import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { MediaSidebar } from "./components/MediaSidebar";
import { MediaWorkspace } from "./components/MediaWorkspace";
import { MediaHeader } from "./components/MediaHeader";
import { MediaDetailsModal } from "./components/MediaDetailsModal";
import { MediaDeleteGroupModal } from "./components/MediaDeleteGroupModal";
import { MediaSelected } from "./components/MediaSelected";

import {
  fetchAllMediaBins,
  fetchAllGroups,
  fetchBinFiles,
  fetchGroupFiles
} from "shell/store/media";
import styles from "./MediaApp.less";

export default connect((state, props) => {
  let files;
  let currentGroup;
  let currentBin;
  if (props.match.params.groupID) {
    files = state.media.files.filter(
      file => file.group_id === props.match.params.groupID
    );
    currentGroup = state.media.groups.find(
      group => group.id === props.match.params.groupID
    );
    if (currentGroup) {
      currentBin = state.media.bins.find(bin => bin.id === currentGroup.bin_id);
    }
  } else if (props.match.params.binID) {
    files = state.media.files.filter(
      file => file.group_id === props.match.params.binID
    );
    currentBin = state.media.bins.find(
      bin => bin.id === props.match.params.binID
    );
  } else {
    files = [];
  }
  return {
    currentGroup,
    currentBin,
    files,
    media: state.media
  };
})(function MediaApp(props) {
  const [fileDetails, setFileDetails] = useState();
  const [deleteGroupModal, setDeleteGroupModal] = useState(false);
  const [selected, setSelected] = useState([]);

  function toggleSelected(file) {
    const fileIndex = selected.findIndex(
      selectedFile => selectedFile.id === file.id
    );
    if (fileIndex !== -1) {
      const newSelected = [...selected];
      newSelected.splice(fileIndex, 1);
      setSelected(newSelected);
    } else {
      setSelected([...selected, file]);
    }
  }

  // always fetch all bins
  useEffect(() => {
    props.dispatch(fetchAllMediaBins());
  }, []);

  // fetch groups when we bins change
  useEffect(() => {
    if (props.media.bins.length) {
      props.dispatch(fetchAllGroups());
    }
  }, [props.media.bins.length]);

  // fetch group files when navigating to group
  useEffect(() => {
    if (props.match.params.groupID) {
      props.dispatch(fetchGroupFiles(props.match.params.groupID));
    }
  }, [props.match.params.groupID]);

  // fetch bin files when navigating to bin
  useEffect(() => {
    if (props.match.params.binID) {
      props.dispatch(fetchBinFiles(props.match.params.binID));
    }
  }, [props.match.params.binID]);

  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={true}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <MediaSidebar nav={props.media.nav} />
        <div className={styles.WorkspaceContainer}>
          <MediaHeader
            currentBin={props.currentBin}
            currentGroup={props.currentGroup}
            showDeleteGroupModal={() => setDeleteGroupModal(true)}
          />
          <MediaWorkspace
            files={props.files}
            setFileDetails={setFileDetails}
            selected={selected}
            toggleSelected={toggleSelected}
          />
          <MediaSelected selected={selected} toggleSelected={toggleSelected} />
        </div>
        {fileDetails && (
          <MediaDetailsModal
            file={fileDetails}
            onClose={() => setFileDetails()}
          />
        )}
        {deleteGroupModal && (
          <MediaDeleteGroupModal
            onClose={() => setDeleteGroupModal(false)}
            currentGroup={props.currentGroup}
          />
        )}
      </WithLoader>
    </main>
  );
});
