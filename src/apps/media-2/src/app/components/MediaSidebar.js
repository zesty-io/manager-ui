import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCaretLeft,
  faPlus,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import { Nav } from "@zesty-io/core/Nav";
import { NavDraggable } from "./NavDraggable";
import { Button } from "@zesty-io/core/Button";
import { closeGroup, hideGroup } from "shell/store/media";
import { MediaCreateGroupModal } from "./MediaCreateGroupModal";
import styles from "./MediaSidebar.less";

export const MediaSidebar = React.memo(function MediaSidebar(props) {
  const dispatch = useDispatch();
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [createGroupModal, setCreateGroupModal] = useState(false);

  const collapseNode = useCallback(id => dispatch(closeGroup(id)), []);

  const actions = useMemo(
    () => [
      {
        icon: "fas fa-eye-slash",
        onClick: node => {
          dispatch(hideGroup(node.id));
        }
      }
    ],
    []
  );

  return (
    <nav className={styles.Nav}>
      <div className={styles.TopNav}>
        <form className={styles.SearchForm} action="">
          <input type="text" placeholder="Search your files" name="search2" />
          <button type="submit" aria-label="Search">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>

        <Button
          aria-label="Create Group"
          kind="secondary"
          className={styles.CreateGroup}
          onClick={() => setCreateGroupModal(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Create Group</span>
        </Button>
        {createGroupModal && (
          <MediaCreateGroupModal
            currentGroup={props.currentGroup}
            currentBin={props.currentBin}
            onClose={() => setCreateGroupModal(false)}
            setCurrentGroupID={props.setCurrentGroupID}
          />
        )}
      </div>
      <NavDraggable
        tree={props.nav}
        selectedPath={props.selectedPath}
        collapseNode={collapseNode}
        actions={actions}
        onPathChange={props.onPathChange}
      />
      <div className={styles.HiddenNav}>
        <h1
          className={styles.NavTitle}
          onClick={() => setHiddenOpen(!hiddenOpen)}
        >
          <span style={{ flex: 1 }}>Hidden Items</span>
          {hiddenOpen ? (
            <FontAwesomeIcon icon={faCaretDown} />
          ) : (
            <FontAwesomeIcon icon={faCaretLeft} />
          )}
        </h1>
        <Nav
          className={hiddenOpen ? "" : styles.HiddenNavClosed}
          tree={props.hiddenNav}
          selected={props.selectedPath}
          collapseNode={collapseNode}
          actions={actions}
          onPathChange={props.onPathChange}
        />
      </div>
    </nav>
  );
});
