import React, { useEffect, useCallback, useRef } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";

import ContentSearch from "shell/components/ContentSearch";
import { notify } from "shell/store/notifications";

export default connect(state => {
  return {
    platform: state.platform
  };
})(function GlobalSearch(props) {
  const ref = useRef();
  const history = useHistory();

  const placeholder = `Global Search (${
    props.platform.isMac ? "CMD" : "CTRL"
  } + Shift + K)`;

  const focusGlobalSearch = useCallback(
    evt => {
      if (
        ((!props.platform.isMac && evt.ctrlKey) ||
          (props.platform.isMac && evt.metaKey)) &&
        evt.shiftKey &&
        evt.key === "K"
      ) {
        evt.preventDefault();
        ref.current.focus();
      }
    },
    [props.platform]
  );

  useEffect(() => {
    document.addEventListener("keydown", focusGlobalSearch);
    return () => {
      document.removeEventListener("keydown", focusGlobalSearch);
    };
  }, []);

  const handleSelect = item => {
    if (item?.meta) {
      history.push(`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`);
    } else {
      props.dispatch(
        notify({
          kind: "warn",
          message: "Selected item is missing meta data"
        })
      );
    }
  };

  return (
    <ContentSearch
      ref={ref}
      placeholder={placeholder}
      onSelect={handleSelect}
      value=""
    />
  );
});
