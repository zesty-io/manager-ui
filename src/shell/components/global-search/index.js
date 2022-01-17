import { useRef } from "react";

import { useNavigate } from "react-router-dom";
import { useMetaKey } from "shell/hooks/useMetaKey";

import ContentSearch from "shell/components/ContentSearch";
import { notify } from "shell/store/notifications";

export default function GlobalSearch(props) {
  const ref = useRef();
  const navigate = useNavigate();
  const metaShortcut = useMetaKey("k", "shift", () => {
    ref.current.focus();
  });

  const handleSelect = (item) => {
    if (item?.meta) {
      navigate(`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`);
    } else {
      props.dispatch(
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
      placeholder={`Global Search ${metaShortcut}`}
      onSelect={handleSelect}
      value=""
    />
  );
}
