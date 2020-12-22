import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

export default connect(state => {
  return {
    media: state.media
  };
})(function MediaApp(props) {
  const history = useHistory();
  const params = useParams();
  const [fileDetails, setFileDetails] = useState();
  const [deleteGroupModal, setDeleteGroupModal] = useState(false);
  const [deleteFileModal, setDeleteFileModal] = useState(false);

  // selected files for use in modal
  const [selected, setSelected] = useState([]);

  // derived state from currentGroupID and state.media
  const [currentGroup, setCurrentGroup] = useState();
  const [currentBin, setCurrentBin] = useState();

  // track currentGroupID, defaulting to groupID in URL or passed as props
  const [currentGroupID, setCurrentGroupID] = useState(
    params.groupID || props.groupID
  );

  // track path in both modal and non-modal contexts
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // update currentPath on URL change
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  // when currentGroup changes, update currentPath or URL depending on modal context
  useEffect(() => {
    if (currentGroupID) {
      const path = `/dam/${currentGroupID}`;
      if (props.modal) {
        setCurrentPath(path);
      } else {
        history.push(path);
      }
    }
  }, [currentGroupID]);

  // use default bin ID if we don't have currentGroupID
  useEffect(() => {
    if (!currentGroupID && props.media.bins.length) {
      const bin = props.media.bins.find(bin => bin.default);
      if (!props.modal) {
        history.push(`/dam/${bin.id}`);
      }
      setCurrentGroupID(bin.id);
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

  // fetch all bins on mount
  useEffect(() => {
    props.dispatch(fetchAllMediaBins());
  }, []);

  // fetch groups when we get new bins
  useEffect(() => {
    if (props.media.bins.length) {
      props.dispatch(fetchAllGroups());
    }
  }, [props.media.bins.length]);

  // always recompute currentGroup, currentBin to get loading state
  useEffect(() => {
    let newCurrentGroup;
    let newCurrentBin;
    if (
      currentGroupID &&
      props.media.bins.length &&
      props.media.groups.length
    ) {
      newCurrentGroup =
        // search bins and groups
        props.media.bins.find(bin => bin.id === currentGroupID) ||
        props.media.groups.find(group => group.id === currentGroupID);
      if (newCurrentGroup) {
        newCurrentBin = newCurrentGroup.bin_id
          ? props.media.bins.find(bin => bin.id === newCurrentGroup.bin_id)
          : newCurrentGroup;
      }
      setCurrentGroup(newCurrentGroup);
      setCurrentBin(newCurrentBin);
    }
  });

  // fetch group files when navigating to group
  useEffect(() => {
    if (currentGroup) {
      if (!currentGroup.bin_id) {
        props.dispatch(fetchBinFiles(currentGroup.id));
      } else {
        props.dispatch(fetchGroupFiles(currentGroup.id));
      }
    }
  }, [currentGroup && currentGroup.id]);

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

  // update currentGroupID on Nav path change
  function onPathChange(path) {
    setCurrentGroupID(path.split("/")[2]);
  }

  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={currentGroup}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <DndProvider backend={HTML5Backend}>
          <MediaSidebar
            nav={props.media.nav}
            hiddenNav={props.media.hiddenNav}
            currentBin={currentBin}
            currentGroup={currentGroup}
            currentPath={currentPath}
            onPathChange={onPathChange}
          />
          <div className={styles.WorkspaceContainer}>
            <MediaHeader
              currentBin={currentBin}
              currentGroup={currentGroup}
              showDeleteGroupModal={() => setDeleteGroupModal(true)}
            />
            <MediaWorkspace
              selected={selected}
              toggleSelected={toggleSelected}
              currentBin={currentBin}
              currentGroup={currentGroup}
            />
            <MediaSelected
              selected={selected}
              toggleSelected={toggleSelected}
              addImages={props.addImages}
            />
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
        </DndProvider>
      </WithLoader>
    </main>
  );
});
