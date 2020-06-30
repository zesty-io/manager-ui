import React from "react";
import ContentSearch from "shell/components/ContentSearch";
import { useHistory } from "react-router-dom";

export default function GlobalSearch(props) {
  const history = useHistory();
  return (
    <ContentSearch
      clearSearchOnSelect={true}
      clearSearchOnClickOutside={true}
      onSelect={item => {
        history.push(
          `/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`
        );
      }}
    />
  );
}
