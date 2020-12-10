import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { MediaSidebar } from "./components/MediaSidebar";
import { MediaWorkspace } from "./components/MediaWorkspace";
import { MediaHeader } from "./components/MediaHeader";
import { MediaDetailsModal } from "./components/MediaDetailsModal";
import { MediaDeleteGroupModal } from "./components/MediaDeleteGroupModal";
import { MediaDeleteFileModal } from "./components/MediaDeleteFileModal";
import { MediaSelected } from "./components/MediaSelected";

import {
  fetchAllMediaBins,
  fetchAllGroups,
  fetchBinFiles,
  fetchGroupFiles
} from "shell/store/media";
import styles from "./MediaApp.less";

export default connect((state, props) => {
  let currentGroup;
  let currentBin;
  // use bin as group
  if (props.match.params.groupID) {
    currentGroup =
      state.media.bins.find(bin => bin.id === props.match.params.groupID) ||
      state.media.groups.find(group => group.id === props.match.params.groupID);
    if (currentGroup) {
      currentBin = currentGroup.bin_id
        ? state.media.bins.find(bin => bin.id === currentGroup.bin_id)
        : currentGroup;
    }
  }
  return {
    currentGroup,
    currentBin,
    media: state.media
  };
})(function MediaApp(props) {
  const history = useHistory();
  const params = useParams();
  const [fileDetails, setFileDetails] = useState();
  const [deleteGroupModal, setDeleteGroupModal] = useState(false);
  const [deleteFileModal, setDeleteFileModal] = useState(false);
  const [selected, setSelected] = useState([]);

  // always fetch all bins
  useEffect(() => {
    props.dispatch(fetchAllMediaBins());
  }, []);

  // redirect to default bin if there is no group in URL
  useEffect(() => {
    if (!params.groupID && props.media.bins.length) {
      const bin = props.media.bins.find(bin => bin.default);
      history.push(`/dam/${bin.id}`);
    }
  }, [props.media.bins.length]);

  // open file details modal if params.fileID is in URL
  useEffect(() => {
    if (params.fileID) {
      const file = props.media.files.find(file => file.id === params.fileID);
      if (file) {
        setFileDetails(file);
      }
    } else {
      setFileDetails();
    }
  }, [params.fileID]);

  // fetch groups when we bins change
  useEffect(() => {
    if (props.media.bins.length) {
      props.dispatch(fetchAllGroups());
    }
  }, [props.media.bins.length]);

  // fetch group files when navigating to group
  useEffect(() => {
    if (props.currentGroup) {
      if (!props.currentGroup.bin_id) {
        props.dispatch(fetchBinFiles(props.currentGroup.id));
      } else {
        props.dispatch(fetchGroupFiles(props.currentGroup.id));
      }
    }
  }, [props.currentGroup && props.currentGroup.id]);

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

  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={props.currentGroup}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <MediaSidebar
          nav={props.media.nav}
          hiddenNav={props.media.hiddenNav}
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
            showDeleteFileModal={() => setDeleteFileModal(true)}
          />
        )}
        {deleteFileModal && (
          <MediaDeleteFileModal
            onClose={() => setDeleteFileModal(false)}
            file={fileDetails}
            currentGroup={props.currentGroup}
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
