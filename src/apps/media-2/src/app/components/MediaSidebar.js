import React, { useCallback, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faCaretDown,
  faCaretLeft,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

// import { NavDraggable } from "./NavDraggable";
import { Button } from "@zesty-io/core/Button";
import { uploadFile } from "shell/store/media";

import styles from "./MediaSidebar.less";

import { MediaNav } from "./MediaNav";

export const MediaSidebar = React.memo(function MediaSidebar(props) {
  const dispatch = useDispatch();
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const hiddenFileInput = useRef(null);

  function handleUploadClick() {
    hiddenFileInput.current.click();
  }

  function handleFileInputChange(event) {
    Array.from(event.target.files).forEach(file => {
      const fileToUpload = {
        file,
        bin_id: props.currentBin.id,
        group_id: props.currentGroup.id
      };
      dispatch(uploadFile(fileToUpload, props.currentBin));
    });
  }

  // const actions = useMemo(
  //   () => [
  //     {
  //       icon: "fas fa-eye-slash",
  //       onClick: node => {
  //         dispatch(hideGroup(node.id));
  //       }
  //     }
  //   ],
  //   []
  // );

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
          aria-label="Upload"
          className={styles.PadLeft}
          kind="secondary"
          className={styles.Upload}
          onClick={handleUploadClick}
        >
          <FontAwesomeIcon icon={faUpload} />
          <span>Upload</span>
        </Button>
        <input
          type="file"
          multiple
          ref={hiddenFileInput}
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />
      </div>
      <MediaNav onPathChange={props.onPathChange} />
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
        {/* <NavDraggable
          tree={props.hiddenNav}
          className={hiddenOpen ? "" : styles.HiddenNavClosed}
          collapseNode={collapseNode}
          actions={actions}
          onPathChange={props.onPathChange}
        /> */}
      </div>
    </nav>
  );
});
