import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

export function MediaSidebar(props) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(location.pathname);
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [createGroupModal, setCreateGroupModal] = useState(false);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

  const collapseNode = node => dispatch(closeGroup(node.id));

  const actions = [
    {
      icon: "fas fa-eye-slash",
      onClick: node => {
        dispatch(hideGroup(node.id));
      }
    }
  ];

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
          />
        )}
      </div>
      <DndProvider backend={HTML5Backend}>
        <NavDraggable
          tree={props.nav}
          selected={selected}
          collapseNode={collapseNode}
          actions={actions}
        />
      </DndProvider>
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
          selected={selected}
          collapseNode={collapseNode}
          actions={actions}
        />
      </div>
    </nav>
  );
}
