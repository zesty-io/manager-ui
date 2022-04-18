import { Search } from "@zesty-io/core/Search";
import cx from "classnames";
import { useSelector } from "react-redux";
import styles from "./ContentNav.less";

const ItemsFilter = (props) => {
  const ui = useSelector((state) => state.ui);
  return (
    <Search
      className={cx(
        styles.SearchModels,
        ui.contentNavHover ? "" : styles.HideIcon
      )}
      name="itemsFilter"
      placeholder="Filter items by name, zuid or path"
      value={props.searchTerm}
      onChange={(term) => {
        props.setSearchTerm(term);
        term = term.trim().toLowerCase();
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
