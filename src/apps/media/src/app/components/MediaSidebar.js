import { memo, useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash/debounce";
import { Search } from "@zesty-io/core/Search";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faCaretDown,
  faCaretLeft,
  faEyeSlash,
  faFolder,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { Button } from "@zesty-io/core/Button";

import {
  uploadFile,
  closeGroup,
  hideGroup,
  searchFiles,
  clearSearch,
} from "shell/store/media";
import styles from "./MediaSidebar.less";
import { MediaNav } from "./MediaNav";

export const MediaSidebar = memo(function MediaSidebar(props) {
  const dispatch = useDispatch();

  const groups = useSelector((state) => state.media.groups);

  const [hiddenOpen, setHiddenOpen] = useState(false);
  const hiddenFileInput = useRef(null);

  const debouncedSearch = useCallback(
    debounce((term) => {
      const lowerCaseTerm = term.trim().toLowerCase();
      if (lowerCaseTerm) {
        dispatch(searchFiles(lowerCaseTerm));
      } else {
        dispatch(clearSearch());
      }
    }, 650),
    []
  );

  function handleUploadClick() {
    hiddenFileInput.current.click();
  }

  function handleFileInputChange(event) {
    Array.from(event.target.files).forEach((file) => {
      const fileToUpload = {
        file,
        bin_id: props.currentBin.id,
        group_id: props.currentGroup.id,
      };
      dispatch(uploadFile(fileToUpload, props.currentBin));
    });
  }

  const getVisibleChildren = (id) => {
    const group = groups[id];
    if (!group.closed && group.children) {
      // filter out hidden unless we are at hidden nav root
      const children =
        id === 1
          ? group.children
          : group.children.filter((id) => !groups[id].hidden);
      return children.map((id) => ({
        id,
        height: 32,
      }));
    }
  };

  const collapseNode = useCallback((id) => dispatch(closeGroup(id)), []);
  const hideNode = useCallback((id) => dispatch(hideGroup(id)), []);

  const rowRenderer = ({ id, style }) => {
    const group = groups[id];
    delete style.width;
    return (
      <li
        key={id}
        className={cx(styles.NavRow, group.selected ? styles.selected : null)}
        style={style}
        onClick={() => {
          props.onPathChange(group.path);
        }}
      >
        <FontAwesomeIcon icon={faFolder} />
        <p className={styles.NavRowText}>{group.name}</p>
        <FontAwesomeIcon
          className={styles.hide}
          onClick={(event) => {
            event.stopPropagation();
            hideNode(id);
          }}
          icon={faEyeSlash}
        />
        {group.children.length ? (
          <FontAwesomeIcon
            className={styles.collapse}
            onClick={(event) => {
              event.stopPropagation();
              collapseNode(id);
            }}
            icon={group.closed ? faCaretLeft : faCaretDown}
          />
        ) : null}
      </li>
    );
  };

  return (
    <nav className={cx(styles.Nav, hiddenOpen ? styles.hiddenOpen : null)}>
      <div className={styles.TopNav}>
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

        <Search
          type="search"
          className={cx(styles.Search, styles.SearchForm)}
          placeholder="Search your files"
          onChange={debouncedSearch}
        ></Search>
      </div>
      <MediaNav
        className={styles.MediaNav}
        rootID={0}
        getChildren={getVisibleChildren}
        rowRenderer={rowRenderer}
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
        {hiddenOpen ? (
          <MediaNav
            className={styles.MediaHiddenNav}
            rootID={1}
            getChildren={getVisibleChildren}
            rowRenderer={rowRenderer}
            onPathChange={props.onPathChange}
          />
        ) : null}
      </div>
    </nav>
  );
});
