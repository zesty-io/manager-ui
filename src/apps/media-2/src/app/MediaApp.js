import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
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
  let files = [];
  let currentGroup;
  let currentBin;
  if (props.match.params.groupID) {
    files = state.media.files.filter(
      file => file.group_id === props.match.params.groupID
    );
    // use bin as group
    currentGroup = state.media.bins.find(
      bin => bin.id === props.match.params.groupID
    );
    if (currentGroup) {
      currentBin = currentGroup;
    } else {
      currentGroup = state.media.groups.find(
        group => group.id === props.match.params.groupID
      );
      if (currentGroup) {
        currentBin = state.media.bins.find(
          bin => bin.id === currentGroup.bin_id
        );
      }
    }
  }
  return {
    currentGroup,
    currentBin,
    files,
    media: state.media
  };
})(function MediaApp(props) {
  const history = useHistory();
  const { groupID, fileID } = useParams();
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

  // redirect to default bin if there is no group in URL
  useEffect(() => {
    if (!groupID && props.media.bins.length) {
      const currentBin = props.media.bins.find(bin => bin.default);
      history.push(`/dam/${currentBin.id}`);
    }
  }, [props.media.bins.length]);

  useEffect(() => {
    if (fileID) {
      setFileDetails(props.media.files.find(file => file.id === fileID));
    } else {
      setFileDetails();
    }
  }, [props.media.files.length, fileID]);

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
    if (props.currentGroup) {
      if (props.currentGroup === props.currentBin) {
        props.dispatch(fetchBinFiles(props.currentGroup.id));
      } else {
        props.dispatch(fetchGroupFiles(props.currentGroup.id));
      }
    }
  }, [props.currentGroup]);

  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={props.currentGroup}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <MediaSidebar
          nav={props.media.nav}
          currentGroup={props.currentGroup}
          currentBin={props.currentBin}
        />
        <div className={styles.WorkspaceContainer}>
          <MediaHeader
            currentBin={props.currentBin}
            currentGroup={props.currentGroup}
            showDeleteGroupModal={() => setDeleteGroupModal(true)}
          />
          <MediaWorkspace
            files={props.files}
            selected={selected}
            toggleSelected={toggleSelected}
            currentGroup={props.currentGroup}
          />
          <MediaSelected selected={selected} toggleSelected={toggleSelected} />
        </div>
        {fileDetails && (
          <MediaDetailsModal
            file={fileDetails}
            onClose={() => history.push(`/dam/${props.currentGroup.id}`)}
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
