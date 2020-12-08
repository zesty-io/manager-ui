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
  return {
    media: state.media
  };
})(function MediaApp(props) {
  const history = useHistory();
  const { groupID, fileID } = useParams();
  const [currentGroup, setCurrentGroup] = useState();
  const [currentBin, setCurrentBin] = useState();
  const [files, setFiles] = useState({});
  const [fileDetails, setFileDetails] = useState();
  const [deleteGroupModal, setDeleteGroupModal] = useState(false);
  const [deleteFileModal, setDeleteFileModal] = useState(false);
  const [selected, setSelected] = useState([]);

  // update files
  useEffect(() => {
    if (groupID && props.media.files[groupID]) {
      console.log(groupID, props.media.files[groupID]);
      setFiles(props.media.files[groupID]);
    }
  }, [props.media.files[groupID]]);

  // update current group, bin
  useEffect(() => {
    if (groupID) {
      let newCurrentGroup;
      let newCurrentBin;
      // use bin as group
      newCurrentGroup = props.media.bins.find(bin => bin.id === groupID);
      if (newCurrentGroup) {
        newCurrentBin = newCurrentGroup;
      } else {
        newCurrentGroup = props.media.groups.find(
          group => group.id === groupID
        );
        if (newCurrentGroup) {
          newCurrentBin = props.media.bins.find(
            bin => bin.id === newCurrentGroup.bin_id
          );
        }
      }
      setCurrentBin(newCurrentBin);
      setCurrentGroup(newCurrentGroup);
    }
  }, [groupID, props.media.bins.length, props.media.groups.length]);

  // redirect to default bin if there is no group in URL
  useEffect(() => {
    if (!groupID && props.media.bins.length) {
      const currentBin = props.media.bins.find(bin => bin.default);
      history.push(`/dam/${currentBin.id}`);
    }
  }, [props.media.bins.length]);

  // open file details modal if fileID is in URL
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
    if (currentGroup) {
      if (currentGroup === currentBin) {
        props.dispatch(fetchBinFiles(currentGroup.id));
      } else {
        props.dispatch(fetchGroupFiles(currentGroup.id));
      }
    }
  }, [currentGroup]);

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
        condition={currentGroup}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <MediaSidebar
          nav={props.media.nav}
          currentGroup={currentGroup}
          currentBin={currentBin}
        />
        <div className={styles.WorkspaceContainer}>
          <MediaHeader
            currentBin={currentBin}
            currentGroup={currentGroup}
            showDeleteGroupModal={() => setDeleteGroupModal(true)}
          />
          <MediaWorkspace
            files={files}
            selected={selected}
            toggleSelected={toggleSelected}
            currentGroup={currentGroup}
          />
          <MediaSelected selected={selected} toggleSelected={toggleSelected} />
        </div>
        {fileDetails && (
          <MediaDetailsModal
            file={fileDetails}
            onClose={() => history.push(`/dam/${currentGroup.id}`)}
            showDeleteFileModal={() => setDeleteFileModal(true)}
          />
        )}
        {deleteFileModal && (
          <MediaDeleteFileModal
            onClose={() => setDeleteFileModal(false)}
            file={fileDetails}
            currentGroup={currentGroup}
          />
        )}
        {deleteGroupModal && (
          <MediaDeleteGroupModal
            onClose={() => setDeleteGroupModal(false)}
            currentGroup={currentGroup}
          />
        )}
      </WithLoader>
    </main>
  );
});
