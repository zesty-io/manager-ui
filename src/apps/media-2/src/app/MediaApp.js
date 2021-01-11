import React, { useCallback, useEffect, useState } from "react";
import cx from "classnames";
import usePrevious from "react-use/lib/usePrevious";
import { useHistory, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { MediaSidebar } from "./components/MediaSidebar";
import { MediaWorkspace } from "./components/MediaWorkspace";
import { MediaDetailsModal } from "./components/MediaDetailsModal";
import { MediaDeleteGroupModal } from "./components/MediaDeleteGroupModal";
import { MediaDeleteFileModal } from "./components/MediaDeleteFileModal";
import { MediaSelected } from "./components/MediaSelected";
import {
  fetchAllBins,
  fetchAllGroups,
  fetchBinFiles,
  fetchGroupFiles,
  selectGroup
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

  const previousGroupID = usePrevious(currentGroupID);

  // when currentGroupID changes, update URL depending on modal context
  useEffect(() => {
    if (
      currentGroupID &&
      props.media.bins.length &&
      props.media.groups.length
    ) {
      props.dispatch(selectGroup({ currentGroupID, previousGroupID }));
      if (!props.modal) {
        history.push(`/dam/${currentGroupID}`);
      }
    }
  }, [currentGroupID, props.media.bins.length, props.media.groups.length]);

  // use default bin ID if we don't have currentGroupID
  useEffect(() => {
    if (!currentGroupID && props.media.bins.length) {
      const bin = props.media.bins.find(bin => bin.default);
      if (bin) {
        setCurrentGroupID(bin.id);
      }
    }
  }, [props.media.bins.length]);

  // update path when not in modal context and viewing file details
  useEffect(() => {
    if (currentGroupID && !props.modal) {
      let path;
      if (fileDetails) {
        path = `/dam/${currentGroupID}/file/${fileDetails.id}`;
      } else {
        path = `/dam/${currentGroupID}`;
      }
      history.push(path);
    }
  }, [fileDetails, currentGroupID]);

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
  }, [currentGroupID, props.media.bins, props.media.groups]);

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
  const onPathChange = useCallback(path => {
    setCurrentGroupID(path.split("/")[2]);
  }, []);

  const closeFileDetailsModal = useCallback(() => setFileDetails(), []);
  const showDeleteFileModal = useCallback(() => setDeleteFileModal(true), []);
  const closeAllFileModals = useCallback(() => {
    setDeleteFileModal(false);
    setFileDetails();
  }, []);
  const closeDeleteFileModal = useCallback(() => {
    setDeleteFileModal(false);
  }, []);
  const showDeleteGroupModal = useCallback(() => setDeleteGroupModal(true), []);
  const closeDeleteGroupModal = useCallback(
    () => setDeleteGroupModal(false),
    []
  );

  const workspaceProps = {};
  if (props.modal) {
    workspaceProps.toggleSelected = toggleSelected;
    workspaceProps.selected = selected;
  }

  return (
    <main
      className={cx(styles.MediaApp, props.groupID ? styles.MediaNosbar : "")}
    >
      <WithLoader
        condition={currentGroup}
        message={props.media.bins.length ? "Loading Groups" : "Loading Bins"}
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
              onPathChange={onPathChange}
              setCurrentGroupID={setCurrentGroupID}
            />
          )}
          <div
            className={cx(
              styles.WorkspaceContainer,
              props.groupID ? styles.WkspcNosbar : ""
            )}
          >
            <MediaWorkspace
              {...workspaceProps}
              currentBin={currentBin}
              currentGroup={currentGroup}
              showFileDetails={setFileDetails}
              showDeleteGroupModal={showDeleteGroupModal}
              modal={props.modal}
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
              onClose={closeFileDetailsModal}
              showDeleteFileModal={showDeleteFileModal}
            />
          )}
          {deleteFileModal && (
            <MediaDeleteFileModal
              onClose={closeDeleteFileModal}
              onDelete={closeAllFileModals}
              file={fileDetails}
              currentGroup={currentGroup}
            />
          )}
          {deleteGroupModal && (
            <MediaDeleteGroupModal
              onClose={closeDeleteGroupModal}
              currentGroup={currentGroup}
              setCurrentGroupID={setCurrentGroupID}
            />
          )}
        </DndProvider>
      </WithLoader>
    </main>
  );
});
