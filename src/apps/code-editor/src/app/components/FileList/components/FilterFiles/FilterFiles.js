import { Search } from "@zesty-io/core/Search";

import styles from "./FilterFiles.less";
export function FilterFiles(props) {
  return (
    <Search
      name="filterFiles"
      placeholder="Filter file list by name, zuid or code"
      className={styles.FilterFiles}
      onChange={(term) => {
        term = term.trim().toLowerCase();
        if (term) {
          props.setShownFiles(
            props.nav.raw.filter((f) => {
              return (
                f.fileName.toLowerCase().includes(term) ||
                f.contentModelZUID === term ||
                f.contentModelType === term ||
                f.version === term ||
                f.ZUID === term
              );
            })
          );
        } else {
          props.setShownFiles(props.nav.tree);
        }
      }}
    />
  );
}
