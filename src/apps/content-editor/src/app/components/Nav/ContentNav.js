import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useHistory } from "react-router";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsAlt,
  faCaretDown,
  faCaretLeft,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import { ReorderNav } from "../ReorderNav";
import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";
import { Select, Option } from "@zesty-io/core/Select";
import { Search } from "@zesty-io/core/Search";

import { collapseNavItem, hideNavItem } from "../../../store/navContent";
import styles from "./ContentNav.less";

const ItemsFilter = props => {
  return (
    <Search
      className={styles.SearchModels}
      name="itemsFilter"
      placeholder="Filter name, zuid or path"
      onChange={term => {
        term = term.trim().toLowerCase();
        if (term) {
          props.setFilteredItems(
            props.nav.nav.raw.filter(f => {
              return (
                f.label === term ||
                f.contentModelZUID === term ||
                f.path === term ||
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

export function ContentNav(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [selected, setSelected] = useState(location.pathname);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [hiddenOpen, setHiddenOpen] = useState(false);

  const [filteredItems, setFilteredItems] = useState(
    props.nav.raw.sort(byLabel)
  );

  useEffect(() => {
    setFilteredItems(props.nav.raw.sort(byLabel));
  }, [props.nav]);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);

  const collapseNode = nodeProps => {
    dispatch(collapseNavItem(nodeProps.path));
  };

  const handleCreateSelect = ZUID => {
    if (ZUID && ZUID != "0") {
      history.push(`/content/${ZUID}/new`);
    }
  };

  const actions = [
    <FontAwesomeIcon
      title="Hide from nav"
      icon={faEyeSlash}
      onClick={props => {
        dispatch(hideNavItem(props.path));
      }}
    />
  ];

  const toggleModal = () => {
    setReorderOpen(!reorderOpen);
  };

  return (
    <React.Fragment>
      <ItemsFilter setFilteredItems={setFilteredItems} nav={props} />
      <div className={styles.Actions}>
        <Select
          name="createItemFromModel"
          className={`${styles.CreateSelect} ${styles.Select} CreateItemDropdown`}
          onSelect={handleCreateSelect}
          value="0"
        >
          <Option value="0" text="— Create Item —" />
          <Option value="link" text="Internal/External Link" />
          {Object.keys(props.models)
            .filter(modelZUID => {
              // exclude these special models from the create item list
              return !["widgets", "clippings", "globals"].includes(
                props?.models[modelZUID]?.name.toLowerCase()
              );
            })
            .sort((a, b) => {
              return props.models[a].label >= props.models[b].label ? 1 : -1;
            })
            .map(modelZUID => (
              <Option
                key={modelZUID}
                value={modelZUID}
                text={props.models[modelZUID].label}
              />
            ))}
        </Select>
        <Button id="ReorderNavButton" onClick={toggleModal}>
          <FontAwesomeIcon
            icon={faArrowsAlt}
            title="Re-order content navigation"
          />
        </Button>
      </div>

      <div className={styles.NavWrap}>
        <div className={styles.NavTitle}>
          <h1>Content</h1>
          <h1 className={styles.DashLink}>
            <Link to="/content">Dashboard</Link>
          </h1>
        </div>

        <Nav
          id="MainNavigation"
          className={styles.Nav}
          tree={filteredItems}
          selected={selected}
          collapseNode={collapseNode}
          actions={actions}
        />

        <h1 className={styles.NavTitle}>Headless Content Models</h1>
        <Nav
          id="HeadlessNavigation"
          className={styles.Nav}
          tree={filteredItems}
          selected={selected}
          collapseNode={collapseNode}
          actions={actions}
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
          <Nav
            id="HiddenNav"
            className={(styles.Nav, hiddenOpen ? "" : styles.HiddenNavClosed)}
            tree={filteredItems}
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        </div>
      </div>

      <ReorderNav isOpen={reorderOpen} toggleOpen={toggleModal} />
    </React.Fragment>
  );
}

const byLabel = (a, b) => {
  let labelA = a.label.toLowerCase().trim(); // ignore upper and lowercase
  let labelB = b.label.toLowerCase().trim(); // ignore upper and lowercase
  if (labelA < labelB) {
    return -1;
  }
  if (labelA > labelB) {
    return 1;
  }

  // names must be equal
  return 0;
};
