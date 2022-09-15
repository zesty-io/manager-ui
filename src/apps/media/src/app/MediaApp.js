import { useCallback, useEffect, useMemo, useState } from "react";
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
  selectGroup,
  clearSearch,
} from "shell/store/media";
import styles from "./MediaApp.less";

export default connect((state) => {
  return {
    media: state.media,
  };
})(function MediaApp(props) {
  const history = useHistory();
  const params = useParams();

  // current file for file details modal
  const [currentFileID, setCurrentFileID] = useState(params.fileID);
  const currentFile = useMemo(() => {
    return (
      props.media.files.find((file) => file.id === currentFileID) ||
      props.media.search.files.find((file) => file.id === currentFileID)
    );
  }, [currentFileID, props.media.files, props.media.search.files]);
  useEffect(() => {
    setCurrentFileID(params.fileID);
  }, [params.fileID]);

  // modal states
  const [deleteGroupModal, setDeleteGroupModal] = useState(false);
  const [deleteFileModal, setDeleteFileModal] = useState(false);

  // selected files for use in content modal
  const [selected, setSelected] = useState([]);

  // search term state
  const [searchTerm, setSearchTerm] = useState("");

  const [currentGroupID, setCurrentGroupID] = useState(
    params.groupID || props.groupID
  );
  useEffect(() => {
    setCurrentGroupID(params.groupID || props.groupID);
  }, [params.groupID, props.groupID]);

  // track previous group id so we can unselect group
  // when new groups are selected
  const previousGroupID = usePrevious(currentGroupID);

  const currentGroup = useMemo(() => {
    if (currentGroupID) {
      return props.media.groups[currentGroupID];
    }
  }, [currentGroupID, props.media.groups]);

  const currentBin = useMemo(() => {
    if (currentGroup) {
      return currentGroup.bin_id
        ? props.media.groups[currentGroup.bin_id]
        : currentGroup;
    }
  }, [currentGroup, props.media.groups]);

  function updateURL() {
    if (!props.modal) {
      if (currentGroupID) {
        if (currentFileID) {
          history.push(`/media/${currentGroupID}/file/${currentFileID}`);
        } else {
          history.push(`/media/${currentGroupID}`);
        }
      } else {
        history.push(`/media`);
      }
    }
  }

  // when currentGroupID changes, select group in redux
  useEffect(() => {
    const group = props.media.groups[currentGroupID];
    if (group && !group.selected) {
      props.dispatch(selectGroup({ currentGroupID, previousGroupID }));
    }
  }, [currentGroupID, props.media.groups]);

  // if no currentGroupID, set to default bin ID
  useEffect(() => {
    if (!currentGroupID && props.media.groups) {
      const binID =
        props.media.groups[0].children[0] || props.media.groups[1].children[0];
      if (binID) {
        setCurrentGroupID(binID);
      }
    }
    /*
      It is never valid to have a falsy currentGroupID
      The falsy check in this effect will prevent infinite rerenders
    */
  }, [props.media.groups, params.groupID, currentGroupID]);

  // update URL when currentGroupID or currentFileID changes
  useEffect(() => {
    updateURL();
  }, [currentFileID, currentGroupID]);

  // fetch all bins/groups on mount
  useEffect(() => {
    props.dispatch(fetchAllBins()).then(() => {
      props.dispatch(fetchAllGroups());
    });
  }, []);

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
      (selectedFile) => selectedFile.id === file.id
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
  const onPathChange = useCallback((path) => {
    setCurrentGroupID(path.split("/")[2]);
    // clear search in redux and local state
    props.dispatch(clearSearch());
    setSearchTerm("");
  }, []);

  const closeFileDetailsModal = useCallback(() => setCurrentFileID(), []);
  const showDeleteFileModal = useCallback(() => setDeleteFileModal(true), []);
  const closeAllFileModals = useCallback(() => {
    setDeleteFileModal(false);
    setCurrentFileID();
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
      className={cx(
        styles.MediaApp,
        props.groupID ? styles.MPSidebarActive : ""
      )}
    >
      <WithLoader
        condition={currentBin}
        message={
          props.media.groups[0].children.length ||
          props.media.groups[1].children.length
            ? "Loading Groups"
            : "Loading Bins"
        }
        height="calc(100vh - 54px)"
      >
        <DndProvider backend={HTML5Backend}>
          {
            // hide sidebar if we are locked to a group
            !props.groupID && (
              <MediaSidebar
                nav={props.media.nav}
                hiddenNav={props.media.hiddenNav}
                currentBin={currentBin}
                currentGroup={currentGroup}
                onPathChange={onPathChange}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            )
          }
          <div
            className={cx(
              styles.WorkspaceContainer,
              props.groupID ? styles.WkspSidebarLockedImage : ""
            )}
          >
            <MediaWorkspace
              {...workspaceProps}
              currentBin={currentBin}
              currentGroup={currentGroup}
              setCurrentFileID={setCurrentFileID}
              showDeleteGroupModal={showDeleteGroupModal}
              modal={props.modal}
              setCurrentGroupID={setCurrentGroupID}
            />
            {
              // only show selected strip in modal context
              props.modal && (
                <MediaSelected
                  selected={selected}
                  limitSelected={props.limitSelected}
                  toggleSelected={toggleSelected}
                  addImages={props.addImages}
                />
              )
            }
          </div>
          {currentFileID && currentFile && (
            <MediaDetailsModal
              file={currentFile}
              onClose={closeFileDetailsModal}
              showDeleteFileModal={showDeleteFileModal}
            />
          )}
          {deleteFileModal && (
            <MediaDeleteFileModal
              onClose={closeDeleteFileModal}
              onDelete={closeAllFileModals}
              file={currentFile}
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
