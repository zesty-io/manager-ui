import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";

import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";

import { MediaCreateGroupModal } from "./MediaCreateGroupModal";
import styles from "./MediaSidebar.less";

export function MediaSidebar(props) {
  const [selected, setSelected] = useState(location.pathname);
  const [createGroupModal, setCreateGroupModal] = useState(false);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

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
      <Nav tree={props.nav} selected={selected} />
    </nav>
  );
}
