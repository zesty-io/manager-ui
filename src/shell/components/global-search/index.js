import React, { useEffect, useCallback, useRef } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";

import ContentSearch from "shell/components/ContentSearch";

export default connect(state => {
  return {
    platform: state.platform,
    languages: state.languages
  };
})(function GlobalSearch(props) {
  const searchRef = useRef();
  const focusGlobalSearch = useCallback(
    evt => {
      if (
        ((!props.platform.isMac && evt.ctrlKey) ||
          (props.platform.isMac && evt.metaKey)) &&
        evt.shiftKey &&
        evt.key === "K"
      ) {
        evt.preventDefault();
        searchRef.current.focus();
      }
    },
    [props.platform]
  );
  const history = useHistory();
  useEffect(() => {
    document.addEventListener("keydown", focusGlobalSearch);
    return () => {
      document.removeEventListener("keydown", focusGlobalSearch);
    };
  }, []);
  return (
    <ContentSearch
      ref={searchRef}
      clearSearchOnSelect={true}
      clearSearchOnClickOutside={true}
      placeholder={`Global Search (${
        props.platform.isMac ? "CMD" : "CTRL"
      } + Shift + K)`}
      onSelect={item => {
        history.push(
          `/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`
        );
      }}
      languages={props.languages}
    />
  );
});
