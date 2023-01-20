import { useDispatch } from "react-redux";
import { useRef } from "react";

import { useHistory } from "react-router-dom";
import { useMetaKey } from "shell/hooks/useMetaKey";

import ContentSearch from "shell/components/ContentSearch";
import { notify } from "shell/store/notifications";

export default function GlobalSearch() {
  const dispatch = useDispatch();
  const ref = useRef();
  const history = useHistory();
  const metaShortcut = useMetaKey("k", "shift", () => {
    ref.current.focus();
  });

  const handleSelect = (item) => {
    if (item?.meta) {
      history.push(`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`);
    } else {
      dispatch(
        notify({
          kind: "warn",
          message: "Selected item is missing meta data",
        })
      );
    }
  };

  return (
    <ContentSearch
      ref={ref}
      placeholder="Search Instance"
      onSelect={handleSelect}
      value=""
    />
  );
}
