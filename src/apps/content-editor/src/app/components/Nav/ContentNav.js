import { Fragment, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useHistory } from "react-router";
import { Link } from "react-router-dom";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsAlt,
  faBan,
  faCaretDown,
  faCaretLeft,
  faEyeSlash,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { ReorderNav } from "../ReorderNav";
import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";
import { Select, Option } from "@zesty-io/core/Select";

import ItemsFilter from "./ItemsFilter";
import { collapseNavItem, hideNavItem } from "../../../store/navContent";

import styles from "./ContentNav.less";

export function ContentNav(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [selected, setSelected] = useState(location.pathname);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [hiddenOpen, setHiddenOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [filteredItems, setFilteredItems] = useState(
    props.nav.nav.sort(bySort)
  );

  useEffect(() => {
    setFilteredItems(props.nav.nav.sort(byLabel));
  }, [props.nav]);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location]);

  const collapseNode = (nodeProps) => {
    dispatch(collapseNavItem(nodeProps.path));
  };

  const handleCreateSelect = (ZUID) => {
    if (ZUID && ZUID != "0") {
      history.push(`/content/${ZUID}/new`);
    }
  };

  const actions = [
    <FontAwesomeIcon
      title="Hide from nav"
      icon={faEyeSlash}
      onClick={(props) => {
        dispatch(hideNavItem(props.path));
      }}
    />,
  ];

  const toggleModal = () => {
    setReorderOpen(!reorderOpen);
  };

  return (
    <Fragment>
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
            .filter((modelZUID) => {
              // exclude these special models from the create item list
              return !["widgets", "clippings", "globals"].includes(
                props?.models[modelZUID]?.name.toLowerCase()
              );
            })
            .sort((a, b) => {
              return props.models[a].label >= props.models[b].label ? 1 : -1;
            })
            .map((modelZUID) => (
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
      <ItemsFilter
        setFilteredItems={setFilteredItems}
        nav={props.nav}
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
      />
      <div className={styles.NavWrap}>
        <div className={styles.NavTitle}>
          <h1>Content</h1>

          <Link to="/content">
            {" "}
            <Button kind="outlined" type="tertiary" size="small">
              <FontAwesomeIcon icon={faHome} title="Dashboard" />
            </Button>
          </Link>
        </div>
        {searchTerm && filteredItems.length === 0 && (
          <>
            <h1 className={cx(styles.NavTitle, styles.NoResults)}>
              {" "}
              No Search Results for "{searchTerm}"{" "}
            </h1>
            <Button
              className={styles.ButtonClear}
              kind="secondary"
              onClick={() => setSearchTerm("")}
            >
              <FontAwesomeIcon icon={faBan} title="Clear Search" /> clear filter
            </Button>
          </>
        )}
        {searchTerm && (
          <Nav
            id="MainNavigation"
            className={styles.Nav}
            lightMode="true"
            tree={filteredItems}
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        )}
        {!searchTerm && (
          <Nav
            id="MainNavigation"
            lightMode="true"
            className={styles.Nav}
            tree={props.nav.nav}
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        )}
        {!searchTerm && (
          <h1 className={styles.NavTitle}>Headless Content Models</h1>
        )}
        {!searchTerm && (
          <Nav
            id="HeadlessNavigation"
            lightMode="true"
            className={styles.Nav}
            tree={props.nav.headless}
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        )}
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
            tree={props.nav.hidden}
            lightMode="true"
            selected={selected}
            collapseNode={collapseNode}
            actions={actions}
          />
        </div>
      </div>

      <ReorderNav isOpen={reorderOpen} toggleOpen={toggleModal} />
    </Fragment>
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

const bySort = (a, b) => {
  let aSort = a.sort == null ? 1000 : a.sort;
  let bSort = b.sort == null ? 1000 : b.sort;
  return aSort - bSort;
};
