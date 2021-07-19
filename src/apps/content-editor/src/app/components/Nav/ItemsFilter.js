import { Search } from "@zesty-io/core/Search";
import styles from "./ContentNav.less";
import cx from "classnames";

const ItemsFilter = (props) => {
  return (
    <Search
      className={styles.SearchModels}
      name="itemsFilter"
      placeholder="Filter items by name, zuid or path"
      value={props.searchTerm}
      roundedEdge="true"
      onChange={(term) => {
        term = term.trim().toLowerCase();
        props.setSearchTerm(term);
        if (term != "") {
          props.setFilteredItems(
            props.nav.raw.filter((f) => {
              return (
                f.label.toLowerCase().includes(term) ||
                f.path.toLowerCase().includes(term) ||
                f.contentModelZUID === term ||
                f.ZUID === term
              );
            })
          );
        } else {
          props.setFilteredItems(props.nav.nav);
        }
      }}
    />
  );
};

export default ItemsFilter;
