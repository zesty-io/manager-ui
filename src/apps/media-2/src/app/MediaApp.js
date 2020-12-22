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
  fetchAllBins,
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
      setCurrentGroupID(bin.id);
    }
  }, [props.media.bins.length]);

  // update path when not in modal context and viewing file details
  useEffect(() => {
    if (!props.modal) {
      let path;
      if (fileDetails) {
        path = `/dam/${currentGroupID}/file/${fileDetails.id}`;
      } else {
        path = `/dam/${currentGroupID}`;
      }
      history.push(path);
    }
  }, [fileDetails]);

  function showFileDetails(fileID) {
    if (fileID) {
      const file = props.media.files.find(file => file.id === fileID);
      if (file) {
        setFileDetails(file);
      }
    } else {
      setFileDetails();
    }
  }

  // fetch all bins on mount
  useEffect(() => {
    props.dispatch(fetchAllBins());
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
    } else if (!props.limitSelected || selected.length < props.limitSelected) {
      setSelected([...selected, file]);
    }
  }

  // update currentGroupID on Nav path change
  function onPathChange(path) {
    setCurrentGroupID(path.split("/")[2]);
  }

  const workspaceProps = {};
  if (props.modal) {
    workspaceProps.toggleSelected = toggleSelected;
    workspaceProps.selected = selected;
  }

  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={currentGroup}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <DndProvider backend={HTML5Backend}>
          {// hide sidebar if we are locked to a group
          !props.groupID && (
            <MediaSidebar
              nav={props.media.nav}
              hiddenNav={props.media.hiddenNav}
              currentBin={currentBin}
              currentGroup={currentGroup}
              currentPath={currentPath}
              onPathChange={onPathChange}
              setCurrentGroupID={setCurrentGroupID}
            />
          )}
          <div className={styles.WorkspaceContainer}>
            <MediaHeader
              currentBin={currentBin}
              currentGroup={currentGroup}
              showDeleteGroupModal={() => setDeleteGroupModal(true)}
            />
            <MediaWorkspace
              {...workspaceProps}
              currentBin={currentBin}
              currentGroup={currentGroup}
              showFileDetails={showFileDetails}
            />
            {// only show selected strip in modal context
            props.modal && (
              <MediaSelected
                selected={selected}
                toggleSelected={toggleSelected}
                addImages={props.addImages}
              />
            )}
          </div>
          {fileDetails && (
            <MediaDetailsModal
              file={fileDetails}
              onClose={() => setFileDetails()}
              showDeleteFileModal={() => setDeleteFileModal(true)}
            />
          )}
          {deleteFileModal && (
            <MediaDeleteFileModal
              onClose={() => {
                setDeleteFileModal(false);
                setFileDetails();
              }}
              file={fileDetails}
              currentGroup={currentGroup}
            />
          )}
          {deleteGroupModal && (
            <MediaDeleteGroupModal
              onClose={() => setDeleteGroupModal(false)}
              currentGroup={currentGroup}
              setCurrentGroupID={setCurrentGroupID}
            />
          )}
        </DndProvider>
      </WithLoader>
    </main>
  );
});
